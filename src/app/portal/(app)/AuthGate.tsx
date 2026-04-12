'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PortalSidebar from '../components/PortalSidebar';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [userName, setUserName] = useState('User');
  const [orgName, setOrgName] = useState('FCG');
  const [isAdmin, setIsAdmin] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setState('unauthenticated');
        router.replace('/portal/login');
        return;
      }

      setUserName(user.email ?? 'User');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name ?? user.email ?? 'User');
        setOrgName((profile.organizations as { name: string } | null)?.name ?? 'FCG');
        setIsAdmin(profile.role === 'admin');
      }

      setState('authenticated');
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setState('unauthenticated');
        router.replace('/portal/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (state === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8f9fb', color: '#6b7280', fontSize: 14,
      }}>
        Loading...
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return null;
  }

  return (
    <div className="portal-layout">
      <PortalSidebar userName={userName} orgName={orgName} isAdmin={isAdmin} />
      <main className="portal-main">{children}</main>
    </div>
  );
}
