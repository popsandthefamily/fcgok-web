import { createServiceClient } from '@/lib/supabase/server';
import RefreshButton from './sources/RefreshButton';
import { formatSourceTime, getSourceHealth, statusLabel } from './source-health';

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

  const sourceHealth = await getSourceHealth(supabase);
  const activeSources = sourceHealth.filter((source) => {
    const status = statusLabel(source.source, source.lastRunHoursAgo, source.recentErrors);
    return status.text === 'Healthy';
  }).length;

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
          <div className="stat-label">Healthy Sources</div>
        </div>
      </div>

      {/* Source health table */}
      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Sources</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Status, last run, and manual refresh</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Source</th>
              <th style={{ padding: '8px 12px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Run</th>
              <th style={{ padding: '8px 12px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Week</th>
              <th aria-label="Refresh source" style={{ padding: '8px 12px', width: 44 }} />
            </tr>
          </thead>
          <tbody>
            {sourceHealth.map((health) => {
              const status = statusLabel(health.source, health.lastRunHoursAgo, health.recentErrors);

              return (
                <tr key={health.source} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge badge-source" data-source={health.source}>
                      {health.source.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '3px 10px',
                        borderRadius: 10,
                        background: status.bg,
                        color: status.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {status.text}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>
                    {formatSourceTime(health.lastRun)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {health.itemsThisWeek.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <RefreshButton source={health.source} iconOnly />
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
