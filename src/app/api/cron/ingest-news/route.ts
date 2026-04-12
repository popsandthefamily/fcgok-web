import { NextResponse } from 'next/server';
import { ingestNews } from '@/lib/scrapers/news-api';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await ingestNews();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('News ingestion failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
