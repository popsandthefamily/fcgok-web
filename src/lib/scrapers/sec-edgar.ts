import { createServiceClient } from '@/lib/supabase/server';
import { urlHash } from '@/lib/utils/dedup';
import type { OrgConfig, Industry } from '@/lib/config/industries';

const USER_AGENT = process.env.SEC_EDGAR_USER_AGENT ?? 'FrontierConsultingGroup info@fcgok.com';

// Public company CIKs to watch per industry
const INDUSTRY_CIKS: Record<Industry, string[]> = {
  'self-storage': [
    '1393311', // Public Storage (PSA)
    '1289490', // Extra Space (EXR)
    '1042939', // CubeSmart (CUBE)
    '1618563', // National Storage Affiliates (NSA)
    '1435215', // Global Self Storage (SELF)
  ],
  'multi-family': [
    '906345',  // Equity Residential
    '795266',  // AvalonBay
    '906107',  // MAA
  ],
  industrial: [
    '1045609', // Prologis
    '1467416', // Rexford Industrial
  ],
  retail: [
    '73124',   // Federal Realty
    '879101',  // Kimco
  ],
  office: [
    '1037540', // Boston Properties
    '1558370', // Kilroy
  ],
  hospitality: [],
  mixed: [],
};

export async function ingestSEC(
  config: OrgConfig,
  orgSlug: string,
): Promise<{ ingested: number; skipped: number }> {
  const supabase = await createServiceClient();
  let ingested = 0;
  let skipped = 0;

  const ciks = INDUSTRY_CIKS[config.industry] ?? [];

  // 1. Full-text search for Form D filings mentioning org keywords
  const primaryKeyword = config.intel.keywords[0] ?? 'real estate';
  const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(primaryKeyword)}%22&dateRange=custom&startdt=${getDateDaysAgo(7)}&enddt=${getToday()}&forms=D`;

  try {
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const hits = searchData.hits?.hits ?? [];

      for (const hit of hits.slice(0, 20)) {
        const filing = hit._source;
        const filingUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&accession=${filing.accession_no}`;
        const hash = urlHash(filing.accession_no ?? filingUrl);

        const { data: existing } = await supabase
          .from('intel_items')
          .select('id')
          .eq('metadata->>url_hash', hash)
          .contains('client_visibility', [orgSlug])
          .limit(1);

        if (existing && existing.length > 0) { skipped++; continue; }

        const { error } = await supabase.from('intel_items').insert({
          source: 'sec',
          source_url: filingUrl,
          title: `SEC Form D: ${filing.display_names?.[0] ?? 'Unknown Entity'} — ${filing.form_type ?? 'D'}`,
          body: `Filing by ${filing.display_names?.join(', ') ?? 'Unknown'} on ${filing.file_date}. ${filing.file_description ?? ''}`,
          published_at: filing.file_date ? new Date(filing.file_date).toISOString() : null,
          client_visibility: [orgSlug],
          metadata: {
            url_hash: hash,
            form_type: filing.form_type,
            accession_number: filing.accession_no,
            entity_names: filing.display_names,
          },
        });

        if (!error) ingested++;
        else skipped++;
      }
    }
  } catch (err) {
    console.error('SEC search failed:', err);
  }

  // 2. Recent filings from watched CIKs for the industry
  for (const cik of ciks) {
    const url = `https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;
      const data = await res.json();
      const recent = data.filings?.recent;
      if (!recent) continue;

      const count = Math.min(recent.accessionNumber?.length ?? 0, 5);
      for (let i = 0; i < count; i++) {
        const form = recent.form?.[i];
        // 8-Ks are handled separately by edgar-distress scraper so every
        // 8-K gets evaluated for distress-item codes (2.03/2.04/2.06 etc.)
        // before insert. If we also inserted them here, url_hash dedup
        // would steal the row and we'd lose the distress tag.
        if (!['10-K', '10-Q', 'S-11'].includes(form)) continue;

        const accession = recent.accessionNumber[i];
        const hash = urlHash(accession);

        const { data: existing } = await supabase
          .from('intel_items')
          .select('id')
          .eq('metadata->>url_hash', hash)
          .contains('client_visibility', [orgSlug])
          .limit(1);

        if (existing && existing.length > 0) { skipped++; continue; }

        const { error } = await supabase.from('intel_items').insert({
          source: 'sec',
          source_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=${form}`,
          title: `${data.name}: ${form} filed ${recent.filingDate[i]}`,
          body: recent.primaryDocDescription?.[i] || `${form} filing for ${data.name}`,
          published_at: new Date(recent.filingDate[i]).toISOString(),
          client_visibility: [orgSlug],
          metadata: {
            url_hash: hash,
            form_type: form,
            accession_number: accession,
            cik,
            company_name: data.name,
            tickers: data.tickers,
          },
        });

        if (!error) ingested++;
        else skipped++;
      }
    } catch (err) {
      console.error(`SEC fetch failed for CIK ${cik}:`, err);
    }
  }

  return { ingested, skipped };
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getDateDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}
