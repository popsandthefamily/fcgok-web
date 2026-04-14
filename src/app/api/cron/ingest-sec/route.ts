import { NextResponse } from 'next/server';
import { ingestSEC } from '@/lib/scrapers/sec-edgar';
import { runForOrgs } from '@/lib/scrapers/run-for-orgs';
import { isAuthorizedCron } from '@/lib/auth/cron-auth';

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runForOrgs('sec', ingestSEC);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('SEC ingestion failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
