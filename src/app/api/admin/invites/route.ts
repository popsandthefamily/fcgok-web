import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { sendInviteEmail } from '@/lib/email/invite';
import type { SubscriptionTier, UserRole } from '@/lib/types';

const EXPIRY_DAYS = 7;

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return base || 'org';
}

interface InviteBody {
  email?: string;
  orgName?: string;
  role?: UserRole;
  tier?: SubscriptionTier;
}

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const superAdminEmail = process.env.PORTAL_SUPER_ADMIN_EMAIL?.toLowerCase();
  const isSuperAdmin =
    auth.role === 'super_admin' ||
    (!!superAdminEmail && auth.email?.toLowerCase() === superAdminEmail);
  if (!isSuperAdmin) {
    return NextResponse.json({ error: 'Super-admin access required' }, { status: 403 });
  }

  const body = (await request.json()) as InviteBody;
  const email = body.email?.toLowerCase().trim();
  const orgName = body.orgName?.trim();
  const role: UserRole = body.role ?? 'admin';
  const tier: SubscriptionTier = body.tier ?? 'standard';

  if (!email || !orgName) {
    return NextResponse.json(
      { error: 'email and orgName are required' },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Find a unique slug
  const baseSlug = slugify(orgName);
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!existing) break;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
    if (suffix > 50) {
      return NextResponse.json({ error: 'Unable to generate unique org slug' }, { status: 500 });
    }
  }

  // Create the organization shell (settings filled in during setup wizard)
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: orgName, slug, subscription_tier: tier, settings: {} })
    .select()
    .single();

  if (orgError || !org) {
    return NextResponse.json(
      { error: orgError?.message ?? 'Failed to create organization' },
      { status: 500 },
    );
  }

  // Generate invite token and persist the invitation row
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const { error: inviteInsertError } = await supabase.from('invitations').insert({
    token,
    email,
    organization_id: org.id,
    role,
    invited_by: auth.id,
    expires_at: expiresAt.toISOString(),
  });

  if (inviteInsertError) {
    await supabase.from('organizations').delete().eq('id', org.id);
    return NextResponse.json({ error: inviteInsertError.message }, { status: 500 });
  }

  // Mint a Supabase invite link (creates the auth.users row if needed, returns
  // a magic link we embed in our own branded email). We deliberately do NOT
  // call inviteUserByEmail here — that would trigger Supabase's default email.
  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/portal/invite/callback?token=${token}`;

  async function rollback(): Promise<void> {
    await supabase.from('invitations').delete().eq('token', token);
    await supabase.from('organizations').delete().eq('id', org!.id);
  }

  let { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo,
      data: { organization_id: org.id, role, org_name: orgName },
    },
  });

  // Fallback path: the auth.users row already exists (scanner-consumed a
  // prior invite, or this admin is resending). Look them up, make sure
  // they're not already an active member of some other org, rewrite their
  // user_metadata to point at the new org we just created, and re-issue
  // as a magic link instead of an invite. The downstream invite-callback
  // validates by our own token → new org → fresh setup wizard.
  const alreadyRegistered =
    linkError?.message?.toLowerCase().includes('already been registered') ||
    linkError?.message?.toLowerCase().includes('already registered') ||
    linkError?.message?.toLowerCase().includes('user already exists');

  if (alreadyRegistered) {
    const { data: listData, error: listError } =
      await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listError) {
      await rollback();
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const existingUser = listData.users.find(
      (u) => (u.email ?? '').toLowerCase() === email,
    );
    if (!existingUser) {
      await rollback();
      return NextResponse.json(
        { error: 'Supabase reports this email is registered but we cannot find the user record.' },
        { status: 500 },
      );
    }

    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('organization_id, organizations(name)')
      .eq('id', existingUser.id)
      .maybeSingle();

    if (existingProfile?.organization_id) {
      await rollback();
      const existingOrg = (existingProfile.organizations ?? null) as
        | { name?: string }
        | null;
      const orgLabel = existingOrg?.name ?? 'another organization';
      return NextResponse.json(
        { error: `${email} is already an active member of ${orgLabel}. Remove them there first if you need to move them.` },
        { status: 409 },
      );
    }

    // Rewrite metadata so the auth-callback self-heal lands them on the new org
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { user_metadata: { organization_id: org.id, role, org_name: orgName } },
    );
    if (updateError) {
      await rollback();
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    ({ data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
    }));
  }

  if (linkError || !linkData?.properties?.action_link) {
    await rollback();
    return NextResponse.json(
      { error: linkError?.message ?? 'Failed to generate invite link' },
      { status: 500 },
    );
  }

  const acceptUrl = linkData.properties.action_link;

  // Deliver the branded email via Resend from info@fcgok.com
  try {
    await sendInviteEmail({
      to: email,
      orgName,
      role,
      acceptUrl,
      expiresAt,
    });
  } catch (err) {
    // Roll back so the admin can retry with a clean slate
    await rollback();
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send invite email' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    invitation: {
      email,
      role,
      organization: { id: org.id, name: orgName, slug, subscription_tier: tier },
      expires_at: expiresAt.toISOString(),
      accept_url: acceptUrl,
    },
  });
}
