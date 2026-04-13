import { NextResponse } from 'next/server';
import { ingestReddit } from '@/lib/scrapers/reddit';
import { runForOrgs } from '@/lib/scrapers/run-for-orgs';

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runForOrgs('reddit', ingestReddit);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('Reddit ingestion failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
