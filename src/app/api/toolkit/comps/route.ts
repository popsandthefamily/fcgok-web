import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function getOrgId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const service = await createServiceClient();
  const { data } = await service
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();
  return (data?.organization_id as string) ?? null;
}

export async function GET() {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = await createServiceClient();
  const { data, error } = await service
    .from('comps')
    .select('*')
    .eq('organization_id', orgId)
    .order('sale_date', { ascending: false, nullsFirst: false })
    .limit(1000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comps: data ?? [] });
}

export async function POST(request: Request) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const record = {
    organization_id: orgId,
    property_name: body.property_name || null,
    address: body.address || null,
    city: body.city || null,
    state: body.state || null,
    zip: body.zip || null,
    sale_price: body.sale_price || null,
    sale_date: body.sale_date || null,
    buyer: body.buyer || null,
    seller: body.seller || null,
    asset_type: body.asset_type || null,
    units: body.units || null,
    square_feet: body.square_feet || null,
    lot_acres: body.lot_acres || null,
    year_built: body.year_built || null,
    price_per_unit: body.price_per_unit || null,
    price_per_sf: body.price_per_sf || null,
    cap_rate: body.cap_rate || null,
    noi: body.noi || null,
    source: body.source ?? 'manual',
    source_intel_id: body.source_intel_id || null,
    notes: body.notes || null,
    verified: body.verified ?? (body.source === 'manual'),
    created_by: user?.id ?? null,
  };

  const service = await createServiceClient();
  const { data, error } = await service
    .from('comps')
    .insert(record)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comp: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const service = await createServiceClient();
  const { error } = await service
    .from('comps')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
