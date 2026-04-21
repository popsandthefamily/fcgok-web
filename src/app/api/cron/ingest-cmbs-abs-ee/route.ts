import { NextResponse } from 'next/server';
import { ingestCmbsAbsEe } from '@/lib/scrapers/cmbs-abs-ee';
import { runForOrgs } from '@/lib/scrapers/run-for-orgs';
import { isAuthorizedCron } from '@/lib/auth/cron-auth';

// ABS-EE parsing is the slow path — each trust requires 2 EDGAR fetches
// (submissions JSON + filing index HTML) plus the tape XML itself. At 80
// trusts this takes 2-4 minutes; we need the full 5-minute budget.
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runForOrgs('cmbs-abs-ee', ingestCmbsAbsEe);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('CMBS ABS-EE ingestion failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
