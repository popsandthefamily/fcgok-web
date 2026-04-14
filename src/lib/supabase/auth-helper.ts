import { cookies } from 'next/headers';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'node:crypto';

// Reliable auth helper for Server Components and API route handlers.
//
// History: we previously validated the access token by calling
// serviceClient.auth.getUser(accessToken), which hits Supabase's auth
// endpoint. That races with middleware token rotation — on Link prefetch +
// click the token we hold can be rotated out from under us mid-request,
// getUser() returns "invalid token", and the page bounces to /portal/login.
//
// Fix: verify the JWT locally with SUPABASE_JWT_SECRET. Supabase issues
// HS256-signed JWTs, which node:crypto can verify without a network call.
// No network → no race → no spurious logouts.

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

interface SupabaseJwtPayload {
  sub?: string;
  email?: string;
  exp?: number;
}

function base64UrlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function verifyHs256(token: string, secret: string): SupabaseJwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;

  // Header check — Supabase uses HS256.
  let header: { alg?: string; typ?: string };
  try {
    header = JSON.parse(base64UrlDecode(headerB64).toString('utf-8'));
  } catch {
    return null;
  }
  if (header.alg !== 'HS256') return null;

  // Recompute signature over "header.payload" and compare constant-time.
  const expected = createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest();
  const actual = base64UrlDecode(signatureB64);
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  let payload: SupabaseJwtPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf-8'));
  } catch {
    return null;
  }

  // exp is seconds since epoch
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
    return null;
  }

  return payload;
}

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const jwtSecret = process.env.SUPABASE_JWT_SECRET;
  if (!jwtSecret) {
    console.error('[auth-helper] SUPABASE_JWT_SECRET is not set');
    return null;
  }

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

  const payload = verifyHs256(accessToken, jwtSecret);
  if (!payload?.sub) return null;

  const serviceClient = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: profile } = await serviceClient
    .from('user_profiles')
    .select('role, organization_id, organizations(slug)')
    .eq('id', payload.sub)
    .single();

  const orgRaw = profile?.organizations as unknown;
  const org = orgRaw as { slug: string } | null;

  return {
    id: payload.sub,
    email: payload.email ?? null,
    orgId: (profile?.organization_id as string | null) ?? null,
    orgSlug: org?.slug ?? null,
    role: (profile?.role as string | null) ?? null,
  };
}
