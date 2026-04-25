import type { SupabaseClient } from '@supabase/supabase-js';

export const CT_TIME_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: 'America/Chicago',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
};

// Scrape keys we actively schedule in vercel.json. biggerpockets / podcast
// routes exist but their crons were reverted in bd80888 (plan cron limit).
// Reddit and LinkedIn were removed entirely due to ToS / commercial-resale risk.
// Note: "edgar-distress" writes intel_items with source='sec' (it is SEC
// data) but tracks its own scrape_runs.source so cadence is independent.
export type SourceKey = 'iss' | 'news' | 'sec' | 'edgar-distress' | 'cmbs-abs-ee';

export const SOURCES: SourceKey[] = ['iss', 'news', 'sec', 'edgar-distress', 'cmbs-abs-ee'];

// Some scrape keys don't correspond 1:1 to intel_items.source. edgar-distress
// items land in source='sec' with category='distress'. For per-source item
// counts we fall back to a different filter in that case.
const ITEM_FILTER: Partial<Record<SourceKey, { source: string; category?: string; subtype?: string }>> = {
  iss: { source: 'iss' },
  news: { source: 'news' },
  sec: { source: 'sec' },
  'edgar-distress': { source: 'sec', category: 'distress', subtype: 'distress_8k' },
  'cmbs-abs-ee': { source: 'sec', category: 'distress', subtype: 'cmbs_abs_ee' },
};

// Expected cron cadence per source (hours between runs). Kept in sync with
// vercel.json. Used to scale health thresholds so a daily source doesn't
// appear stale for 23 hours after a successful run.
const EXPECTED_INTERVAL_HOURS: Record<SourceKey, number> = {
  iss: 2,
  news: 2,
  sec: 24,
  'edgar-distress': 2,
  'cmbs-abs-ee': 24 * 7,
};

export interface SourceHealth {
  source: SourceKey;
  lastRun: string | null;
  lastRunHoursAgo: number;
  lastItemIngested: string | null;
  itemsToday: number;
  itemsThisWeek: number;
  recentErrors: number;
}

export function statusLabel(
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

export function formatSourceTime(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-US', CT_TIME_OPTS);
}

export async function getSourceHealth(supabase: SupabaseClient): Promise<SourceHealth[]> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  return Promise.all(
    SOURCES.map(async (source) => {
      const filter = ITEM_FILTER[source] ?? { source };
      // Narrow generic inference on the query builder is hostile; `any` is
      // fine here since we only add .eq() chains and return.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const applyItemFilter = (q: any) => {
        let qq = q.eq('source', filter.source);
        if (filter.category) qq = qq.eq('category', filter.category);
        if (filter.subtype) qq = qq.eq('metadata->>subtype', filter.subtype);
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

      // Prefer scrape_runs.ran_at for "last run" and fall back to the newest
      // intel_items row for sources that predate the scrape_runs table.
      const lastRun = runRes.data?.[0]?.ran_at ?? itemRes.data?.[0]?.ingested_at ?? null;
      const lastRunHoursAgo = lastRun
        ? (now.getTime() - new Date(lastRun).getTime()) / 3600000
        : Infinity;

      return {
        source,
        lastRun,
        lastRunHoursAgo,
        lastItemIngested: itemRes.data?.[0]?.ingested_at ?? null,
        itemsToday: todayRes.count ?? 0,
        itemsThisWeek: weekRes.count ?? 0,
        recentErrors: errorRes.count ?? 0,
      };
    }),
  );
}
