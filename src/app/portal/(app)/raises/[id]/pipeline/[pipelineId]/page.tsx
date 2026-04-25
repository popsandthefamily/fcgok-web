import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import {
  PIPELINE_STAGE_LABELS,
  type RaisePipelineRow,
  type RaisePipelineEvent,
} from '@/lib/types/pipeline';
import type { Raise } from '@/lib/types/raises';
import type { TrackedEntity } from '@/lib/types';
import PipelineEditor from './PipelineEditor';
import AddNoteForm from './AddNoteForm';
import RemoveFromPipelineButton from '../RemoveFromPipelineButton';

export const dynamic = 'force-dynamic';

interface EventWithActor extends RaisePipelineEvent {
  actor_email: string | null;
}

export default async function PipelineDetailPage({
  params,
}: {
  params: Promise<{ id: string; pipelineId: string }>;
}) {
  const auth = await getAuthedUser();
  if (!auth) redirect('/portal/login');
  if (!auth.orgId) redirect('/portal');

  const { id, pipelineId } = await params;
  const supabase = await createServiceClient();

  const { data: raise } = await supabase
    .from('raises')
    .select('id, name, organization_id')
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!raise) notFound();

  const { data: pipeline } = await supabase
    .from('raise_pipeline')
    .select('*')
    .eq('id', pipelineId)
    .eq('raise_id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!pipeline) notFound();

  const { data: entity } = await supabase
    .from('tracked_entities')
    .select('*')
    .eq('id', (pipeline as RaisePipelineRow).entity_id)
    .single();
  if (!entity) notFound();

  // Fetch events + actors. Events have actor_id (nullable); we resolve to email.
  const { data: rawEvents } = await supabase
    .from('raise_pipeline_events')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('occurred_at', { ascending: false })
    .limit(100);

  const events = (rawEvents ?? []) as RaisePipelineEvent[];
  const actorIds = Array.from(new Set(events.map((e) => e.actor_id).filter((x): x is string => !!x)));

  const actorEmailById = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, email')
      .in('id', actorIds);
    for (const p of (profiles ?? []) as { id: string; email: string }[]) {
      actorEmailById.set(p.id, p.email);
    }
  }

  const eventsWithActor: EventWithActor[] = events.map((e) => ({
    ...e,
    actor_email: e.actor_id ? actorEmailById.get(e.actor_id) ?? null : null,
  }));

  const e = entity as TrackedEntity;
  const p = pipeline as RaisePipelineRow;

  return (
    <>
      <div className="portal-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>{e.name}</h1>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            <span style={{ textTransform: 'capitalize' }}>{e.entity_type}</span>
            {' · '}
            <Link href={`/portal/raises/${id}`} style={{ color: '#6b7280' }}>{(raise as Raise).name}</Link>
            {' · '}
            <span>{PIPELINE_STAGE_LABELS[p.stage]}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/portal/raises/${id}/pipeline`} className="portal-btn portal-btn-ghost">&larr; Pipeline</Link>
          <Link href={`/portal/investors/${e.id}`} className="portal-btn portal-btn-ghost">Investor profile →</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left column: editor + timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <PipelineEditor raiseId={id} pipeline={p} />

          <div className="portal-card">
            <div className="portal-card-header">
              <span className="portal-card-title">Add Note</span>
            </div>
            <AddNoteForm raiseId={id} pipelineId={pipelineId} />
          </div>

          <div className="portal-card">
            <div className="portal-card-header">
              <span className="portal-card-title">Activity</span>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{eventsWithActor.length}</span>
            </div>
            {eventsWithActor.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>No activity yet.</p>
            ) : (
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {eventsWithActor.map((ev) => (
                  <TimelineItem key={ev.id} event={ev} />
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Right column: investor summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="portal-card">
            <div className="portal-card-header">
              <span className="portal-card-title">Investor</span>
            </div>
            {e.description && (
              <p style={{ fontSize: 13, color: '#4b5563', marginTop: 0, lineHeight: 1.5 }}>
                {e.description}
              </p>
            )}
            <SmallRow label="Status" value={e.status} />
            {e.categories?.length > 0 && (
              <SmallRow label="Categories" value={e.categories.join(', ')} />
            )}
            {e.geography?.length > 0 && (
              <SmallRow label="Geography" value={e.geography.join(', ')} />
            )}
            {e.deal_size_min != null && (
              <SmallRow
                label="Check range"
                value={`$${e.deal_size_min.toLocaleString()} – $${(e.deal_size_max ?? 0).toLocaleString()}`}
              />
            )}
            {e.website && (
              <SmallRow label="Website" value={<a href={e.website} target="_blank" rel="noopener noreferrer">{e.website}</a>} />
            )}
            {e.last_activity_at && (
              <SmallRow
                label="Last activity"
                value={new Date(e.last_activity_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              />
            )}
          </div>

          <div className="portal-card">
            <div className="portal-card-header">
              <span className="portal-card-title">Danger zone</span>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 0, lineHeight: 1.5 }}>
              Removing from pipeline deletes this row and its activity history. The
              investor entity itself stays in the radar.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <RemoveFromPipelineButton
                raiseId={id}
                pipelineId={pipelineId}
                entityName={e.name}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SmallRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0.5rem', padding: '0.4rem 0', borderTop: '1px solid #f3f4f6', fontSize: 12 }}>
      <span style={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>{label}</span>
      <span style={{ color: '#111827' }}>{value}</span>
    </div>
  );
}

function TimelineItem({ event }: { event: EventWithActor }) {
  const when = new Date(event.occurred_at);
  const dateLabel = when.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const actor = event.actor_email ?? 'system';
  const description = describeEvent(event);
  const note = event.event_type === 'note_added' ? (event.payload as { note?: string })?.note : null;

  return (
    <li style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0.75rem', padding: '0.5rem 0', borderTop: '1px solid #f3f4f6', fontSize: 13 }}>
      <div style={{ fontSize: 11, color: '#9ca3af' }}>{dateLabel}</div>
      <div>
        <div style={{ color: '#111827' }}>
          {description}
          <span style={{ color: '#9ca3af', marginLeft: 6, fontSize: 11 }}>· {actor}</span>
        </div>
        {note && (
          <div style={{
            fontSize: 12,
            color: '#4b5563',
            background: '#fafafa',
            borderLeft: '2px solid #e5e7eb',
            padding: '6px 10px',
            marginTop: 6,
            borderRadius: 3,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}>
            {note}
          </div>
        )}
      </div>
    </li>
  );
}

function describeEvent(event: EventWithActor): string {
  switch (event.event_type) {
    case 'pipeline_added':
      return `Added to pipeline at "${PIPELINE_STAGE_LABELS[event.to_stage ?? 'identified']}"`;
    case 'stage_change':
      return `Moved ${event.from_stage ? `from "${PIPELINE_STAGE_LABELS[event.from_stage]}" ` : ''}to "${PIPELINE_STAGE_LABELS[event.to_stage ?? 'identified']}"`;
    case 'note_added':
      return 'Note added';
    case 'task_added':
      return 'Task added';
    case 'task_completed':
      return 'Task completed';
    case 'outreach_sent':
      return 'Outreach sent';
    case 'outreach_replied':
      return 'Investor replied';
    case 'document_shared':
      return 'Document shared';
    case 'engagement':
      return 'Engagement signal';
    case 'pipeline_removed':
      return 'Removed from pipeline';
  }
}
