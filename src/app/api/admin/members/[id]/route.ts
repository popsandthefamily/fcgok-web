import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { UserRole } from '@/lib/types';

// PUT — update a member's role (admin only, scoped to own org)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const body = (await request.json()) as { role?: UserRole };
  if (!body.role) return NextResponse.json({ error: 'role required' }, { status: 400 });

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role: body.role })
    .eq('id', id)
    .eq('organization_id', auth.orgId!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ member: data });
}

// DELETE — remove a member from the org (orphans their auth user but
// removes the user_profiles link so they can't see this workspace anymore)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  if (id === auth.id) {
    return NextResponse.json({ error: "You can't remove yourself" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', id)
    .eq('organization_id', auth.orgId!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Invitation revoke
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const body = (await request.json()) as { action?: string };
  if (body.action !== 'revoke_invite') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', id)
    .eq('organization_id', auth.orgId!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
