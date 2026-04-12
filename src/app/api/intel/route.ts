import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createServiceClient();

  const url = new URL(request.url);
  const sources = url.searchParams.get('source')?.split(',').filter(Boolean);
  const categories = url.searchParams.get('category')?.split(',').filter(Boolean);
  const curated = url.searchParams.get('curated');
  const minRelevance = url.searchParams.get('min_relevance');
  const search = url.searchParams.get('search');
  const limit = parseInt(url.searchParams.get('limit') ?? '50');
  const offset = parseInt(url.searchParams.get('offset') ?? '0');

  let query = supabase
    .from('intel_items')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (sources && sources.length > 0) query = query.in('source', sources);
  if (categories && categories.length > 0) query = query.in('category', categories);
  if (curated === 'true') query = query.eq('is_curated', true);
  if (minRelevance) query = query.gte('relevance_score', parseFloat(minRelevance));
  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,body.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data, total: count });
}
