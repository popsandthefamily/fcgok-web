import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

export async function PUT(request: Request, { params }: { params: Promise<{ sendId: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { sendId } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if ('replied' in body) {
    updates.replied_at = body.replied ? new Date().toISOString() : null;
    updates.reply_status = body.replied ? (body.reply_status ?? 'replied') : null;
  }
  if ('notes' in body) updates.notes = body.notes;
  if ('recipient_email' in body) updates.recipient_email = body.recipient_email;
  if ('recipient_name' in body) updates.recipient_name = body.recipient_name;

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('outreach_sends')
    .update(updates)
    .eq('id', sendId)
    .eq('organization_id', auth.orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ send: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ sendId: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { sendId } = await params;
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('outreach_sends')
    .delete()
    .eq('id', sendId)
    .eq('organization_id', auth.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
