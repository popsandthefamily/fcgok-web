import { createServiceClient } from '@/lib/supabase/server';
import RefreshButton from './RefreshButton';

export const dynamic = 'force-dynamic';

const CT_TIME_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: 'America/Chicago',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
};

// Scrape keys we actively schedule in vercel.json. biggerpockets / podcast
// routes exist but their crons were reverted in bd80888 (plan cron limit).
// Reddit and LinkedIn were removed entirely — ToS / commercial-resale risk.
// Note: "edgar-distress" writes intel_items with source='sec' (it IS SEC
// data) but tracks its own scrape_runs.source so cadence is independent.
type SourceKey = 'iss' | 'news' | 'sec' | 'edgar-distress';

const SOURCES: SourceKey[] = ['iss', 'news', 'sec', 'edgar-distress'];

// Some scrape keys don't correspond 1:1 to intel_items.source — edgar-distress
// items land in source='sec' with category='distress'. For per-source item
// counts we fall back to a different filter in that case.
const ITEM_FILTER: Partial<Record<SourceKey, { source: string; category?: string }>> = {
  iss: { source: 'iss' },
  news: { source: 'news' },
  sec: { source: 'sec' },
  'edgar-distress': { source: 'sec', category: 'distress' },
};

// Expected cron cadence per source (hours between runs). Kept in sync with
// vercel.json. Used to scale health thresholds so a daily source doesn't
// appear "Stale" for 23 hours after a successful run.
const EXPECTED_INTERVAL_HOURS: Record<SourceKey, number> = {
  iss: 2,
  news: 2,
  sec: 24,
  'edgar-distress': 2,
};

interface SourceHealth {
  source: SourceKey;
  lastRun: string | null;
  lastRunHoursAgo: number;
  lastItemIngested: string | null;
  itemsToday: number;
  itemsThisWeek: number;
  recentErrors: number;
}

export default async function SourcesPage() {
  const supabase = await createServiceClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const sourceHealth: SourceHealth[] = [];

  for (const source of SOURCES) {
    const filter = ITEM_FILTER[source] ?? { source };
    // Narrow generic inference on the query builder is hostile; `any` is
    // fine here since we only add .eq() chains and return.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyItemFilter = (q: any) => {
      let qq = q.eq('source', filter.source);
      if (filter.category) qq = qq.eq('category', filter.category);
      return qq;
    };

    const [runRes, itemRes, todayRes, weekRes, errorRes] = await Promise.all([
      supabase
        .from('scrape_runs')
        .select('ran_at')
        .eq('source', source)
        .order('ran_at', { ascending: false })
        .limit(1),
      applyItemFilter(
        supabase
          .from('intel_items')
          .select('ingested_at')
          .order('ingested_at', { ascending: false })
          .limit(1),
      ),
      applyItemFilter(
        supabase
          .from('intel_items')
          .select('*', { count: 'exact', head: true })
          .gte('ingested_at', todayStart),
      ),
      applyItemFilter(
        supabase
          .from('intel_items')
          .select('*', { count: 'exact', head: true })
          .gte('ingested_at', weekAgo),
      ),
      supabase
        .from('scrape_runs')
        .select('*', { count: 'exact', head: true })
        .eq('source', source)
        .not('error', 'is', null)
        .gte('ran_at', weekAgo),
    ]);

    // Prefer scrape_runs.ran_at for "last run" — falls back to the newest
    // intel_items row for sources that predate the scrape_runs table or
    // before the first cron run after deploy.
    const lastRun = runRes.data?.[0]?.ran_at ?? itemRes.data?.[0]?.ingested_at ?? null;
    const lastRunHoursAgo = lastRun
      ? (now.getTime() - new Date(lastRun).getTime()) / 3600000
      : Infinity;

    sourceHealth.push({
      source,
      lastRun,
      lastRunHoursAgo,
      lastItemIngested: itemRes.data?.[0]?.ingested_at ?? null,
      itemsToday: todayRes.count ?? 0,
      itemsThisWeek: weekRes.count ?? 0,
      recentErrors: errorRes.count ?? 0,
    });
  }

  function statusLabel(
    source: SourceKey,
    hours: number,
    errors: number,
  ): { text: string; color: string; bg: string } {
    if (errors > 0) return { text: 'Errors', color: '#991b1b', bg: '#fee2e2' };
    const interval = EXPECTED_INTERVAL_HOURS[source] ?? 6;
    if (hours < interval * 1.5) return { text: 'Healthy', color: '#166534', bg: '#dcfce7' };
    if (hours < interval * 3) return { text: 'Stale', color: '#92400e', bg: '#fef3c7' };
    return { text: 'Down', color: '#991b1b', bg: '#fee2e2' };
  }

  function formatRelative(iso: string | null): string {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString('en-US', CT_TIME_OPTS);
  }

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
                    {formatRelative(sh.lastRun)}
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
