import { NextResponse } from 'next/server';
import { ingestRSS } from '@/lib/scrapers/iss-rss';
import { runForOrgs } from '@/lib/scrapers/run-for-orgs';

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // The ISS cron triggers all configured RSS feeds (ISS for self-storage,
    // MultiHousing News for multi-family, etc.)
    const result = await runForOrgs('iss', ingestRSS);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('RSS ingestion failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
