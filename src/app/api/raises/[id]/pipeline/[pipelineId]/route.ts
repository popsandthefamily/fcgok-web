import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { PIPELINE_STAGES, type PipelineStage, type PipelinePriority, type RaisePipelineRow } from '@/lib/types/pipeline';

const VALID_PRIORITIES: PipelinePriority[] = ['low', 'normal', 'high'];

const UPDATABLE_FIELDS = [
  'stage',
  'committed_amount_usd',
  'passed_reason',
  'assignee_id',
  'next_action',
  'next_action_due_at',
  'priority',
  'notes',
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; pipelineId: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id, pipelineId } = await params;
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('raise_pipeline')
    .select('*')
    .eq('id', pipelineId)
    .eq('raise_id', id)
    .eq('organization_id', auth.orgId)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Pipeline row not found' }, { status: 404 });
  return NextResponse.json({ pipeline: data as RaisePipelineRow });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; pipelineId: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id, pipelineId } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  for (const key of UPDATABLE_FIELDS) {
    if (key in body) updates[key] = body[key];
  }

  if ('stage' in updates && !PIPELINE_STAGES.includes(updates.stage as PipelineStage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }
  if ('priority' in updates && !VALID_PRIORITIES.includes(updates.priority as PipelinePriority)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
  }
  if ('next_action_due_at' in updates && updates.next_action_due_at === '') {
    updates.next_action_due_at = null;
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('raise_pipeline')
    .update(updates)
    .eq('id', pipelineId)
    .eq('raise_id', id)
    .eq('organization_id', auth.orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pipeline: data as RaisePipelineRow });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; pipelineId: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id, pipelineId } = await params;
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from('raise_pipeline')
    .delete()
    .eq('id', pipelineId)
    .eq('raise_id', id)
    .eq('organization_id', auth.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
