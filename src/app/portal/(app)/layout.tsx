import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import AuthGate from './AuthGate';

export const dynamic = 'force-dynamic';

export default async function AuthenticatedPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getAuthedUser reads the sb-*-auth-token cookie directly and validates
  // the access token via the service client. It does NOT attempt a refresh,
  // so it can't collide with the middleware's refresh path the way a second
  // createClient().auth.getUser() call could. Middleware is still responsible
  // for refreshing the session cookies on each request.
  const auth = await getAuthedUser();
  if (!auth) redirect('/portal/login');

  const service = await createServiceClient();
  const { data: profile } = await service
    .from('user_profiles')
    .select('full_name, organizations(name, settings)')
    .eq('id', auth.id)
    .maybeSingle();

  const org = (profile?.organizations ?? null) as
    | { name?: string; settings?: { onboarding_completed?: boolean } }
    | null;

  if (!org?.settings?.onboarding_completed) {
    redirect('/portal/setup');
  }

  return (
    <AuthGate
      userName={(profile?.full_name as string | null) ?? auth.email ?? 'User'}
      orgName={org?.name ?? '720 Companies'}
      isAdmin={auth.role === 'admin'}
    >
      {children}
    </AuthGate>
  );
}
