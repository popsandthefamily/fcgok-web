import { createClient, createServiceClient } from './server';

// Reliable auth helper for API route handlers.
// Uses the @supabase/ssr server client to resolve the session (which handles
// chunked cookies, base64 encoding, and PKCE code-verifier cookies correctly),
// then fetches org + role via the service client to bypass RLS.

export interface AuthedUser {
  id: string;
  email: string | null;
  orgId: string | null;
  orgSlug: string | null;
  role: string | null;
}

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const serviceClient = await createServiceClient();

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
