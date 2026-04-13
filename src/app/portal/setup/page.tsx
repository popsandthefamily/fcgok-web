import { redirect } from 'next/navigation';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { createServiceClient } from '@/lib/supabase/server';
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
export default async function SetupPage() {
  const auth = await getAuthedUser();
  if (!auth) redirect('/portal/login?error=invite_required');
  if (!auth.orgId) redirect('/portal/login?error=invite_required');

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
