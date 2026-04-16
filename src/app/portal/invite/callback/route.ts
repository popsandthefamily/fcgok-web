import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { ensureProfileFromMetadata } from '@/lib/supabase/provision';

// Handles the landing URL from a Supabase "Invite user" email.
// Flow:
//   1. Supabase sends the invite email with a magic link.
//   2. User clicks → Supabase verifies → redirects here with `?code=…&token=…`.
//   3. We exchange the code for a session, validate our invitation row,
//      provision the user_profiles row, mark the invite consumed, and land
//      the user on the setup wizard.
//
// Robustness: email security scanners (Outlook SafeLinks, Mimecast, etc.)
// often pre-fetch one-time links, consuming the Supabase code before the
// human can click. That used to dead-end invitees at a login loop. Now:
//   • every error branch logs why
//   • if the session user matches an already-consumed invite and already
//     has a profile, we fall through to setup instead of erroring
//   • /portal/auth/callback auto-provisions from user_metadata as a
//     backstop, so magic-link retry also recovers
function logRedirect(reason: string, detail?: Record<string, unknown>): void {
  console.error('[invite/callback]', reason, detail ?? {});
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token = searchParams.get('token');

  if (!token) {
    logRedirect('missing_token');
    return NextResponse.redirect(`${origin}/portal/login?error=invalid_invite`);
  }

  const supabase = await createClient();

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      logRedirect('exchange_failed', { message: exchangeError.message });
      return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`);
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    logRedirect('no_user_after_exchange');
    return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`);
  }

  const service = await createServiceClient();
  const { data: invitation } = await service
    .from('invitations')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (!invitation) {
    logRedirect('invitation_not_found', { token_prefix: token.slice(0, 8) });
    return NextResponse.redirect(`${origin}/portal/login?error=invalid_invite`);
  }

  if (invitation.email.toLowerCase() !== (user.email ?? '').toLowerCase()) {
    logRedirect('email_mismatch', {
      invite_email: invitation.email,
      session_email: user.email,
    });
    return NextResponse.redirect(`${origin}/portal/login?error=invite_email_mismatch`);
  }

  // Idempotent path: if the invite was already consumed (scanner prefetch,
  // double-click, browser retry), make sure the profile exists and send
  // them forward instead of bouncing to login.
  if (invitation.consumed_at) {
    const provisioned = await ensureProfileFromMetadata(service, user);
    if (provisioned) {
      console.log('[invite/callback] replay accepted for', user.email);
      return NextResponse.redirect(`${origin}/portal/setup`);
    }
    logRedirect('consumed_but_no_profile', { email: user.email });
    return NextResponse.redirect(`${origin}/portal/login?error=invite_used`);
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    logRedirect('expired', { email: user.email, expires_at: invitation.expires_at });
    return NextResponse.redirect(`${origin}/portal/login?error=invite_expired`);
  }

  const { error: profileError } = await service
    .from('user_profiles')
    .upsert(
      {
        id: user.id,
        email: user.email ?? invitation.email,
        organization_id: invitation.organization_id,
        role: invitation.role,
      },
      { onConflict: 'id' },
    );

  if (profileError) {
    logRedirect('profile_upsert_failed', { message: profileError.message });
    return NextResponse.redirect(`${origin}/portal/login?error=profile_create_failed`);
  }

  await service
    .from('invitations')
    .update({ consumed_at: new Date().toISOString() })
    .eq('token', token);

  return NextResponse.redirect(`${origin}/portal/setup`);
}
