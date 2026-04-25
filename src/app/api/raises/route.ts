import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { Raise, RaiseStatus, RaiseStructure } from '@/lib/types/raises';

export async function GET() {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ raises: [] });

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('raises')
    .select('*')
    .eq('organization_id', auth.orgId)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ raises: (data ?? []) as Raise[] });
}

const VALID_STATUSES: RaiseStatus[] = ['draft', 'active', 'paused', 'closed_won', 'closed_lost'];
const VALID_STRUCTURES: RaiseStructure[] = [
  'equity', 'debt', 'mezz', 'pref_equity', 'jv', 'convertible', 'safe', 'other',
];

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization associated with this account' }, { status: 400 });

  const body = await request.json();
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const status: RaiseStatus = VALID_STATUSES.includes(body?.status) ? body.status : 'draft';
  const structure: RaiseStructure | null =
    body?.structure && VALID_STRUCTURES.includes(body.structure) ? body.structure : null;

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('raises')
    .insert({
      organization_id: auth.orgId,
      created_by: auth.id,
      name,
      status,
      amount_sought_usd: body.amount_sought_usd ?? null,
      min_check_usd: body.min_check_usd ?? null,
      max_check_usd: body.max_check_usd ?? null,
      use_of_funds: body.use_of_funds ?? null,
      revenue_usd: body.revenue_usd ?? null,
      noi_usd: body.noi_usd ?? null,
      ebitda_usd: body.ebitda_usd ?? null,
      collateral_summary: body.collateral_summary ?? null,
      geography: Array.isArray(body.geography) ? body.geography : null,
      asset_class: body.asset_class ?? null,
      stage: body.stage ?? null,
      structure,
      target_close_date: body.target_close_date || null,
      min_terms: body.min_terms ?? {},
      data_room_url: body.data_room_url ?? null,
      linked_document_id: body.linked_document_id ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ raise: data as Raise }, { status: 201 });
}
