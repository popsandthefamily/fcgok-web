import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';
import type { OrgConfig } from '@/lib/config/industries';

const USER_AGENT = process.env.SEC_EDGAR_USER_AGENT ?? 'FrontierConsultingGroup info@fcgok.com';

// CMBS trusts file a monthly ABS-EE XML (loan-level tape) to EDGAR. Property
// type SS = self-storage. We scan the latest ABS-EE per trust, pull SS loans,
// and emit distress signals for any loan hitting one of:
//   • modifiedIndicator = true          (workout — loan has been modified)
//   • nonRecoverabilityIndicator = true (servicer considers it unrecoverable)
//   • paymentStatusLoanCode in {1..5}   (30+ days delinquent or worse)
//   • DSCR < 1.20                       (undercover on debt service)
//   • maturityDate within 90 days + balance > 0 (maturity risk)
//
// CREFC payment status codes: https://www.crefc.org/CREFC/Industry_Standards/
//   A = Current, 0 = Grace, 1 = 30-days late, 2 = 60, 3 = 90+,
//   4 = Performing Matured Balloon, 5 = Non-Performing Matured Balloon,
//   6 = Bankrupt, 7 = Foreclosure, 8 = REO, 9 = Paid Off

const MAX_TRUSTS_PER_RUN = 80;          // keep serverless invocation under 60s
const LOOKBACK_DAYS = 45;                // monthly filings + a buffer
const DSCR_DISTRESS_THRESHOLD = 1.2;
const MATURITY_HORIZON_DAYS = 90;
const DELINQUENT_CODES = new Set(['1', '2', '3', '5', '6', '7', '8']);

// Free-text patterns that identify CMBS trusts among all ABS-EE filers
// (the form also covers auto loans, credit cards, student loans, etc.).
const CMBS_NAME_PATTERNS = [
  /mortgage trust/i,
  /commercial mortgage/i,
  /mortgage securities/i,
  /benchmark \d+/i,
  /\bBMARK\b/,
  /\bBANK \d/,
  /\bBBCMS\b/,
  /\bWFCM\b/,
  /\bJPMCC\b/,
  /\bJPMDB\b/,
  /\bGSMS\b/,
  /\bMSBAM\b/,
  /\bMSC\b/,
  /\bCGCMT\b/,
  /\bCSAIL\b/,
];

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  SS: 'Self-Storage',
  MF: 'Multifamily',
  OF: 'Office',
  RT: 'Retail',
  IN: 'Industrial',
  LO: 'Lodging',
  MH: 'Manufactured Housing',
  MU: 'Mixed Use',
  WH: 'Warehouse',
  HC: 'Healthcare',
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  A: 'Current',
  '0': 'Grace Period',
  '1': '30+ Days Delinquent',
  '2': '60+ Days Delinquent',
  '3': '90+ Days Delinquent',
  '4': 'Performing Matured Balloon',
  '5': 'Non-Performing Matured Balloon',
  '6': 'Bankrupt',
  '7': 'In Foreclosure',
  '8': 'REO',
  '9': 'Paid Off',
};

interface TrustFiling {
  cik: string;
  trustName: string;
  accession: string;
  filingDate: string;
}

interface LoanRecord {
  assetNumber: string;
  propertyTypeCode: string;
  propertyName: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  largestTenant: string | null;
  reportPeriodEnd: string | null;
  balance: number | null;
  originalAmount: number | null;
  maturityDate: string | null;
  dscrNOI: number | null;
  dscrNCF: number | null;
  occupancy: number | null;
  modifiedIndicator: boolean;
  nonRecoverabilityIndicator: boolean;
  paymentStatusLoanCode: string | null;
  assetSubjectDemandIndicator: boolean;
  propertyStatusCode: string | null;
}

interface DistressFinding {
  loan: LoanRecord;
  reasons: string[];
  severity: 'critical' | 'elevated' | 'watchlist';
}

function textBetween(haystack: string, tag: string): string | null {
  const m = haystack.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].trim() : null;
}

