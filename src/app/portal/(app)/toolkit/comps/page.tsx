import { createServiceClient } from '@/lib/supabase/server';
import type { IntelItem } from '@/lib/types';
import Link from 'next/link';
import CompsFilters from './CompsFilters';

export const metadata = { title: 'Comparable Transactions' };

interface SearchParams {
  geo?: string;
  from?: string;
  to?: string;
}

export default async function CompsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const geo = params.geo ?? '';
  const dateFrom = params.from ?? '';
  const dateTo = params.to ?? '';

  const supabase = await createServiceClient();

  let query = supabase
    .from('intel_items')
    .select('*')
    .eq('category', 'deal_flow')
    .or('tags.cs.{transaction},tags.cs.{acquisition}')
    .order('published_at', { ascending: false })
    .limit(100);

  if (geo) {
    query = query.textSearch('title', geo, { type: 'websearch' });
  }
  if (dateFrom) {
    query = query.gte('published_at', dateFrom);
  }
  if (dateTo) {
    query = query.lte('published_at', dateTo);
  }

  const { data } = await query;
  const items = (data as IntelItem[] | null) ?? [];

  return (
    <>
      <div className="portal-header">
        <h1>Comparable Transactions</h1>
        <Link href="/portal/toolkit" className="portal-btn portal-btn-ghost">
          &larr; Toolkit
        </Link>
      </div>

      <CompsFilters geo={geo} dateFrom={dateFrom} dateTo={dateTo} />

      {items.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            No comparable transactions found. Adjust your filters or check back as new deal flow intel is ingested.
          </p>
        </div>
      ) : (
        <div className="portal-card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</th>
                <th style={{ padding: '8px 12px', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</th>
                <th style={{ padding: '8px 12px', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Entities</th>
                <th style={{ padding: '8px 12px', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Locations</th>
                <th style={{ padding: '8px 12px', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount</th>
                <th style={{ padding: '8px 12px', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const entities = item.ai_analysis?.entities;
                const companies = entities?.companies ?? [];
                const locations = entities?.locations ?? [];
                const dollars = entities?.dollar_amounts ?? [];

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#6b7280' }}>
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '--'}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: '#111827' }}>
                      {item.title}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#374151' }}>
                      {companies.length > 0 ? companies.join(', ') : '--'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#374151' }}>
                      {locations.length > 0 ? locations.join(', ') : '--'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#374151', whiteSpace: 'nowrap' }}>
                      {dollars.length > 0 ? dollars.join(', ') : '--'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {item.source_url ? (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1a3a2a', textDecoration: 'none', fontSize: 12 }}
                        >
                          View &rarr;
                        </a>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
