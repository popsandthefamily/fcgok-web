import { createServiceClient } from '@/lib/supabase/server';
import type { IntelItem } from '@/lib/types';
import Link from 'next/link';
import CompsClient from './CompsClient';

export const metadata = { title: 'Comparable Transactions' };
export const dynamic = 'force-dynamic';

export default async function CompsPage() {
  const supabase = await createServiceClient();

  // Fetch all deal_flow items; we'll filter client-side for rich interactivity
  const { data } = await supabase
    .from('intel_items')
    .select('*')
    .eq('category', 'deal_flow')
    .order('published_at', { ascending: false })
    .limit(500);

  const items = (data as IntelItem[] | null) ?? [];

  return (
    <>
      <div className="portal-header">
        <h1>Comparable Transactions</h1>
        <Link href="/portal" className="portal-btn portal-btn-ghost">
          &larr; Dashboard
        </Link>
      </div>
      <CompsClient items={items} />
    </>
  );
}
