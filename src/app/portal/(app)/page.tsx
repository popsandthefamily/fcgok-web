import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function PortalDashboard() {
  const supabase = await createClient();

  // Fetch high-priority items (relevance > 0.8, last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: highPriority } = await supabase
    .from('intel_items')
    .select('*')
    .gte('relevance_score', 0.8)
    .gte('ingested_at', weekAgo)
    .order('relevance_score', { ascending: false })
    .limit(5);

  // Fetch weekly stats
  const { count: weekTotal } = await supabase
    .from('intel_items')
    .select('*', { count: 'exact', head: true })
    .gte('ingested_at', weekAgo);

  const { count: highRelevanceCount } = await supabase
    .from('intel_items')
    .select('*', { count: 'exact', head: true })
    .gte('relevance_score', 0.7)
    .gte('ingested_at', weekAgo);

  const { count: curatedCount } = await supabase
    .from('intel_items')
    .select('*', { count: 'exact', head: true })
    .eq('is_curated', true)
    .gte('ingested_at', weekAgo);

  // Aggregate sentiment
  const { data: sentimentData } = await supabase
    .from('intel_items')
    .select('ai_analysis')
    .gte('ingested_at', weekAgo)
    .not('ai_analysis', 'is', null);

  const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0, mixed: 0 };
  sentimentData?.forEach((item) => {
    const s = (item.ai_analysis as { sentiment?: string })?.sentiment;
    if (s && s in sentimentCounts) sentimentCounts[s as keyof typeof sentimentCounts]++;
  });
  const totalSentiment = Object.values(sentimentCounts).reduce((a, b) => a + b, 0);
  const bullishPct = totalSentiment > 0 ? Math.round((sentimentCounts.bullish / totalSentiment) * 100) : 0;

  // Recent investor activity
  const { data: activeEntities } = await supabase
    .from('tracked_entities')
    .select('*')
    .eq('status', 'active')
    .order('last_activity_at', { ascending: false })
    .limit(6);

  return (
    <>
      <div className="portal-header">
        <h1>Dashboard</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{weekTotal ?? 0}</div>
          <div className="stat-label">Items ingested this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{highRelevanceCount ?? 0}</div>
          <div className="stat-label">High relevance (0.7+)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{curatedCount ?? 0}</div>
          <div className="stat-label">Curated by Hunter</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{bullishPct}%</div>
          <div className="stat-label">Bullish sentiment</div>
        </div>
      </div>

      {/* High priority feed */}
      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">High Priority Intel</span>
          <Link href="/portal/feed?relevance_min=0.8" style={{ fontSize: 12, color: '#1a3a2a', textDecoration: 'none' }}>
            View all &rarr;
          </Link>
        </div>
        {highPriority && highPriority.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
            {highPriority.map((item) => {
              const analysis = item.ai_analysis as { sentiment?: string } | null;
              return (
                <div key={item.id} style={{ background: 'white', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={`sentiment-dot ${analysis?.sentiment ?? 'neutral'}`} />
                    <span className="badge badge-source" data-source={item.source}>
                      {item.source.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>
                      {item.relevance_score?.toFixed(2)}
                    </span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
                      {item.published_at ? timeAgo(item.published_at) : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
                    {item.title}
                  </div>
                  {item.summary && (
                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                      {item.summary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#9ca3af' }}>No high-priority items this week. Check back soon.</p>
        )}
      </div>

      {/* Investor radar preview */}
      <div className="portal-card">
        <div className="portal-card-header">
          <span className="portal-card-title">Investor Radar</span>
          <Link href="/portal/investors" style={{ fontSize: 12, color: '#1a3a2a', textDecoration: 'none' }}>
            View all &rarr;
          </Link>
        </div>
        {activeEntities && activeEntities.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {activeEntities.map((entity) => (
              <Link
                key={entity.id}
                href={`/portal/investors/${entity.id}`}
                style={{
                  border: '1px solid #e5e7eb', borderRadius: 6, padding: '1rem',
                  textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
                  {entity.name}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                  {entity.entity_type} &middot; {(entity.categories as string[])?.join(', ')}
                </div>
                <span className={`status-badge status-${entity.status}`}>
                  {entity.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#9ca3af' }}>No tracked entities yet. Add entities in the admin panel.</p>
        )}
      </div>
    </>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
