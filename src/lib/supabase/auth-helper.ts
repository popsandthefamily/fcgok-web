import { cookies } from 'next/headers';
import { createClient as createSbClient } from '@supabase/supabase-js';

// Reliable auth helper for API route handlers.
// Reads the Supabase auth cookie directly and verifies the JWT using
// the service client, which avoids flakey getUser() behavior in POSTs.

export interface AuthedUser {
  id: string;
  email: string | null;
  orgId: string | null;
  orgSlug: string | null;
  role: string | null;
}

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();

  // Find the Supabase auth cookie (may be chunked: sb-<ref>-auth-token.0, .1, ...)
  const authPieces = all
    .filter((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (authPieces.length === 0) return null;

  // Join chunked cookies and parse
  let rawValue = authPieces.map((c) => c.value).join('');

  // Remove the "base64-" prefix if present (newer Supabase SSR format)
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
    } else if (parsed.access_token) {
      accessToken = parsed.access_token;
    } else if (parsed.currentSession?.access_token) {
      accessToken = parsed.currentSession.access_token;
    }
  } catch {
    // Fallback: treat the raw value as the token
    accessToken = rawValue;
  }

  if (!accessToken) return null;

  // Verify the token with Supabase using the service role client
  const serviceClient = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: { user }, error } = await serviceClient.auth.getUser(accessToken);
  if (error || !user) return null;

  // Fetch org + role via service client (bypasses RLS)
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