function numOrNull(s: string | null): number | null {
  if (s === null || s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function boolIndicator(s: string | null): boolean {
  return s === 'true' || s === '1';
}

// ABS-EE dates come as MM-DD-YYYY — normalize to ISO for storage.
function mdyToIso(s: string | null): string | null {
  if (!s) return null;
  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[1]}-${m[2]}`;
}

function parseAssets(xml: string): LoanRecord[] {
  // Each loan record is an <assets>...</assets> block at the top level.
  const loans: LoanRecord[] = [];
  const assetRe = /<assets>([\s\S]*?)<\/assets>/g;
  let m: RegExpExecArray | null;
  while ((m = assetRe.exec(xml)) !== null) {
    const body = m[1];
    const propertyBlock = body.match(/<property>([\s\S]*?)<\/property>/);
    const prop = propertyBlock ? propertyBlock[1] : '';
    loans.push({
      assetNumber: textBetween(body, 'assetNumber') ?? '',
      propertyTypeCode: textBetween(prop, 'propertyTypeCode') ?? '',
      propertyName: textBetween(prop, 'propertyName') ?? '',
      propertyCity: textBetween(prop, 'propertyCity') ?? '',
      propertyState: textBetween(prop, 'propertyState') ?? '',
      propertyZip: textBetween(prop, 'propertyZip') ?? '',
      largestTenant: textBetween(prop, 'largestTenant'),
      reportPeriodEnd: mdyToIso(textBetween(body, 'reportingPeriodEndDate')),
      balance: numOrNull(textBetween(body, 'reportPeriodEndActualBalanceAmount')),
      originalAmount: numOrNull(textBetween(body, 'originalLoanAmount')),
      maturityDate: mdyToIso(textBetween(body, 'maturityDate')),
      dscrNOI: numOrNull(
        textBetween(body, 'debtServiceCoverageNetOperatingIncomeSecuritizationPercentage'),
      ),
      dscrNCF: numOrNull(
        textBetween(body, 'debtServiceCoverageNetCashFlowSecuritizationPercentage'),
      ),
      occupancy: numOrNull(textBetween(prop, 'physicalOccupancySecuritizationPercentage')),
      modifiedIndicator: boolIndicator(textBetween(body, 'modifiedIndicator')),
      nonRecoverabilityIndicator: boolIndicator(textBetween(body, 'nonRecoverabilityIndicator')),
      paymentStatusLoanCode: textBetween(body, 'paymentStatusLoanCode'),
      assetSubjectDemandIndicator: boolIndicator(textBetween(body, 'assetSubjectDemandIndicator')),
      propertyStatusCode: textBetween(prop, 'propertyStatusCode'),
    });
  }
  return loans;
}

function evaluateDistress(loan: LoanRecord): DistressFinding | null {
  const reasons: string[] = [];
  let severity: DistressFinding['severity'] = 'watchlist';

  if (loan.nonRecoverabilityIndicator) {
    reasons.push('Servicer flagged as non-recoverable');
    severity = 'critical';
  }
  if (loan.paymentStatusLoanCode && DELINQUENT_CODES.has(loan.paymentStatusLoanCode)) {
    const label = PAYMENT_STATUS_LABEL[loan.paymentStatusLoanCode] ?? loan.paymentStatusLoanCode;
    reasons.push(`Payment status: ${label}`);
    // REO / foreclosure / bankrupt / non-performing matured = critical
    if (['5', '6', '7', '8'].includes(loan.paymentStatusLoanCode)) severity = 'critical';
    else if (severity === 'watchlist') severity = 'elevated';
  }
  if (loan.modifiedIndicator) {
    reasons.push('Loan has been modified (workout)');
    if (severity === 'watchlist') severity = 'elevated';
  }
  if (loan.assetSubjectDemandIndicator) {
    reasons.push('Asset subject to repurchase demand');
    if (severity === 'watchlist') severity = 'elevated';
  }
  if (loan.dscrNOI !== null && loan.dscrNOI < DSCR_DISTRESS_THRESHOLD) {
    reasons.push(`DSCR-NOI below ${DSCR_DISTRESS_THRESHOLD}: ${loan.dscrNOI.toFixed(2)}`);
    if (severity === 'watchlist') severity = 'elevated';
  } else if (loan.dscrNCF !== null && loan.dscrNCF < DSCR_DISTRESS_THRESHOLD) {
    reasons.push(`DSCR-NCF below ${DSCR_DISTRESS_THRESHOLD}: ${loan.dscrNCF.toFixed(2)}`);
    if (severity === 'watchlist') severity = 'elevated';
  }
  if (loan.maturityDate && loan.balance !== null && loan.balance > 0) {
    const days = (new Date(loan.maturityDate).getTime() - Date.now()) / 86_400_000;
    if (days >= 0 && days <= MATURITY_HORIZON_DAYS) {
      reasons.push(`Matures in ${Math.round(days)} days with $${Math.round(loan.balance).toLocaleString()} outstanding`);
      if (severity === 'watchlist') severity = 'elevated';
    }
  }

  if (reasons.length === 0) return null;
  return { loan, reasons, severity };
}

async function discoverCmbsTrusts(): Promise<TrustFiling[]> {
  // EDGAR full-text search for recent ABS-EE filings, then filter client-side
  // to CMBS-named entities. EFTS pagination is limited — we grab a big page
  // and rely on the name filter to cut auto/credit-card trusts.
  const start = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString().slice(0, 10);
  const end = new Date().toISOString().slice(0, 10);
  const url = `https://efts.sec.gov/LATEST/search-index?q=mortgage&forms=ABS-EE&dateRange=custom&startdt=${start}&enddt=${end}`;

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return [];
  const data = await res.json();
  const hits = (data?.hits?.hits ?? []) as Array<{
    _source: {
      ciks?: string[];
      display_names?: string[];
      file_date?: string;
      accession_no?: string;
    };
  }>;

  const seen = new Set<string>();
  const trusts: TrustFiling[] = [];
  for (const h of hits) {
    const s = h._source;
    const cik = s.ciks?.[0];
    const name = s.display_names?.[0] ?? '';
    if (!cik || seen.has(cik)) continue;
    if (!CMBS_NAME_PATTERNS.some((re) => re.test(name))) continue;
    seen.add(cik);
    trusts.push({
      cik: cik.replace(/^0+/, ''),
      trustName: name.replace(/\s*\(CIK [^)]+\)\s*$/, '').trim(),
      accession: s.accession_no ?? '',
      filingDate: s.file_date ?? '',
    });
    if (trusts.length >= MAX_TRUSTS_PER_RUN) break;
  }
  return trusts;
}

