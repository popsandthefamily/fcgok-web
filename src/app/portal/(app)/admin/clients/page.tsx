import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import MembersClient from './MembersClient';
import type { UserProfile, UserRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PendingInvite {
  id: string;
  email: string;
  role: UserRole;
  expires_at: string;
  created_at: string;
}

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  subscription_tier: string;
  settings?: { brand?: { logo_url?: string; tagline?: string } };
}

export default async function MembersPage() {
  const auth = await getAuthedUser();
  if (!auth) redirect('/portal/login');
  if (auth.role !== 'admin' || !auth.orgId) redirect('/portal');

  const service = await createServiceClient();

  const [orgRes, membersRes, invitesRes] = await Promise.all([
    service
      .from('organizations')
      .select('id, name, slug, subscription_tier, settings')
      .eq('id', auth.orgId)
      .single(),
    service
      .from('user_profiles')
      .select('*')
      .eq('organization_id', auth.orgId)
      .order('created_at', { ascending: true }),
    service
      .from('invitations')
      .select('id, email, role, expires_at, consumed_at, created_at')
      .eq('organization_id', auth.orgId)
      .is('consumed_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }),
  ]);

  return (
    <MembersClient
      currentUserId={auth.id}
      org={(orgRes.data ?? null) as OrgInfo | null}
      initialMembers={(membersRes.data ?? []) as UserProfile[]}
      initialPending={(invitesRes.data ?? []) as PendingInvite[]}
    />
  );
}
