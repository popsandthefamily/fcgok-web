import { NextResponse } from 'next/server';
import { ingestBiggerPockets } from '@/lib/scrapers/biggerpockets';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await ingestBiggerPockets();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('BiggerPockets ingestion failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
