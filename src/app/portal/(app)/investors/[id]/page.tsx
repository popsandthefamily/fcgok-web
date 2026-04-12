import { createClient } from '@/lib/supabase/server';
import type { TrackedEntity, IntelItem } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function EntityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch entity
  const { data: entity } = await supabase
    .from('tracked_entities')
    .select('*')
    .eq('id', id)
    .single();

  if (!entity) notFound();

  const tracked = entity as TrackedEntity;

  // Fetch linked intel items via junction table
  const { data: links } = await supabase
    .from('entity_intel_links')
    .select('relationship, intel_items(*)')
    .eq('entity_id', id)
    .order('intel_items(published_at)', { ascending: false });

  const linkedItems: Array<{
    relationship: string;
    item: IntelItem;
  }> = (links ?? [])
    .filter((link) => link.intel_items)
    .map((link) => ({
      relationship: link.relationship,
      item: link.intel_items as unknown as IntelItem,
    }));

  // Format deal size
  const dealSize = formatDealSize(tracked.deal_size_min, tracked.deal_size_max);

  // Format categories
  const categories = tracked.categories?.length
    ? tracked.categories.map((c) => c.replace('_', ' '))
    : [];

  return (
    <>
      {/* Header */}
      <div className="portal-header">
        <div>
          <Link
            href="/portal/investors"
            style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', marginBottom: 4, display: 'inline-block' }}
          >
            &larr; Back to Investor Radar
          </Link>
          <h1>{tracked.name}</h1>
        </div>
        <Link href="/portal/admin/entities" className="portal-btn portal-btn-ghost">
          Edit Entity
        </Link>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* ── Main content ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Entity overview */}
          <div className="portal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#6b7280', textTransform: 'capitalize' }}>
                {tracked.entity_type}
              </span>
              <span className={`status-badge status-${tracked.status}`}>
                {tracked.status}
              </span>
            </div>
            {tracked.description && (
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>
                {tracked.description}
              </p>
            )}
          </div>

          {/* Activity timeline */}
          <div className="portal-card">
            <div className="portal-card-header">
              <span className="portal-card-title">Activity Timeline</span>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {linkedItems.length} linked {linkedItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {linkedItems.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af' }}>
                No intel items linked to this entity yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {linkedItems.map(({ relationship, item }, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: 14,
                      padding: '14px 0',
                      borderTop: idx > 0 ? '1px solid #f3f4f6' : 'none',
                    }}
                  >
                    {/* Timeline indicator */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 16,
                        paddingTop: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#1a3a2a',
                          flexShrink: 0,
                        }}
                      />
                      {idx < linkedItems.length - 1 && (
                        <div
                          style={{
                            width: 1,
                            flex: 1,
                            background: '#e5e7eb',
                            marginTop: 4,
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                          {item.published_at
                            ? new Date(item.published_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Unknown date'}
                        </span>
                        <span className="badge badge-source" data-source={item.source}>
                          {item.source.toUpperCase()}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: '#6b7280',
                            background: '#f3f4f6',
                            padding: '1px 6px',
                            borderRadius: 3,
                          }}
                        >
                          {relationship}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
                        {item.source_url ? (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            {item.title} &rarr;
                          </a>
                        ) : (
                          item.title
                        )}
                      </div>
                      {item.summary && (
                        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                          {item.summary}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status + meta */}
          <div className="portal-card">
            <div className="portal-card-header">
              <span className="portal-card-title">Details</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Status */}
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Status
                </div>
                <span className={`status-badge status-${tracked.status}`}>
                  {tracked.status}
                </span>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Categories
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {categories.map((c) => (
                      <span key={c} className="badge badge-category">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Geography */}
              {tracked.geography?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Geography
                  </div>
                  <div style={{ fontSize: 13, color: '#374151' }}>
                    {tracked.geography.join(', ')}
                  </div>
                </div>
              )}

              {/* Deal size */}
              {dealSize && (
                <div>
                  <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Deal Size Range
                  </div>
                  <div style={{ fontSize: 13, color: '#374151' }}>
                    {dealSize}
                  </div>
                </div>
              )}

              {/* Activity stats */}
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Activity
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>
                  {tracked.activity_count} intel {tracked.activity_count === 1 ? 'item' : 'items'}
                  {tracked.last_activity_at && (
                    <span style={{ color: '#9ca3af' }}>
                      {' '}&middot; last {timeAgo(tracked.last_activity_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          {(tracked.linkedin_url || tracked.website) && (
            <div className="portal-card">
              <div className="portal-card-header">
                <span className="portal-card-title">Links</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tracked.linkedin_url && (
                  <a
                    href={tracked.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, color: '#1a3a2a', textDecoration: 'none' }}
                  >
                    LinkedIn &rarr;
                  </a>
                )}
                {tracked.website && (
                  <a
                    href={tracked.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, color: '#1a3a2a', textDecoration: 'none' }}
                  >
                    Website &rarr;
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Hunter's Notes */}
          {tracked.notes && (
            <div className="portal-card">
              <div className="portal-card-header">
                <span className="portal-card-title">Hunter&apos;s Notes</span>
              </div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                {tracked.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div style={{ fontSize: 11, color: '#9ca3af', padding: '0 0.25rem' }}>
            <div>
              Created {new Date(tracked.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div>
              Updated {new Date(tracked.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function formatDealSize(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;

  const fmt = (n: number) => {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  };

  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
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
