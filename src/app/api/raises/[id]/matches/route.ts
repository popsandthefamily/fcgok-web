import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { computeRaiseMatches } from '@/lib/matching/get-matches';
import type { Raise } from '@/lib/types/raises';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id } = await params;
  const url = new URL(request.url);
  const limitRaw = parseInt(url.searchParams.get('limit') ?? '25', 10);
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 25, 1), 100);

  const supabase = await createServiceClient();
  const { data: raise, error } = await supabase
    .from('raises')
    .select('*')
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .single();

  if (error || !raise) return NextResponse.json({ error: 'Raise not found' }, { status: 404 });

  const result = await computeRaiseMatches(supabase, raise as Raise, limit);
  return NextResponse.json({ raise, ...result });
}
