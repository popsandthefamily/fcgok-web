import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { sendOutreachEmail } from '@/lib/email/outreach';

// Logs an outreach send and optionally delivers it via Resend with
// open/click tracking embedded. Two delivery modes:
//   - 'log_only' (default): user copied to Gmail and sent manually.
//     We only log and emit the timeline event. No tracking.
//   - 'send_via_app': we send via Resend with a 1x1 pixel and link
//     rewriting through /api/track/{open,click}. Re-opens and clicks
//     fire engagement_events keyed by the send_id; the trigger from
//     migration 007 takes care of rollups + timeline mirroring.
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
  const deliveryMode: 'log_only' | 'send_via_app' =
    body?.delivery_mode === 'send_via_app' ? 'send_via_app' : 'log_only';

  if (!templateId) return NextResponse.json({ error: 'template_id is required' }, { status: 400 });
  if (!subject) return NextResponse.json({ error: 'subject is required' }, { status: 400 });
  if (deliveryMode === 'send_via_app' && !recipientEmail) {
    return NextResponse.json({ error: 'recipient_email is required to send via app' }, { status: 400 });
  }
  if (deliveryMode === 'send_via_app' && !bodyText?.trim()) {
    return NextResponse.json({ error: 'body is required to send via app' }, { status: 400 });
  }

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

  // 1. Insert the send log first to get a send_id (needed for tracking links).
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

  // 2. If sending via app, push through Resend with tracking embedded.
  let deliveryWarning: string | null = null;
  if (deliveryMode === 'send_via_app' && recipientEmail && bodyText) {
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    try {
      await sendOutreachEmail({
        to: recipientEmail,
        subject,
        bodyText,
        sendId: sendData.id,
        origin,
      });
    } catch (err) {
      deliveryWarning = err instanceof Error ? err.message : String(err);
      // Mark the send row with the delivery error so the timeline reflects truth.
      await supabase
        .from('outreach_sends')
        .update({
          notes: notes
            ? `${notes}\n\n[delivery_error] ${deliveryWarning}`
            : `[delivery_error] ${deliveryWarning}`,
        })
        .eq('id', sendData.id);
    }
  }

  // 3. Emit the timeline event. Soft-fail: send is still logged either way.
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
        delivery_mode: deliveryMode,
        delivery_error: deliveryWarning,
      },
    });

  return NextResponse.json({
    send: sendData,
    delivery_mode: deliveryMode,
    delivery_warning: deliveryWarning,
    event_warning: eventErr ? eventErr.message : null,
  }, { status: 201 });
}
