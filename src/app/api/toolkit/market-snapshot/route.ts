import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMarketSnapshot } from '@/lib/ai/generate-snapshot';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { location } = await request.json();
  if (!location) return NextResponse.json({ error: 'Location is required' }, { status: 400 });

  // Fetch recent intel mentioning this location
  const { data: relatedIntel } = await supabase
    .from('intel_items')
    .select('summary')
    .textSearch('title', location, { type: 'websearch' })
    .not('summary', 'is', null)
    .order('relevance_score', { ascending: false })
    .limit(10);

  const recentIntel = relatedIntel?.map((i) => i.summary).filter(Boolean) as string[] ?? [];

  const snapshot = await generateMarketSnapshot(location, recentIntel);
  return NextResponse.json({ snapshot });
}
