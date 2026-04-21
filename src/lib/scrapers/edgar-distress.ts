import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';
import type { OrgConfig } from '@/lib/config/industries';

const USER_AGENT = process.env.SEC_EDGAR_USER_AGENT ?? 'FrontierConsultingGroup info@fcgok.com';

// Self-storage entities we monitor for 8-K distress signals. Starting with
// the public REITs; non-traded sponsors (Inland Private Capital, Strategic
// Storage Trust VI, Pacific Oak, NexPoint Storage Partners, JLL Income
// Property Trust) file EDGAR under variable entity names and need their
// CIKs resolved before being added.
const WATCHLIST: { cik: string; label: string }[] = [
  { cik: '1393311', label: 'Public Storage (PSA)' },
  { cik: '1289490', label: 'Extra Space Storage (EXR)' },
  { cik: '1042939', label: 'CubeSmart (CUBE)' },
  { cik: '1618563', label: 'National Storage Affiliates (NSA)' },
  { cik: '1435215', label: 'Global Self Storage (SELF)' },
  { cik: '1585389', label: 'SmartStop Self Storage REIT (SMA)' },
];

// 8-K items carrying a distress / material-adverse signal.
// Reference: https://www.sec.gov/fast-answers/answersform8khtm.html
const DISTRESS_ITEM_LABELS: Record<string, string> = {
  '2.03': 'Material Debt Obligation',
  '2.04': 'Triggering Event Accelerating Debt',
  '2.06': 'Material Impairment',
  '4.02': 'Non-Reliance on Prior Financials',
  '5.02': 'Officer / Director Change',
  '8.01': 'Other Material Event',
};
const DISTRESS_CODES = new Set(Object.keys(DISTRESS_ITEM_LABELS));

const MAX_FILINGS_PER_CIK = 40;

export async function ingestEdgarDistress(
  config: OrgConfig,
  orgSlug: string,
): Promise<{ ingested: number; skipped: number }> {
  // Watchlist is self-storage-specific today. Skip orgs in other industries
  // until we add sector-specific watchlists.
  if (config.industry !== 'self-storage') {
    return { ingested: 0, skipped: 0 };
  }

  const supabase = await createServiceClient();
  let ingested = 0;
  let skipped = 0;

  for (const entry of WATCHLIST) {
    try {
      const url = `https://data.sec.gov/submissions/CIK${entry.cik.padStart(10, '0')}.json`;
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;
      const data = await res.json();
      const recent = data.filings?.recent;
      if (!recent) continue;

      const count = Math.min(recent.accessionNumber?.length ?? 0, MAX_FILINGS_PER_CIK);
      for (let i = 0; i < count; i++) {
        if (recent.form?.[i] !== '8-K') continue;

        const rawItems = (recent.items?.[i] ?? '') as string;
        const itemCodes = rawItems.split(',').map((s) => s.trim()).filter(Boolean);
        const matched = itemCodes.filter((c) => DISTRESS_CODES.has(c));
        if (matched.length === 0) continue;

        const accession = recent.accessionNumber[i] as string;
        const hash = urlHash(accession);

        const { data: existing } = await supabase
          .from('intel_items')
          .select('id')
          .eq('metadata->>url_hash', hash)
          .contains('client_visibility', [orgSlug])
          .limit(1);
        if (existing && existing.length > 0) { skipped++; continue; }

        const filingDate = recent.filingDate?.[i] as string | undefined;
        const accessionDashed = accession.replace(/-/g, '');
        const filingIndex = `https://www.sec.gov/Archives/edgar/data/${entry.cik}/${accessionDashed}/${accession}-index.htm`;

        const itemSummary = matched
          .map((c) => `${c} ${DISTRESS_ITEM_LABELS[c]}`)
          .join(' · ');

        const body = [
          `${entry.label} filed an 8-K${filingDate ? ` on ${filingDate}` : ''} disclosing material event${matched.length > 1 ? 's' : ''}:`,
          ...matched.map((c) => `• Item ${c}: ${DISTRESS_ITEM_LABELS[c]}`),
          '',
          `Full filing: ${filingIndex}`,
        ].join('\n');

        const { error } = await supabase.from('intel_items').insert({
          source: 'sec',
          source_url: filingIndex,
          title: `${entry.label}: 8-K — ${itemSummary}`,
          body,
          published_at: filingDate ? new Date(filingDate).toISOString() : null,
          category: 'distress',
          client_visibility: [orgSlug],
          metadata: {
            url_hash: hash,
            form_type: '8-K',
            accession_number: accession,
            cik: entry.cik,
            company_name: entry.label,
            tickers: data.tickers,
            distress_items: matched,
            all_items: itemCodes,
            subtype: 'distress_8k',
          },
        });

        if (!error) ingested++;
        else skipped++;
      }
    } catch (err) {
      console.error(`EDGAR distress fetch failed for CIK ${entry.cik}:`, err);
    }
  }

  return { ingested, skipped };
}
