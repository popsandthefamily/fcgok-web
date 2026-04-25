import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

// Logs an outreach as sent (matches the app's "log it after I sent it
// from Gmail" pattern — no SMTP delivery from this endpoint). Writes
// outreach_sends with the full FK set (pipeline_id + entity_id +
// raise_id) and emits a raise_pipeline_events row of type
// outreach_sent so the timeline picks it up.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; pipelineId: string }> },
) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id, pipelineId } = await params;
  const body = await request.json();

  const templateId = typeof body?.template_id === 'string' ? body.template_id : null;
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
  const bodyText = typeof body?.body === 'string' ? body.body : null;
  const recipientEmail = typeof body?.recipient_email === 'string' ? body.recipient_email.trim() || null : null;
  const recipientName = typeof body?.recipient_name === 'string' ? body.recipient_name.trim() || null : null;
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null;

  if (!templateId) return NextResponse.json({ error: 'template_id is required' }, { status: 400 });
  if (!subject) return NextResponse.json({ error: 'subject is required' }, { status: 400 });

  const supabase = await createServiceClient();

  // Verify the pipeline row + template + raise are all org-scoped before insert.
  const [pipelineRes, templateRes] = await Promise.all([
    supabase
      .from('raise_pipeline')
      .select('id, entity_id, raise_id')
      .eq('id', pipelineId)
      .eq('raise_id', id)
      .eq('organization_id', auth.orgId)
      .single(),
    supabase
      .from('outreach_templates')
      .select('id')
      .eq('id', templateId)
      .eq('organization_id', auth.orgId)
      .single(),
  ]);
  if (!pipelineRes.data) return NextResponse.json({ error: 'Pipeline row not found' }, { status: 404 });
  if (!templateRes.data) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const pipeline = pipelineRes.data as { id: string; entity_id: string; raise_id: string };

  // 1. Insert the send log.
  const { data: sendData, error: sendErr } = await supabase
    .from('outreach_sends')
    .insert({
      template_id: templateId,
      organization_id: auth.orgId,
      sent_by: auth.id,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject_sent: subject,
      body_sent: bodyText,
      notes,
      pipeline_id: pipeline.id,
      entity_id: pipeline.entity_id,
      raise_id: pipeline.raise_id,
    })
    .select()
    .single();

  if (sendErr) return NextResponse.json({ error: sendErr.message }, { status: 500 });

  // 2. Emit the timeline event. Soft-fail: if event insert fails, the
  //    send is still logged. We surface the error in the response but
  //    don't roll back.
  const { error: eventErr } = await supabase
    .from('raise_pipeline_events')
    .insert({
      pipeline_id: pipeline.id,
      organization_id: auth.orgId,
      event_type: 'outreach_sent',
      actor_id: auth.id,
      payload: {
        send_id: sendData.id,
        template_id: templateId,
        subject,
        recipient_email: recipientEmail,
      },
    });

  return NextResponse.json({
    send: sendData,
    event_warning: eventErr ? eventErr.message : null,
  }, { status: 201 });
}
