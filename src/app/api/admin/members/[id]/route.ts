import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function resolveAdmin() {
  const sb = await createClient();
  const { data: { user }, error } = await sb.auth.getUser();
  if (error || !user) return { error: 'Unauthorized', status: 401 as const };

  const service = await createServiceClient();
  const { data: profile } = await service
    .from('user_profiles')
    .select('id, role, organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return { error: 'Profile not found', status: 404 as const };
  if (profile.role !== 'admin') return { error: 'Admin access required', status: 403 as const };
  if (!profile.organization_id) return { error: 'No organization', status: 400 as const };

  return {
    user: {
      id: profile.id as string,
      orgId: profile.organization_id as string,
    },
  };
}

// PUT — update a member's role (scoped to admin's own org)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await resolveAdmin();
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { id } = await params;
  const body = (await request.json()) as { role?: UserRole };
  if (!body.role) return NextResponse.json({ error: 'role required' }, { status: 400 });

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role: body.role })
    .eq('id', id)
    .eq('organization_id', result.user.orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ member: data });
}

// DELETE — remove a member from the org
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await resolveAdmin();
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { id } = await params;
  if (id === result.user.id) {
    return NextResponse.json({ error: "You can't remove yourself" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', id)
    .eq('organization_id', result.user.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH action=revoke_invite — revoke a pending invitation (id is invitation id)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await resolveAdmin();
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

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
    .eq('organization_id', result.user.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
