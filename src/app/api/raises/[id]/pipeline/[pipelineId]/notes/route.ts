import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; pipelineId: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id, pipelineId } = await params;
  const body = await request.json();
  const note = typeof body?.note === 'string' ? body.note.trim() : '';
  if (!note) return NextResponse.json({ error: 'Note is required' }, { status: 400 });

  const supabase = await createServiceClient();

  // Verify pipeline row belongs to the raise + org.
  const { data: pipeline } = await supabase
    .from('raise_pipeline')
    .select('id, organization_id')
    .eq('id', pipelineId)
    .eq('raise_id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!pipeline) return NextResponse.json({ error: 'Pipeline row not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('raise_pipeline_events')
    .insert({
      pipeline_id: pipelineId,
      organization_id: auth.orgId,
      event_type: 'note_added',
      actor_id: auth.id,
      payload: { note },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data }, { status: 201 });
}
