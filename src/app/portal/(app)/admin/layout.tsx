import { redirect } from 'next/navigation';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthedUser();
  if (!auth) redirect('/portal/login');
  if (auth.role !== 'admin' || !auth.orgId) redirect('/portal');
  return children;
}
