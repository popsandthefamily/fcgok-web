import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/portal/login');

  const service = await createServiceClient();

  const { data: profile } = await service
    .from('user_profiles')
    .select('id, role, organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin' || !profile.organization_id) {
    redirect('/portal');
  }
  const orgId = profile.organization_id as string;

  const [orgRes, membersRes, invitesRes] = await Promise.all([
    service
      .from('organizations')
      .select('id, name, slug, subscription_tier, settings')
      .eq('id', orgId)
      .single(),
    service
      .from('user_profiles')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true }),
    service
      .from('invitations')
      .select('id, email, role, expires_at, consumed_at, created_at')
      .eq('organization_id', orgId)
      .is('consumed_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }),
  ]);

  return (
    <MembersClient
      currentUserId={user.id}
      org={(orgRes.data ?? null) as OrgInfo | null}
      initialMembers={(membersRes.data ?? []) as UserProfile[]}
      initialPending={(invitesRes.data ?? []) as PendingInvite[]}
    />
  );
}
