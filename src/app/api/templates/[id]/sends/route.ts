import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id } = await params;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('outreach_sends')
    .select('*')
    .eq('template_id', id)
    .eq('organization_id', auth.orgId)
    .order('sent_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sends: data ?? [] });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const { id } = await params;
  const body = await request.json();
  const { recipient_email, recipient_name, subject_sent, body_sent, notes } = body;

  if (!subject_sent) {
    return NextResponse.json({ error: 'Missing subject' }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('outreach_sends')
    .insert({
      template_id: id,
      organization_id: auth.orgId,
      sent_by: auth.id,
      recipient_email: recipient_email ?? null,
      recipient_name: recipient_name ?? null,
      subject_sent,
      body_sent: body_sent ?? null,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ send: data });
}
