import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const source = url.searchParams.get('source');
  const category = url.searchParams.get('category');
  const curated = url.searchParams.get('curated');
  const minRelevance = url.searchParams.get('min_relevance');
  const search = url.searchParams.get('search');
  const limit = parseInt(url.searchParams.get('limit') ?? '50');
  const offset = parseInt(url.searchParams.get('offset') ?? '0');

  let query = supabase
    .from('intel_items')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (source) query = query.eq('source', source);
  if (category) query = query.eq('category', category);
  if (curated === 'true') query = query.eq('is_curated', true);
  if (minRelevance) query = query.gte('relevance_score', parseFloat(minRelevance));
  if (search) query = query.textSearch('title', search, { type: 'websearch' });

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data, total: count });
}
