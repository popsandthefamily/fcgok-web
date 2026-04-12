import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzeIntelItem } from '@/lib/ai/analyze-intel';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // Fetch unprocessed items
    const { data: items, error: fetchError } = await supabase
      .from('intel_items')
      .select('*')
      .is('ai_analysis', null)
      .order('ingested_at', { ascending: true })
      .limit(20);

    if (fetchError) throw fetchError;
    if (!items || items.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 });
    }

    let processed = 0;
    let errors = 0;

    for (const item of items) {
      try {
        const analysis = await analyzeIntelItem({
          title: item.title,
          body: item.body,
          source: item.source,
          author: item.author,
        });

        await supabase
          .from('intel_items')
          .update({
            summary: analysis.summary,
            ai_analysis: analysis,
            relevance_score: analysis.relevance_score,
            category: analysis.category,
            entities: analysis.entities,
            tags: analysis.tags,
          })
          .eq('id', item.id);

        processed++;
      } catch (err) {
        console.error(`Failed to analyze item ${item.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({ ok: true, processed, errors });
  } catch (error) {
    console.error('Process intel failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
