'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PortalSidebar from '../components/PortalSidebar';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [userName, setUserName] = useState('User');
  const [orgName, setOrgName] = useState('720 Companies');
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

      // Use API route to avoid RLS recursion on direct client queries
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const { profile } = await res.json();
          if (profile) {
            setUserName(profile.full_name ?? user.email ?? 'User');
            const org = profile.organizations as { name?: string; settings?: { onboarding_completed?: boolean } } | null;
            setOrgName(org?.name ?? '720 Companies');
            setIsAdmin(profile.role === 'admin');

            // Redirect to setup if onboarding not complete
            if (!org?.settings?.onboarding_completed) {
              router.replace('/portal/setup');
              return;
            }
          }
        }
      } catch {
        // Silent fail — let them in with defaults
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
