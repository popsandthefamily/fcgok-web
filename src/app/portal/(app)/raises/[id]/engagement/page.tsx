import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import {
  PIPELINE_STAGE_LABELS,
  type RaisePipelineRow,
} from '@/lib/types/pipeline';
import type { Raise } from '@/lib/types/raises';
import type { EngagementRollup, EngagementEvent } from '@/lib/types/engagement';
import type { TrackedEntity } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface LeaderboardRow {
  pipeline: RaisePipelineRow;
  entity: Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>;
  rollup: EngagementRollup;
  total: number;
}

export default async function EngagementPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser();
  if (!auth) redirect('/portal/login');
  if (!auth.orgId) redirect('/portal');

  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: raise } = await supabase
    .from('raises')
    .select('*')
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!raise) notFound();

  const { data: pipelineRows } = await supabase
    .from('raise_pipeline')
    .select('*')
    .eq('raise_id', id);
  const rows = (pipelineRows ?? []) as RaisePipelineRow[];
  const pipelineIds = rows.map((r) => r.id);

  if (pipelineIds.length === 0) {
    return <EmptyState raise={raise as Raise} raiseId={id} />;
  }

  const [rollupsRes, entitiesRes, recentEventsRes] = await Promise.all([
    supabase.from('engagement_rollups').select('*').in('pipeline_id', pipelineIds),
    supabase
      .from('tracked_entities')
      .select('id, name, entity_type')
      .in('id', rows.map((r) => r.entity_id)),
    supabase
      .from('engagement_events')
      .select('*')
      .in('pipeline_id', pipelineIds)
      .order('occurred_at', { ascending: false })
      .limit(15),
  ]);

  const rollupByPipeline = new Map<string, EngagementRollup>();
  for (const r of (rollupsRes.data ?? []) as EngagementRollup[]) {
    rollupByPipeline.set(r.pipeline_id, r);
  }
  const entityById = new Map<string, Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>>();
  for (const e of (entitiesRes.data ?? []) as Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>[]) {
    entityById.set(e.id, e);
  }

  const leaderboard: LeaderboardRow[] = [];
  const noEngagement: { pipeline: RaisePipelineRow; entity: Pick<TrackedEntity, 'id' | 'name' | 'entity_type'> }[] = [];

  for (const p of rows) {
    const entity = entityById.get(p.entity_id);
    if (!entity) continue;
    const rollup = rollupByPipeline.get(p.id);
    if (!rollup) {
      noEngagement.push({ pipeline: p, entity });
      continue;
    }
    const total =
      rollup.deck_views +
      rollup.om_views +
      rollup.data_room_visits +
      rollup.email_opens +
      rollup.link_clicks;
    if (total === 0) {
      noEngagement.push({ pipeline: p, entity });
      continue;
    }
    leaderboard.push({ pipeline: p, entity, rollup, total });
  }

  leaderboard.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    const ta = a.rollup.last_engagement_at ? new Date(a.rollup.last_engagement_at).getTime() : 0;
    const tb = b.rollup.last_engagement_at ? new Date(b.rollup.last_engagement_at).getTime() : 0;
    return tb - ta;
  });

  // Aggregate totals across all rows for the header summary card.
  const summary = {
    investors_engaged: leaderboard.length,
    total_signals: leaderboard.reduce((s, r) => s + r.total, 0),
    deck_views: leaderboard.reduce((s, r) => s + r.rollup.deck_views, 0),
    om_views: leaderboard.reduce((s, r) => s + r.rollup.om_views, 0),
    data_room_visits: leaderboard.reduce((s, r) => s + r.rollup.data_room_visits, 0),
    email_opens: leaderboard.reduce((s, r) => s + r.rollup.email_opens, 0),
    link_clicks: leaderboard.reduce((s, r) => s + r.rollup.link_clicks, 0),
  };

  const recentEvents = (recentEventsRes.data ?? []) as EngagementEvent[];
  const entityByPipelineId = new Map<string, Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>>();
  for (const p of rows) {
    const entity = entityById.get(p.entity_id);
    if (entity) entityByPipelineId.set(p.id, entity);
  }

  return (
    <>
      <div className="portal-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>Engagement</h1>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{(raise as Raise).name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/portal/raises/${id}`} className="portal-btn portal-btn-ghost">&larr; Raise</Link>
          <Link href={`/portal/raises/${id}/pipeline`} className="portal-btn portal-btn-ghost">Pipeline</Link>
        </div>
      </div>

      {/* Summary strip */}
      <div className="portal-card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
          <Stat label="Engaged" value={summary.investors_engaged} sub={`of ${rows.length}`} />
          <Stat label="Signals" value={summary.total_signals} />
          <Stat label="Deck views" value={summary.deck_views} />
          <Stat label="OM views" value={summary.om_views} />
          <Stat label="Data room" value={summary.data_room_visits} />
          <Stat label="Opens" value={summary.email_opens} />
          <Stat label="Clicks" value={summary.link_clicks} />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="portal-card" style={{ marginBottom: '1rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Top engaged investors</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{leaderboard.length}</span>
        </div>
        {leaderboard.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            No engagement signals yet. Add tokenized share links and tracked outreach
            to start collecting signals.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {leaderboard.map((row, i) => (
              <LeaderboardItem key={row.pipeline.id} rank={i + 1} row={row} raiseId={id} />
            ))}
          </div>
        )}
      </div>

      {/* Recent activity feed (cross-investor) */}
      {recentEvents.length > 0 && (
        <div className="portal-card" style={{ marginBottom: '1rem' }}>
          <div className="portal-card-header">
            <span className="portal-card-title">Recent activity</span>
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentEvents.map((ev) => (
              <RecentEventRow
                key={ev.id}
                event={ev}
                entity={entityByPipelineId.get(ev.pipeline_id) ?? null}
                raiseId={id}
              />
            ))}
          </ol>
        </div>
      )}

      {/* No-engagement section */}
      {noEngagement.length > 0 && (
        <div className="portal-card">
          <div className="portal-card-header">
            <span className="portal-card-title">No engagement yet</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{noEngagement.length}</span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 0, marginBottom: '0.75rem', lineHeight: 1.5 }}>
            In the pipeline but no opens, clicks, or views logged. May be stalled — or
            you haven't sent tracked outreach to them yet.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {noEngagement.map(({ pipeline, entity }) => (
              <div
                key={pipeline.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 180px',
                  gap: '0.5rem',
                  padding: '0.5rem 0',
                  borderTop: '1px solid #f3f4f6',
                  fontSize: 13,
                  alignItems: 'center',
                }}
              >
                <Link
                  href={`/portal/raises/${id}/pipeline/${pipeline.id}`}
                  style={{ color: '#111827', textDecoration: 'none' }}
                >
                  {entity.name}{' '}
                  <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>
                    · {entity.entity_type}
                  </span>
                </Link>
                <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'right' }}>
                  {PIPELINE_STAGE_LABELS[pipeline.stage]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#111827', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function LeaderboardItem({ rank, row, raiseId }: { rank: number; row: LeaderboardRow; raiseId: string }) {
  const { pipeline, entity, rollup, total } = row;
  const days = rollup.last_engagement_at
    ? (Date.now() - new Date(rollup.last_engagement_at).getTime()) / 86_400_000
    : null;

  const breakdown: { label: string; n: number }[] = [];
  if (rollup.deck_views) breakdown.push({ label: 'deck', n: rollup.deck_views });
  if (rollup.om_views) breakdown.push({ label: 'OM', n: rollup.om_views });
  if (rollup.data_room_visits) breakdown.push({ label: 'data room', n: rollup.data_room_visits });
  if (rollup.email_opens) breakdown.push({ label: 'open', n: rollup.email_opens });
  if (rollup.link_clicks) breakdown.push({ label: 'click', n: rollup.link_clicks });

  const lastLabel = days == null ? 'never' :
    days < 1 ? 'today' :
    days < 2 ? 'yesterday' :
    days < 30 ? `${Math.floor(days)}d ago` :
    `${Math.floor(days / 30)}mo ago`;

  const lastColor = days == null ? '#9ca3af' :
    days <= 7 ? '#15803d' :
    days <= 30 ? '#92400e' :
    '#6b7280';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr 1.6fr 100px 100px',
      gap: '1rem',
      padding: '0.75rem 0',
      borderTop: '1px solid #f3f4f6',
      alignItems: 'center',
    }}>
      <div style={{ fontSize: 12, color: '#9ca3af', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
        #{rank}
      </div>
      <div>
        <Link
          href={`/portal/raises/${raiseId}/pipeline/${pipeline.id}`}
          style={{ fontSize: 14, fontWeight: 500, color: '#111827', textDecoration: 'none' }}
        >
          {entity.name}
        </Link>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
          {PIPELINE_STAGE_LABELS[pipeline.stage]}
          <span style={{ textTransform: 'capitalize', marginLeft: 8 }}>{entity.entity_type}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#4b5563' }}>
        {breakdown.map((b) => (
          <span key={b.label} style={{ marginRight: 12 }}>
            <strong style={{ color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{b.n}</strong>{' '}
            <span style={{ color: '#6b7280' }}>{b.label}</span>
          </span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: lastColor, textAlign: 'right' }}>{lastLabel}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#111827', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {total}
      </div>
    </div>
  );
}

function RecentEventRow({
  event,
  entity,
  raiseId,
}: {
  event: EngagementEvent;
  entity: Pick<TrackedEntity, 'id' | 'name' | 'entity_type'> | null;
  raiseId: string;
}) {
  const labels: Record<string, string> = {
    email_open: 'opened email',
    link_click: 'clicked link',
    document_view: 'viewed document',
    document_download: 'downloaded document',
    page_view: 'viewed page',
    section_view: 'viewed section',
    data_room_login: 'opened data room',
    data_room_file_view: 'viewed data room file',
  };
  const verb = labels[event.event_type] ?? event.event_type;
  const when = new Date(event.occurred_at);
  const date = when.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <li style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', padding: '0.4rem 0', borderTop: '1px solid #f3f4f6', fontSize: 13 }}>
      <span style={{ fontSize: 11, color: '#9ca3af' }}>{date}</span>
      <span style={{ color: '#111827' }}>
        {entity ? (
          <Link
            href={`/portal/raises/${raiseId}/pipeline/${event.pipeline_id}`}
            style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}
          >
            {entity.name}
          </Link>
        ) : (
          <span style={{ color: '#9ca3af' }}>(removed)</span>
        )}
        <span style={{ color: '#6b7280' }}> {verb}</span>
      </span>
    </li>
  );
}

function EmptyState({ raise, raiseId }: { raise: Raise; raiseId: string }) {
  return (
    <>
      <div className="portal-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>Engagement</h1>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{raise.name}</span>
        </div>
        <Link href={`/portal/raises/${raiseId}`} className="portal-btn portal-btn-ghost">&larr; Raise</Link>
      </div>
      <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>
          Pipeline is empty — no investors to track engagement for yet.
        </p>
        <Link href={`/portal/raises/${raiseId}/matches`} className="portal-btn portal-btn-primary">
          View top matches
        </Link>
      </div>
    </>
  );
}
