import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { runForOrgs } from '@/lib/scrapers/run-for-orgs';
import { ingestNews } from '@/lib/scrapers/news-api';
import { ingestSEC } from '@/lib/scrapers/sec-edgar';
import { ingestRSS } from '@/lib/scrapers/iss-rss';
import { ingestEdgarDistress } from '@/lib/scrapers/edgar-distress';
import { ingestCmbsAbsEe } from '@/lib/scrapers/cmbs-abs-ee';

export const dynamic = 'force-dynamic';
// cmbs-abs-ee can take 2-4 minutes; the rest finish well under 60s.
export const maxDuration = 300;

type ManualSource = 'iss' | 'news' | 'sec' | 'edgar-distress' | 'cmbs-abs-ee';

const SCRAPERS: Record<ManualSource, Parameters<typeof runForOrgs>[1]> = {
  iss: ingestRSS,
  news: ingestNews,
  sec: ingestSEC,
  'edgar-distress': ingestEdgarDistress,
  'cmbs-abs-ee': ingestCmbsAbsEe,
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ source: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { source } = await params;
  if (!(source in SCRAPERS)) {
    return NextResponse.json({ error: `Unknown source: ${source}` }, { status: 400 });
  }

  try {
    const scraper = SCRAPERS[source as ManualSource];
    const result = await runForOrgs(source as ManualSource, scraper);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error(`Manual ${source} ingestion failed:`, error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
