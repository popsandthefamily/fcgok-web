import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';
import { ensureProfileFromMetadata } from '@/lib/supabase/provision';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.warn('[auth/callback] missing code param');
    return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from Server Component
          }
        },
      },
    },
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession:', exchangeError.message);
    return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`);
  }

  // If the session user was invited but their user_profiles row never got
  // written (e.g. invite callback errored on first click), auto-provision
  // now from user_metadata so the magic-link retry path is self-healing.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const service = await createServiceClient();
    await ensureProfileFromMetadata(service, user);
  }

  return NextResponse.redirect(`${origin}/portal`);
}
