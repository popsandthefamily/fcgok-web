import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { PIPELINE_STAGES, type PipelineStage, type RaisePipelineRow } from '@/lib/types/pipeline';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id } = await params;
  const supabase = await createServiceClient();

  // Verify the raise belongs to this org before exposing pipeline rows.
  const { data: raise } = await supabase
    .from('raises')
    .select('id')
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!raise) return NextResponse.json({ error: 'Raise not found' }, { status: 404 });

  const { data: pipeline, error } = await supabase
    .from('raise_pipeline')
    .select('*')
    .eq('raise_id', id)
    .order('added_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (pipeline ?? []) as RaisePipelineRow[];
  const entityIds = rows.map((r) => r.entity_id);

  let entitiesById: Record<string, { id: string; name: string; entity_type: string }> = {};
  if (entityIds.length > 0) {
    const { data: entities } = await supabase
      .from('tracked_entities')
      .select('id, name, entity_type')
      .in('id', entityIds);
    for (const e of entities ?? []) {
      entitiesById[e.id] = e as { id: string; name: string; entity_type: string };
    }
  }

  return NextResponse.json({ pipeline: rows, entities: entitiesById });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id } = await params;
  const body = await request.json();

  const entityId = typeof body?.entity_id === 'string' ? body.entity_id : null;
  if (!entityId) return NextResponse.json({ error: 'entity_id is required' }, { status: 400 });

  const stage: PipelineStage = PIPELINE_STAGES.includes(body?.stage) ? body.stage : 'identified';

  const supabase = await createServiceClient();

  // Verify the raise belongs to this org.
  const { data: raise } = await supabase
    .from('raises')
    .select('id')
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!raise) return NextResponse.json({ error: 'Raise not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('raise_pipeline')
    .insert({
      raise_id: id,
      entity_id: entityId,
      organization_id: auth.orgId,
      stage,
    })
    .select()
    .single();

  if (error) {
    // Unique constraint violation: entity already in this raise's pipeline
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Investor already in pipeline for this raise' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pipeline: data as RaisePipelineRow }, { status: 201 });
}
