import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendInviteEmail } from '@/lib/email/invite';
import type { UserRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

const EXPIRY_DAYS = 7;

interface InviteBody {
  email?: string;
  role?: UserRole;
  fullName?: string;
}

async function resolveAdmin() {
  const sb = await createClient();
  const { data: { user }, error } = await sb.auth.getUser();
  if (error || !user) return { error: 'Unauthorized', status: 401 as const };

  const service = await createServiceClient();
  const { data: profile } = await service
    .from('user_profiles')
    .select('id, role, organization_id, full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return { error: 'Profile not found', status: 404 as const };
  if (profile.role !== 'admin') return { error: 'Admin access required', status: 403 as const };
  if (!profile.organization_id) return { error: 'No organization', status: 400 as const };

  return {
    user: {
      id: profile.id as string,
      email: profile.email as string,
      orgId: profile.organization_id as string,
      role: profile.role as UserRole,
    },
  };
}

// GET — list members + pending invites for the calling admin's organization
export async function GET(request: Request) {
  const result = await resolveAdmin();
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const supabase = await createServiceClient();
  const [profilesRes, invitesRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', result.user.orgId)
      .order('created_at', { ascending: true }),
    supabase
      .from('invitations')
      .select('id, email, role, expires_at, consumed_at, created_at')
      .eq('organization_id', result.user.orgId)
      .is('consumed_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }),
  ]);

  return NextResponse.json({
    members: profilesRes.data ?? [],
    pendingInvites: invitesRes.data ?? [],
  });
}

// POST — invite a new user to the calling admin's existing organization
export async function POST(request: Request) {
  const result = await resolveAdmin();
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { user: admin } = result;

  const body = (await request.json()) as InviteBody;
  const email = body.email?.toLowerCase().trim();
  const role: UserRole = body.role ?? 'viewer';

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', admin.orgId)
    .single();
  const orgName = (org?.name as string) ?? 'Frontier Intelligence';

  // Reject duplicates within this org
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .eq('organization_id', admin.orgId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: 'That email is already a member of this workspace' },
      { status: 409 },
    );
  }

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const { data: invitation, error: insertErr } = await supabase
    .from('invitations')
    .insert({
      token,
      email,
      organization_id: admin.orgId,
      role,
      invited_by: admin.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (insertErr || !invitation) {
    return NextResponse.json(
      { error: insertErr?.message ?? 'Failed to record invitation' },
      { status: 500 },
    );
  }

  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/portal/invite/callback?token=${token}`;

  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo,
      data: { organization_id: admin.orgId, role, org_name: orgName },
    },
  });

  if (linkErr || !linkData?.properties?.action_link) {
    await supabase.from('invitations').delete().eq('id', invitation.id);
    return NextResponse.json(
      { error: linkErr?.message ?? 'Failed to generate invite link' },
      { status: 500 },
    );
  }

  try {
    await sendInviteEmail({
      to: email,
      orgName,
      role,
      acceptUrl: linkData.properties.action_link,
      expiresAt,
    });
  } catch (err) {
    await supabase.from('invitations').delete().eq('id', invitation.id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send invite email' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    invitation: {
      id: invitation.id,
      email,
      role,
      expires_at: expiresAt.toISOString(),
      accept_url: linkData.properties.action_link,
    },
  });
}
