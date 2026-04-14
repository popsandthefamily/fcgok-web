'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PortalSidebar from '../components/PortalSidebar';

interface Props {
  userName: string;
  orgName: string;
  isAdmin: boolean;
  children: React.ReactNode;
}

export default function AuthGate({ userName, orgName, isAdmin, children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/portal/login');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="portal-layout">
      <PortalSidebar userName={userName} orgName={orgName} isAdmin={isAdmin} />
      <main className="portal-main">{children}</main>
    </div>
  );
}
