import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

export async function GET(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ entities: [] });

  const supabase = await createServiceClient();

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const type = url.searchParams.get('type');

  let query = supabase
    .from('tracked_entities')
    .select('*')
    .eq('organization_id', auth.orgId)
    .order('last_activity_at', { ascending: false, nullsFirst: false });

  if (status) query = query.eq('status', status);
  if (type) query = query.eq('entity_type', type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ entities: data });
}

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const supabase = await createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('tracked_entities')
    .insert({ ...body, organization_id: auth.orgId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entity: data }, { status: 201 });
}
