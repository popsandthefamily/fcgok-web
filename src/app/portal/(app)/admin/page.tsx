import { createServiceClient } from '@/lib/supabase/server';
import type { IntelSource } from '@/lib/types';

const SOURCES: IntelSource[] = ['iss', 'news', 'sec', 'biggerpockets', 'podcast'];

export default async function AdminOverview() {
  const supabase = await createServiceClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Total intel items
  const { count: totalItems } = await supabase
    .from('intel_items')
    .select('*', { count: 'exact', head: true });

  // Items this week
  const { count: weekItems } = await supabase
    .from('intel_items')
    .select('*', { count: 'exact', head: true })
    .gte('ingested_at', weekAgo);

  // Entities tracked
  const { count: entityCount } = await supabase
    .from('tracked_entities')
    .select('*', { count: 'exact', head: true });

  // Active sources (sources with at least one item in the last 7 days)
  const { data: recentSourceData } = await supabase
    .from('intel_items')
    .select('source')
    .gte('ingested_at', weekAgo);

  const activeSources = new Set(recentSourceData?.map((r) => r.source)).size;

  // Source health: last ingested timestamp and count per source
  const sourceHealthMap: Record<string, { lastIngested: string | null; count: number }> = {};
  for (const source of SOURCES) {
    const { data: latest } = await supabase
      .from('intel_items')
      .select('ingested_at')
      .eq('source', source)
      .order('ingested_at', { ascending: false })
      .limit(1);

    const { count } = await supabase
      .from('intel_items')
      .select('*', { count: 'exact', head: true })
      .eq('source', source);

    sourceHealthMap[source] = {
      lastIngested: latest?.[0]?.ingested_at ?? null,
      count: count ?? 0,
    };
  }

  // Recent activity: last 10 items ingested
  const { data: recentItems } = await supabase
    .from('intel_items')
    .select('id, source, title, ingested_at')
    .order('ingested_at', { ascending: false })
    .limit(10);

  return (
    <>
      <div className="portal-header">
        <h1>Admin Overview</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{totalItems ?? 0}</div>
          <div className="stat-label">Total Intel Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weekItems ?? 0}</div>
          <div className="stat-label">Items This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{entityCount ?? 0}</div>
          <div className="stat-label">Entities Tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeSources}</div>
          <div className="stat-label">Active Sources (7d)</div>
        </div>
      </div>

      {/* Source health table */}
      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Source Health</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Source</th>
              <th style={{ padding: '8px 12px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Ingested</th>
              <th style={{ padding: '8px 12px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Total Items</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((source) => {
              const health = sourceHealthMap[source];
              const lastTime = health.lastIngested
                ? new Date(health.lastIngested).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })
                : 'Never';

              const hoursAgo = health.lastIngested
                ? (now.getTime() - new Date(health.lastIngested).getTime()) / 3600000
                : Infinity;

              const statusColor =
                hoursAgo < 12 ? '#22c55e' :
                hoursAgo < 24 ? '#f59e0b' :
                '#ef4444';

              return (
                <tr key={source} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge badge-source" data-source={source}>
                      {source.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: statusColor, display: 'inline-block',
                      }}
                    />
                    {lastTime}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {health.count.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent activity log */}
      <div className="portal-card">
        <div className="portal-card-header">
          <span className="portal-card-title">Recent Activity</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Last 10 ingested items</span>
        </div>
        {recentItems && recentItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
            {recentItems.map((item) => (
              <div key={item.id} style={{ background: 'white', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge badge-source" data-source={item.source}>
                  {item.source.toUpperCase()}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </span>
                <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                  {timeAgo(item.ingested_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#9ca3af' }}>No items ingested yet.</p>
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
