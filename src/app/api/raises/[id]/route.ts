import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { Raise, RaiseStatus, RaiseStructure } from '@/lib/types/raises';

const UPDATABLE_FIELDS = [
  'name',
  'status',
  'amount_sought_usd',
  'min_check_usd',
  'max_check_usd',
  'use_of_funds',
  'revenue_usd',
  'noi_usd',
  'ebitda_usd',
  'collateral_summary',
  'geography',
  'asset_class',
  'stage',
  'structure',
  'target_close_date',
  'min_terms',
  'data_room_url',
  'linked_document_id',
  'notes',
  'metadata',
] as const;

const VALID_STATUSES: RaiseStatus[] = ['draft', 'active', 'paused', 'closed_won', 'closed_lost'];
const VALID_STRUCTURES: RaiseStructure[] = [
  'equity', 'debt', 'mezz', 'pref_equity', 'jv', 'convertible', 'safe', 'other',
];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id } = await params;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('raises')
    .select('*')
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ raise: data as Raise });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  for (const key of UPDATABLE_FIELDS) {
    if (key in body) updates[key] = body[key];
  }

  if ('status' in updates && !VALID_STATUSES.includes(updates.status as RaiseStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  if ('structure' in updates && updates.structure !== null && !VALID_STRUCTURES.includes(updates.structure as RaiseStructure)) {
    return NextResponse.json({ error: 'Invalid structure' }, { status: 400 });
  }
  if ('name' in updates) {
    const trimmed = typeof updates.name === 'string' ? updates.name.trim() : '';
    if (!trimmed) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    updates.name = trimmed;
  }
  if ('target_close_date' in updates && updates.target_close_date === '') {
    updates.target_close_date = null;
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('raises')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ raise: data as Raise });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id } = await params;
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('raises')
    .delete()
    .eq('id', id)
    .eq('organization_id', auth.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
