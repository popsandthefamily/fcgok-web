import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { Raise } from '@/lib/types/raises';
import RaiseDetail from './RaiseDetail';

export const dynamic = 'force-dynamic';

export default async function RaiseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) redirect('/portal/login');
  if (!auth.orgId) redirect('/portal');

  const { id } = await params;
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from('raises')
    .select('*')
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .single();

  if (!data) notFound();

  let linkedDocName: string | null = null;
  if (data.linked_document_id) {
    const { data: doc } = await supabase
      .from('documents')
      .select('deal_name')
      .eq('id', data.linked_document_id)
      .eq('organization_id', auth.orgId)
      .single();
    linkedDocName = doc?.deal_name ?? null;
  }

  return <RaiseDetail raise={data as Raise} linkedDocName={linkedDocName} />;
}
