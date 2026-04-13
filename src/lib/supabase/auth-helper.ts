import { cookies } from 'next/headers';
import { createClient as createSbClient } from '@supabase/supabase-js';

// Reliable auth helper for API route handlers.
//
// We hand-roll the Supabase auth cookie read because @supabase/ssr's
// getUser() call has historically been flaky inside POST/PUT route handlers
// (token refresh attempts collide with body parsing). Reading the cookie
// directly and validating the JWT via the service client bypasses all that.
//
// Cookie format notes:
//   • Single cookie:      sb-<ref>-auth-token
//   • Chunked cookies:    sb-<ref>-auth-token.0, .1, .2, …
//   • PKCE artifact:      sb-<ref>-auth-token-code-verifier  ← MUST be excluded
//   • Value may be prefixed with "base64-" (newer SSR format) and then
//     contains a JSON-encoded session blob.

export interface AuthedUser {
  id: string;
  email: string | null;
  orgId: string | null;
  orgSlug: string | null;
  role: string | null;
}

// Matches both non-chunked (`sb-xxx-auth-token`) and chunked (`...-auth-token.0`)
// but deliberately NOT `-auth-token-code-verifier` or other `-auth-token-*` suffixes.
const AUTH_COOKIE_RE = /^sb-.+-auth-token(\.\d+)?$/;

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();

  const authPieces = all
    .filter((c) => AUTH_COOKIE_RE.test(c.name))
    .sort((a, b) => {
      // Sort chunks numerically so .0, .1, .2, …, .10 line up correctly.
      // The single (unchunked) cookie has no dot suffix → index 0.
      const indexOf = (name: string): number => {
        const match = name.match(/\.(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return indexOf(a.name) - indexOf(b.name);
    });

  if (authPieces.length === 0) return null;

  let rawValue = authPieces.map((c) => c.value).join('');

  // Newer SSR format wraps the JSON session in "base64-<payload>"
  if (rawValue.startsWith('base64-')) {
    try {
      rawValue = Buffer.from(rawValue.slice('base64-'.length), 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }

  let accessToken: string | null = null;
  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      accessToken = parsed[0];
    } else if (parsed?.access_token) {
      accessToken = parsed.access_token;
    } else if (parsed?.currentSession?.access_token) {
      accessToken = parsed.currentSession.access_token;
    }
  } catch {
    accessToken = rawValue;
  }

  if (!accessToken) return null;

  const serviceClient = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: { user }, error } = await serviceClient.auth.getUser(accessToken);
  if (error || !user) return null;

  const { data: profile } = await serviceClient
    .from('user_profiles')
    .select('role, organization_id, organizations(slug)')
    .eq('id', user.id)
    .single();

  const orgRaw = profile?.organizations as unknown;
  const org = orgRaw as { slug: string } | null;

  return {
    id: user.id,
    email: user.email ?? null,
    orgId: (profile?.organization_id as string | null) ?? null,
    orgSlug: org?.slug ?? null,
    role: (profile?.role as string | null) ?? null,
  };
}
