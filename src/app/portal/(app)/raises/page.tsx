import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { Raise, RaiseStatus } from '@/lib/types/raises';
import { RAISE_STATUS_LABELS } from '@/lib/types/raises';

export const dynamic = 'force-dynamic';

const STATUS_FILTERS: RaiseStatus[] = ['draft', 'active', 'paused', 'closed_won', 'closed_lost'];

function formatUsd(n: number | null): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default async function RaisesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const auth = await getAuthedUser();
  if (!auth) redirect('/portal/login');
  if (!auth.orgId) redirect('/portal');

  const params = await searchParams;
  const activeStatus = params.status ?? null;

  const supabase = await createServiceClient();
  let query = supabase
    .from('raises')
    .select('*')
    .eq('organization_id', auth.orgId)
    .order('updated_at', { ascending: false });
  if (activeStatus) query = query.eq('status', activeStatus);

  const { data } = await query;
  const raises = (data as Raise[]) ?? [];

  return (
    <>
      <div className="portal-header">
        <h1>Capital Raises</h1>
        <Link href="/portal/raises/new" className="portal-btn portal-btn-primary">+ New Raise</Link>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Each raise is a deal you're matching investors against. Profile fields below drive
        fit scoring once that ships in the next release.
      </p>

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Status:
        </span>
        <Link href="/portal/raises" className={`filter-chip${!activeStatus ? ' active' : ''}`}>All</Link>
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/portal/raises?status=${s}`}
            className={`filter-chip${activeStatus === s ? ' active' : ''}`}
          >
            {RAISE_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: '1rem' }}>
        {raises.length} {raises.length === 1 ? 'raise' : 'raises'}
        {activeStatus ? ` with status "${RAISE_STATUS_LABELS[activeStatus as RaiseStatus] ?? activeStatus}"` : ''}
      </div>

      {raises.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>
            No raises yet. Create one to start matching investors.
          </p>
          <Link href="/portal/raises/new" className="portal-btn portal-btn-primary">+ New Raise</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {raises.map((r) => (
            <RaiseCard key={r.id} raise={r} />
          ))}
        </div>
      )}
    </>
  );
}

function RaiseCard({ raise: r }: { raise: Raise }) {
  const tagline = [r.asset_class, r.stage, r.structure].filter(Boolean).join(' · ');
  const geography = r.geography?.length ? r.geography.join(', ') : null;

  return (
    <Link
      href={`/portal/raises/${r.id}`}
      className="portal-card"
      style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{r.name}</div>
          {tagline && (
            <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>{tagline.replace(/_/g, ' ')}</div>
          )}
        </div>
        <span className={`status-badge status-${statusToBadge(r.status)}`}>
          {RAISE_STATUS_LABELS[r.status]}
        </span>
      </div>

      {r.use_of_funds && (
        <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 8, lineHeight: 1.5 }}>
          {r.use_of_funds.length > 140 ? r.use_of_funds.slice(0, 140) + '…' : r.use_of_funds}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
        <Stat label="Sought" value={formatUsd(r.amount_sought_usd)} />
        <Stat label="Min check" value={formatUsd(r.min_check_usd)} />
        <Stat label="Max check" value={formatUsd(r.max_check_usd)} />
        {r.target_close_date && <Stat label="Target close" value={r.target_close_date} />}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #f3f4f6',
          paddingTop: 10,
          fontSize: 12,
          color: '#9ca3af',
        }}
      >
        <span>{geography ?? 'No geography set'}</span>
        <span>updated {new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function statusToBadge(status: RaiseStatus): string {
  switch (status) {
    case 'active': return 'active';
    case 'draft': return 'watching';
    case 'paused': return 'contacted';
    case 'closed_won': return 'engaged';
    case 'closed_lost': return 'passed';
  }
}
