import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalSidebar from '../components/PortalSidebar';

export default async function AuthenticatedPortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/portal/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single();

  return (
    <div className="portal-layout">
      <PortalSidebar
        userName={profile?.full_name ?? user.email ?? 'User'}
        orgName={(profile?.organizations as { name: string } | null)?.name ?? 'FCG'}
        isAdmin={profile?.role === 'admin'}
      />
      <main className="portal-main">
        {children}
      </main>
    </div>
  );
}