async function fetchLatestAbsEeUrl(cik: string): Promise<{ accession: string; xmlUrl: string } | null> {
  const url = `https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return null;
  const data = await res.json();
  const recent = data.filings?.recent;
  if (!recent) return null;

  const count = Math.min(recent.form?.length ?? 0, 20);
  for (let i = 0; i < count; i++) {
    if (recent.form?.[i] !== 'ABS-EE') continue;
    const accession = recent.accessionNumber[i] as string;
    const accDashed = accession.replace(/-/g, '');
    // Fetch the filing index to locate the asset-data XML (filename varies).
    const indexUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accDashed}/`;
    const indexRes = await fetch(indexUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!indexRes.ok) continue;
    const indexHtml = await indexRes.text();
    // Asset-data tape filename varies by filer:
    //   exh_102.xml (JPMCC / Wells servicer filings)
    //   exh102.xml / ex102.xml / ex_102.xml (Benchmark / Citigroup / etc.)
    // 103 is the asset-related-document exhibit (different form).
    const xmlMatch = indexHtml.match(/href="([^"]*\bex_?h?_?102[^"]*\.xml)"/i);
    if (!xmlMatch) continue;
    const xmlUrl = xmlMatch[1].startsWith('http') ? xmlMatch[1] : `https://www.sec.gov${xmlMatch[1]}`;
    return { accession, xmlUrl };
  }
  return null;
}

