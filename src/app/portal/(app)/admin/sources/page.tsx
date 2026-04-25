import { createServiceClient } from '@/lib/supabase/server';
import RefreshButton from './RefreshButton';
import { formatSourceTime, getSourceHealth, statusLabel } from '../source-health';

export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
  const supabase = await createServiceClient();
  const now = new Date();
  const sourceHealth = await getSourceHealth(supabase);

  return (
    <>
      <div className="portal-header">
        <h1>Source Health</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {now.toLocaleString('en-US', {
            timeZone: 'America/Chicago',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          })}
        </span>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>
        Status reflects the last time each ingest cron actually fired
        (success OR dedup-only). Items ingested today is a separate signal &mdash;
        a healthy source can have 0 new items if nothing new was published.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sourceHealth.map((sh) => {
          const status = statusLabel(sh.source, sh.lastRunHoursAgo, sh.recentErrors);
          const cronUrl = `/api/cron/ingest-${sh.source}`;

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>
                    {cronUrl}
                  </span>
                  <RefreshButton source={sh.source} />
                </div>
              </div>

              <div className="stat-grid" style={{ marginBottom: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Last Run</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {formatSourceTime(sh.lastRun)}
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
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Errors (7d)</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: sh.recentErrors > 0 ? '#dc2626' : '#111827' }}>
                    {sh.recentErrors}
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
