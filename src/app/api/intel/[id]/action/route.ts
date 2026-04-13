import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

type Action = 'pin' | 'unpin' | 'hide' | 'unhide' | 'boost' | 'lower';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const { action } = (await request.json()) as { action: Action };

  const supabase = await createServiceClient();

  // Fetch current item (only within the admin's org scope)
  const { data: item, error: fetchError } = await supabase
    .from('intel_items')
    .select('id, is_curated, relevance_score, metadata, client_visibility')
    .eq('id', id)
    .single();

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // Guard: only act on items visible to this admin's org
  const visibility = (item.client_visibility as string[]) ?? [];
  if (auth.orgSlug && !visibility.includes(auth.orgSlug) && !visibility.includes('all')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const metadata = (item.metadata as Record<string, unknown> | null) ?? {};
  const updates: Record<string, unknown> = {};

  switch (action) {
    case 'pin':
      updates.is_curated = true;
      break;
    case 'unpin':
      updates.is_curated = false;
      break;
    case 'hide':
      updates.metadata = { ...metadata, hidden: true, hidden_at: new Date().toISOString() };
      break;
    case 'unhide':
      updates.metadata = { ...metadata, hidden: false };
      break;
    case 'boost': {
      const current = (item.relevance_score as number | null) ?? 0.5;
      updates.relevance_score = Math.min(1, Math.round((current + 0.1) * 100) / 100);
      break;
    }
    case 'lower': {
      const current = (item.relevance_score as number | null) ?? 0.5;
      updates.relevance_score = Math.max(0, Math.round((current - 0.1) * 100) / 100);
      break;
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('intel_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
