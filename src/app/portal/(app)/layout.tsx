import { createClient } from '@/lib/supabase/server';
import PortalSidebar from '../components/PortalSidebar';

export const dynamic = 'force-dynamic';

export default async function AuthenticatedPortalLayout({ children }: { children: React.ReactNode }) {
  // Middleware already handles auth redirect — just fetch user info for sidebar
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName = user?.email ?? 'User';
  let orgName = 'FCG';
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single();

    if (profile) {
      userName = profile.full_name ?? user.email ?? 'User';
      orgName = (profile.organizations as { name: string } | null)?.name ?? 'FCG';
      isAdmin = profile.role === 'admin';
    }
  }

  return (
    <div className="portal-layout">
      <PortalSidebar
        userName={userName}
        orgName={orgName}
        isAdmin={isAdmin}
      />
      <main className="portal-main">
        {children}
      </main>
    </div>
  );
}
