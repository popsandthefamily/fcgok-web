import type { SupabaseClient, User } from '@supabase/supabase-js';

interface InviteMetadata {
  organization_id?: string;
  role?: string;
  org_name?: string;
}

// Ensures a user_profiles row exists for the given auth user.
//
// Recovery path for users whose /portal/invite/callback never completed —
// e.g. an email security scanner pre-consumed the Supabase one-time code,
// or the cookie-set step silently failed. Because the admin invite flow
// stuffs { organization_id, role } into user_metadata via generateLink's
// `data` option, any authenticated invitee carries enough context to
// self-heal on their next magic-link login.
//
// Returns true if a profile exists (either already there or freshly created),
// false if we had nothing to go on and could not provision.
export async function ensureProfileFromMetadata(
  service: SupabaseClient,
  user: User,
): Promise<boolean> {
  const { data: existing } = await service
    .from('user_profiles')
    .select('id, organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (existing?.organization_id) return true;

  const meta = (user.user_metadata ?? {}) as InviteMetadata;
  if (!meta.organization_id) {
    console.warn(
      '[provision] no organization_id in user_metadata for',
      user.id,
      user.email,
    );
    return false;
  }

  const { error } = await service
    .from('user_profiles')
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        organization_id: meta.organization_id,
        role: meta.role ?? 'member',
      },
      { onConflict: 'id' },
    );

  if (error) {
    console.error('[provision] upsert failed for', user.id, error.message);
    return false;
  }

  console.log('[provision] recovered profile for', user.email, '→ org', meta.organization_id);
  return true;
}
