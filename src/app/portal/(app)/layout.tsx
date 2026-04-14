import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import AuthGate from './AuthGate';

export const dynamic = 'force-dynamic';

export default async function AuthenticatedPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/portal/login');

  const service = await createServiceClient();
  const { data: profile } = await service
    .from('user_profiles')
    .select('full_name, role, organizations(name, settings)')
    .eq('id', user.id)
    .maybeSingle();

  const org = (profile?.organizations ?? null) as
    | { name?: string; settings?: { onboarding_completed?: boolean } }
    | null;

  if (!org?.settings?.onboarding_completed) {
    redirect('/portal/setup');
  }

  return (
    <AuthGate
      userName={(profile?.full_name as string | null) ?? user.email ?? 'User'}
      orgName={org?.name ?? '720 Companies'}
      isAdmin={profile?.role === 'admin'}
    >
      {children}
    </AuthGate>
  );
}
