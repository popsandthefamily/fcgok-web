import { NextResponse } from 'next/server';
import { ingestISS } from '@/lib/scrapers/iss-rss';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await ingestISS();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('ISS ingestion failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
