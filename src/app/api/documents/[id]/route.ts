import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

async function getUserOrg() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  return { userId: user.id, orgId: profile?.organization_id as string | undefined };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUserOrg();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('organization_id', auth.orgId!)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ document: data });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUserOrg();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const allowed = ['deal_name', 'template', 'deal_facts', 'sections', 'cover_image_url', 'settings', 'status'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', auth.orgId!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUserOrg();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('organization_id', auth.orgId!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