export async function ingestCmbsAbsEe(
  config: OrgConfig,
  orgSlug: string,
): Promise<{ ingested: number; skipped: number }> {
  if (config.industry !== 'self-storage') return { ingested: 0, skipped: 0 };

  const supabase = await createServiceClient();
  let ingested = 0;
  let skipped = 0;

  const trusts = await discoverCmbsTrusts();

  for (const trust of trusts) {
    try {
      const latest = await fetchLatestAbsEeUrl(trust.cik);
      if (!latest) continue;

      const xmlRes = await fetch(latest.xmlUrl, { headers: { 'User-Agent': USER_AGENT } });
      if (!xmlRes.ok) continue;
      const xml = await xmlRes.text();
      const loans = parseAssets(xml);
      const ssLoans = loans.filter((l) => l.propertyTypeCode === 'SS');

      for (const loan of ssLoans) {
        const finding = evaluateDistress(loan);
        if (!finding) continue;

        const loanKey = `cmbs-${trust.cik}-${loan.assetNumber}`;
        const hash = urlHash(loanKey);
        const filingIndex = `https://www.sec.gov/Archives/edgar/data/${trust.cik}/${latest.accession.replace(/-/g, '')}/${latest.accession}-index.htm`;

        const locPart =
          loan.propertyCity && loan.propertyState
            ? ` (${loan.propertyCity}, ${loan.propertyState})`
            : loan.propertyState
              ? ` (${loan.propertyState})`
              : '';
        const title = `CMBS Distress — ${loan.propertyName || 'Self-Storage Loan'}${locPart}: ${finding.reasons[0]}`;

        const body = [
          `${PROPERTY_TYPE_LABEL[loan.propertyTypeCode] ?? loan.propertyTypeCode} loan in ${trust.trustName}.`,
          '',
          `Property: ${loan.propertyName || '(unnamed)'}${loan.largestTenant ? ` — tenant: ${loan.largestTenant}` : ''}`,
          `Location: ${loan.propertyCity}, ${loan.propertyState} ${loan.propertyZip}`,
          loan.originalAmount !== null
            ? `Original loan: $${Math.round(loan.originalAmount).toLocaleString()}`
            : null,
          loan.balance !== null
            ? `Current balance: $${Math.round(loan.balance).toLocaleString()}`
            : null,
          loan.maturityDate ? `Matures: ${loan.maturityDate}` : null,
          loan.dscrNOI !== null ? `DSCR (NOI): ${loan.dscrNOI.toFixed(2)}` : null,
          loan.occupancy !== null ? `Occupancy: ${Math.round(loan.occupancy * 100)}%` : null,
          '',
          `Distress signals:`,
          ...finding.reasons.map((r) => `• ${r}`),
          '',
          `Filing: ${filingIndex}`,
        ]
          .filter((l) => l !== null)
          .join('\n');

        const { data: existing } = await supabase
          .from('intel_items')
          .select('id')
          .eq('metadata->>url_hash', hash)
          .contains('client_visibility', [orgSlug])
          .limit(1);

        const common = {
          source: 'sec' as const,
          source_url: filingIndex,
          title,
          body,
          published_at: loan.reportPeriodEnd ? new Date(loan.reportPeriodEnd).toISOString() : null,
          category: 'distress' as const,
          client_visibility: [orgSlug],
          metadata: {
            url_hash: hash,
            subtype: 'cmbs_abs_ee',
            trust_cik: trust.cik,
            trust_name: trust.trustName,
            accession_number: latest.accession,
            report_period_end: loan.reportPeriodEnd,
            asset_number: loan.assetNumber,
            property_name: loan.propertyName,
            property_city: loan.propertyCity,
            property_state: loan.propertyState,
            property_zip: loan.propertyZip,
            property_type_code: loan.propertyTypeCode,
            largest_tenant: loan.largestTenant,
            balance: loan.balance,
            original_amount: loan.originalAmount,
            maturity_date: loan.maturityDate,
            dscr_noi: loan.dscrNOI,
            dscr_ncf: loan.dscrNCF,
            occupancy: loan.occupancy,
            payment_status_code: loan.paymentStatusLoanCode,
            property_status_code: loan.propertyStatusCode,
            severity: finding.severity,
            distress_reasons: finding.reasons,
          },
        };

        if (existing && existing.length > 0) {
          // Update in place so the same loan gets a refreshed snapshot each
          // month rather than creating duplicates.
          const { error } = await supabase
            .from('intel_items')
            .update(common)
            .eq('id', existing[0].id);
          if (!error) ingested++;
          else skipped++;
        } else {
          const { error } = await supabase.from('intel_items').insert(common);
          if (!error) ingested++;
          else skipped++;
        }
      }
    } catch (err) {
      console.error(`ABS-EE fetch failed for CIK ${trust.cik}:`, err);
    }
  }

  return { ingested, skipped };
}
