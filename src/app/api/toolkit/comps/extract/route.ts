import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = await createServiceClient();
  const { data: profile } = await service
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();
  const orgId = profile?.organization_id as string | null;
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { intel_item_id } = await request.json();
  if (!intel_item_id) return NextResponse.json({ error: 'intel_item_id required' }, { status: 400 });

  const { data: item } = await service
    .from('intel_items')
    .select('title, body, summary')
    .eq('id', intel_item_id)
    .single();
  if (!item) return NextResponse.json({ error: 'Intel item not found' }, { status: 404 });

  const { extractCompsFromIntel } = await import('@/lib/ai/extract-comp');
  const extracted = await extractCompsFromIntel(
    item.title as string,
    item.body as string | null,
    item.summary as string | null,
  );

  if (extracted.length === 0) {
    return NextResponse.json({ comps: [], message: 'No structured transactions found in this article.' });
  }

  const records = extracted.map((c) => ({
    organization_id: orgId,
    property_name: c.property_name,
    city: c.city,
    state: c.state,
    sale_price: c.sale_price,
    sale_date: c.sale_date,
    buyer: c.buyer,
    seller: c.seller,
    asset_type: c.asset_type,
    units: c.units,
    square_feet: c.square_feet,
    cap_rate: c.cap_rate,
    noi: c.noi,
    notes: c.notes,
    source: 'ai_extracted',
    source_intel_id: intel_item_id,
    verified: false,
    created_by: user.id,
  }));

  const { data, error } = await service
    .from('comps')
    .insert(records)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comps: data ?? [], count: (data ?? []).length });
}
