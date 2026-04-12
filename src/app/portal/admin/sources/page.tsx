import { createClient } from '@/lib/supabase/server';
import type { IntelSource } from '@/lib/types';

const SOURCES: IntelSource[] = ['iss', 'news', 'reddit', 'sec', 'linkedin', 'biggerpockets', 'podcast'];

interface SourceHealth {
  source: IntelSource;
  lastSuccessful: string | null;
  itemsToday: number;
  itemsThisWeek: number;
  errorCount: number;
  hoursAgo: number;
}

export default async function SourcesPage() {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const sourceHealth: SourceHealth[] = [];

  for (const source of SOURCES) {
    // Last successful ingestion
    const { data: latest } = await supabase
      .from('intel_items')
      .select('ingested_at')
      .eq('source', source)
      .order('ingested_at', { ascending: false })
      .limit(1);

    const lastSuccessful = latest?.[0]?.ingested_at ?? null;
    const hoursAgo = lastSuccessful
      ? (now.getTime() - new Date(lastSuccessful).getTime()) / 3600000
      : Infinity;

    // Items ingested today
    const { count: itemsToday } = await supabase
      .from('intel_items')
      .select('*', { count: 'exact', head: true })
      .eq('source', source)
      .gte('ingested_at', todayStart);

    // Items this week
    const { count: itemsThisWeek } = await supabase
      .from('intel_items')
      .select('*', { count: 'exact', head: true })
      .eq('source', source)
      .gte('ingested_at', weekAgo);

    // Error count from metadata (items where metadata contains error info)
    const { count: errorCount } = await supabase
      .from('intel_items')
      .select('*', { count: 'exact', head: true })
      .eq('source', source)
      .not('metadata->error', 'is', null);

    sourceHealth.push({
      source,
      lastSuccessful,
      itemsToday: itemsToday ?? 0,
      itemsThisWeek: itemsThisWeek ?? 0,
      errorCount: errorCount ?? 0,
      hoursAgo,
    });
  }

  function statusLabel(hours: number): { text: string; color: string; bg: string } {
    if (hours < 12) return { text: 'Healthy', color: '#166534', bg: '#dcfce7' };
    if (hours < 24) return { text: 'Stale', color: '#92400e', bg: '#fef3c7' };
    return { text: 'Down', color: '#991b1b', bg: '#fee2e2' };
  }

  return (
    <>
      <div className="portal-header">
        <h1>Source Health</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>
        Monitoring ingestion pipelines. Green = last ingest &lt; 12h ago. Yellow = 12&ndash;24h. Red = &gt; 24h or never.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sourceHealth.map((sh) => {
          const status = statusLabel(sh.hoursAgo);
          const cronSlug = sh.source === 'biggerpockets' ? 'biggerpockets' : sh.source;
          const cronUrl = `/api/cron/ingest-${cronSlug}?secret=CRON_SECRET`;

          return (
            <div key={sh.source} className="portal-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge badge-source" data-source={sh.source} style={{ fontSize: 12 }}>
                    {sh.source.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 500, padding: '3px 10px',
                      borderRadius: 10, background: status.bg, color: status.color,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}
                  >
                    {status.text}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>
                  {cronUrl}
                </span>
              </div>

              <div className="stat-grid" style={{ marginBottom: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Last Successful</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {sh.lastSuccessful
                      ? new Date(sh.lastSuccessful).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })
                      : 'Never'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Items Today</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{sh.itemsToday}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Items This Week</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{sh.itemsThisWeek}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Errors</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: sh.errorCount > 0 ? '#dc2626' : '#111827' }}>
                    {sh.errorCount}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
