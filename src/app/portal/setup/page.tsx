import { redirect } from 'next/navigation';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { ensureProfileFromMetadata } from '@/lib/supabase/provision';
import type { Organization } from '@/lib/types';
import SetupClient from './SetupClient';

// The setup wizard is only reachable through the admin-generated invite flow.
// An admin invites a user → Supabase sends the invite email → user clicks →
// /portal/invite/callback provisions their user_profiles row (linked to the
// pre-created org) and redirects here. We gate the page on three conditions:
//   1. There is a live session.
//   2. The user's profile is linked to an organization.
//   3. That organization has not yet completed onboarding.
// Anyone who hits /portal/setup without satisfying these gets kicked out.
//
// Self-heal: if the session is valid but user_profiles is missing (e.g. the
// original invite callback errored because an email scanner pre-consumed
// the Supabase code), fall back to provisioning from auth.users metadata
// before giving up. user_metadata carries organization_id + role from the
// admin invite's generateLink data payload.
export default async function SetupPage() {
  let auth = await getAuthedUser();
  if (!auth) redirect('/portal/login?error=invite_required');

  if (!auth.orgId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const service = await createServiceClient();
      await ensureProfileFromMetadata(service, user);
    }
    auth = await getAuthedUser();
    if (!auth?.orgId) redirect('/portal/login?error=invite_required');
  }

  const supabase = await createServiceClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', auth.orgId)
    .single();

  if (!org) redirect('/portal/login?error=invite_required');

  const settings = (org.settings ?? {}) as { onboarding_completed?: boolean };
  if (settings.onboarding_completed) redirect('/portal');

  return <SetupClient org={org as Organization} />;
}
