import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalSidebar from './components/PortalSidebar';
import './portal.css';

export const metadata: Metadata = {
  title: { default: 'FCG Capital Intelligence Portal', template: '%s | FCG Portal' },
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-next-pathname') ?? '';

  // Let login page render without auth
  if (pathname.startsWith('/portal/login')) {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/portal/login');

  // Fetch user profile for role/org
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
