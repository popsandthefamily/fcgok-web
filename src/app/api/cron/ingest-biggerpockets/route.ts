import { NextResponse } from 'next/server';
import { ingestBiggerPockets } from '@/lib/scrapers/biggerpockets';
import { runForOrgs } from '@/lib/scrapers/run-for-orgs';
import { isAuthorizedCron } from '@/lib/auth/cron-auth';

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runForOrgs('biggerpockets', ingestBiggerPockets);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('BiggerPockets ingestion failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
