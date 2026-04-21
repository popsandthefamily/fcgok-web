import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { runForOrgs } from '@/lib/scrapers/run-for-orgs';
import { ingestNews } from '@/lib/scrapers/news-api';
import { ingestSEC } from '@/lib/scrapers/sec-edgar';
import { ingestRSS } from '@/lib/scrapers/iss-rss';
import type { IntelSource } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type ManualSource = Extract<IntelSource, 'iss' | 'news' | 'sec'>;

const SCRAPERS: Record<ManualSource, Parameters<typeof runForOrgs>[1]> = {
  iss: ingestRSS,
  news: ingestNews,
  sec: ingestSEC,
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
