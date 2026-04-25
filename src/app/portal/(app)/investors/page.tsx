import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { TrackedEntity, EntityStatus, EntityType } from '@/lib/types';
import Link from 'next/link';

const STATUSES: EntityStatus[] = ['active', 'watching', 'contacted', 'engaged', 'passed'];
const ENTITY_TYPES: EntityType[] = ['company', 'person', 'fund'];

export default async function InvestorRadarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const activeStatus = params.status ?? null;
  const activeType = params.type ?? null;
  const auth = await getAuthedUser();
  if (!auth?.orgId) {
    return null;
  }

  const supabase = await createServiceClient();

  let query = supabase
    .from('tracked_entities')
    .select('*')
    .eq('organization_id', auth.orgId)
    .order('last_activity_at', { ascending: false, nullsFirst: false });

  if (activeStatus) {
    query = query.eq('status', activeStatus);
  }
  if (activeType) {
    query = query.eq('entity_type', activeType);
  }

  const { data } = await query;
  const entities = (data as TrackedEntity[]) ?? [];

  return (
    <>
      <div className="portal-header">
        <h1>Investor Radar</h1>
        <Link href="/portal/admin/entities" className="portal-btn portal-btn-primary">
          + Add Entity
        </Link>
      </div>

      {/* Status filter chips */}
      <div className="filter-bar">
        <span
          style={{
            fontSize: 11,
            color: '#9ca3af',
            alignSelf: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Status:
        </span>
        <Link
          href="/portal/investors"
          className={`filter-chip${!activeStatus ? ' active' : ''}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/portal/investors?status=${s}${activeType ? `&type=${activeType}` : ''}`}
            className={`filter-chip${activeStatus === s ? ' active' : ''}`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Type filter chips */}
      <div className="filter-bar" style={{ marginBottom: '2rem' }}>
        <span
          style={{
            fontSize: 11,
            color: '#9ca3af',
            alignSelf: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Type:
        </span>
        <Link
          href={`/portal/investors${activeStatus ? `?status=${activeStatus}` : ''}`}
          className={`filter-chip${!activeType ? ' active' : ''}`}
        >
          All
        </Link>
        {ENTITY_TYPES.map((t) => (
          <Link
            key={t}
            href={`/portal/investors?${activeStatus ? `status=${activeStatus}&` : ''}type=${t}`}
            className={`filter-chip${activeType === t ? ' active' : ''}`}
          >
            {t}
          </Link>
        ))}
      </div>

      {/* Results count */}
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: '1rem' }}>
        {entities.length} {entities.length === 1 ? 'entity' : 'entities'}
        {activeStatus ? ` with status "${activeStatus}"` : ''}
        {activeType ? ` of type "${activeType}"` : ''}
      </div>

      {/* Entity grid */}
      {entities.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            No entities match your filters. Adjust your criteria or add a new entity.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}
        >
          {entities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
      )}
    </>
  );
}

function EntityCard({ entity }: { entity: TrackedEntity }) {
  const categories = entity.categories?.length
    ? entity.categories.map((c) => c.replace('_', ' ')).join(', ')
    : null;
  const geography = entity.geography?.length
    ? entity.geography.join(', ')
    : null;

  return (
    <Link
      href={`/portal/investors/${entity.id}`}
      className="portal-card"
      style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s' }}
    >
      {/* Header row: name + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
            {entity.name}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>
            {entity.entity_type}
          </div>
        </div>
        <span className={`status-badge status-${entity.status}`}>
          {entity.status}
        </span>
      </div>

      {/* Categories */}
      {categories && (
        <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 6 }}>
          {categories}
        </div>
      )}

      {/* Geography */}
      {geography && (
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          {geography}
        </div>
      )}

      {/* Footer: activity stats */}
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
        <span>{entity.activity_count} intel items</span>
        <span>
          {entity.last_activity_at
            ? timeAgo(entity.last_activity_at)
            : 'No activity'}
        </span>
      </div>
    </Link>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
