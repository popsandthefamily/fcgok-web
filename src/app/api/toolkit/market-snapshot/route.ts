import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI features require GEMINI_API_KEY to be configured.' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { location } = await request.json();
  if (!location) return NextResponse.json({ error: 'Location is required' }, { status: 400 });

  try {
    const { data: relatedIntel } = await supabase
      .from('intel_items')
      .select('summary')
      .or(`title.ilike.%${location}%,summary.ilike.%${location}%`)
      .not('summary', 'is', null)
      .order('relevance_score', { ascending: false })
      .limit(10);

    const recentIntel = relatedIntel?.map((i) => i.summary).filter(Boolean) as string[] ?? [];

    const { generateMarketSnapshot } = await import('@/lib/ai/generate-snapshot');
    const snapshot = await generateMarketSnapshot(location, recentIntel);
    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error('Market snapshot error:', err);
    return NextResponse.json({ error: 'Failed to generate snapshot. Please try again.' }, { status: 500 });
  }
}
