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
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo,
      data: { organization_id: org.id, role, org_name: orgName },
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    await supabase.from('invitations').delete().eq('token', token);
    await supabase.from('organizations').delete().eq('id', org.id);
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
    await supabase.from('invitations').delete().eq('token', token);
    await supabase.from('organizations').delete().eq('id', org.id);
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
