import { cookies } from 'next/headers';
import { createClient as createSbClient, type SupabaseClient } from '@supabase/supabase-js';

// Reliable auth helper for Server Components and API route handlers.
//
// History:
//   1. Original version called serviceClient.auth.getUser(accessToken), which
//      hits Supabase's /auth/v1/user endpoint. That raced with middleware
//      token rotation — on Link prefetch + click the token we held could be
//      rotated out from under us mid-request, getUser() returned "invalid
//      token", and the page bounced to /portal/login.
//   2. Tried hand-rolled HS256 verification with SUPABASE_JWT_SECRET. That
//      works for legacy projects but this project uses asymmetric JWT keys
//      (ES256) — there is no shared secret — so every token failed to verify.
//
// Fix: supabase-js's auth.getClaims() verifies the JWT locally. It fetches
// the project's JWKS once on first call, caches it in memory on the client
// instance, and all subsequent calls are pure in-process signature
// verification. No per-request network call → no rotation race → no bounce.
// Works for both HS256 (legacy) and asymmetric (ES256/RS256) projects.

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

// Module-level client so the JWKS cache inside @supabase/supabase-js survives
// across requests within the same serverless instance.
let sharedClient: SupabaseClient | null = null;
function getSharedClient(): SupabaseClient {
  if (!sharedClient) {
    sharedClient = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return sharedClient;
}

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();

  const authPieces = all
    .filter((c) => AUTH_COOKIE_RE.test(c.name))
    .sort((a, b) => {
      // Sort chunks numerically so .0, .1, .2, …, .10 line up correctly.
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

  const client = getSharedClient();
  const { data, error } = await client.auth.getClaims(accessToken);
  if (error || !data?.claims?.sub) {
    if (error) console.warn('[auth-helper] getClaims error:', error.message);
    return null;
  }

  const userId = data.claims.sub as string;

  const { data: profile } = await client
    .from('user_profiles')
    .select('role, organization_id, organizations(slug)')
    .eq('id', userId)
    .single();

  const orgRaw = profile?.organizations as unknown;
  const org = orgRaw as { slug: string } | null;

  return {
    id: userId,
    email: (data.claims.email as string | undefined) ?? null,
    orgId: (profile?.organization_id as string | null) ?? null,
    orgSlug: org?.slug ?? null,
    role: (profile?.role as string | null) ?? null,
  };
}
