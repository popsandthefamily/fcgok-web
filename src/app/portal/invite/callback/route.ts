import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// Handles the landing URL from a Supabase "Invite user" email.
// Flow:
//   1. Supabase sends the invite email with a magic link.
//   2. User clicks → Supabase verifies → redirects here with `?code=…&token=…`.
//   3. We exchange the code for a session, validate our invitation row,
//      provision the user_profiles row, mark the invite consumed, and land
//      the user on the setup wizard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${origin}/portal/login?error=invalid_invite`);
  }

  const supabase = await createClient();

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`);
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`);
  }

  const service = await createServiceClient();
  const { data: invitation } = await service
    .from('invitations')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.redirect(`${origin}/portal/login?error=invalid_invite`);
  }
  if (invitation.consumed_at) {
    return NextResponse.redirect(`${origin}/portal/login?error=invite_used`);
  }
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return NextResponse.redirect(`${origin}/portal/login?error=invite_expired`);
  }
  if (invitation.email.toLowerCase() !== (user.email ?? '').toLowerCase()) {
    return NextResponse.redirect(`${origin}/portal/login?error=invite_email_mismatch`);
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
    return NextResponse.redirect(`${origin}/portal/login?error=profile_create_failed`);
  }

  await service
    .from('invitations')
    .update({ consumed_at: new Date().toISOString() })
    .eq('token', token);

  return NextResponse.redirect(`${origin}/portal/setup`);
}
