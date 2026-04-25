import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  type PipelineStage,
  type RaisePipelineRow,
} from '@/lib/types/pipeline';
import type { Raise } from '@/lib/types/raises';
import type { TrackedEntity } from '@/lib/types';
import StageSelect from './StageSelect';
import RemoveFromPipelineButton from './RemoveFromPipelineButton';

export const dynamic = 'force-dynamic';

interface RowWithEntity {
  pipeline: RaisePipelineRow;
  entity: Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>;
}

export default async function PipelinePage({ params }: { params: Promise<{ id: string }> }) {
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
    .eq('raise_id', id)
    .order('last_stage_change_at', { ascending: false });

  const rows = (pipelineRows ?? []) as RaisePipelineRow[];
  const entityIds = rows.map((r) => r.entity_id);

  const entitiesById = new Map<string, Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>>();
  if (entityIds.length > 0) {
    const { data: entities } = await supabase
      .from('tracked_entities')
      .select('id, name, entity_type')
      .in('id', entityIds);
    for (const e of (entities ?? []) as Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>[]) {
      entitiesById.set(e.id, e);
    }
  }

  const grouped = new Map<PipelineStage, RowWithEntity[]>();
  for (const stage of PIPELINE_STAGES) grouped.set(stage, []);
  for (const r of rows) {
    const entity = entitiesById.get(r.entity_id);
    if (!entity) continue;
    grouped.get(r.stage)?.push({ pipeline: r, entity });
  }

  const total = rows.length;

  return (
    <>
      <div className="portal-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>Pipeline</h1>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{(raise as Raise).name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/portal/raises/${id}`} className="portal-btn portal-btn-ghost">&larr; Raise</Link>
          <Link href={`/portal/raises/${id}/matches`} className="portal-btn portal-btn-primary">
            Find investors →
          </Link>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        {total === 0
          ? 'No investors in pipeline yet. Use Find investors to add candidates from the matches view.'
          : `${total} ${total === 1 ? 'investor' : 'investors'} across ${PIPELINE_STAGES.filter((s) => (grouped.get(s) ?? []).length > 0).length} stages. Kanban view ships next; for now it's a flat list grouped by stage.`}
      </p>

      {total === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>
            Pipeline is empty.
          </p>
          <Link href={`/portal/raises/${id}/matches`} className="portal-btn portal-btn-primary">
            View top matches
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {PIPELINE_STAGES.map((stage) => {
            const items = grouped.get(stage) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={stage} className="portal-card">
                <div className="portal-card-header">
                  <span className="portal-card-title">{PIPELINE_STAGE_LABELS[stage]}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{items.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {items.map(({ pipeline, entity }) => (
                    <PipelineRowItem
                      key={pipeline.id}
                      raiseId={id}
                      pipeline={pipeline}
                      entity={entity}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function PipelineRowItem({
  raiseId,
  pipeline,
  entity,
}: {
  raiseId: string;
  pipeline: RaisePipelineRow;
  entity: Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>;
}) {
  const dueText = pipeline.next_action_due_at
    ? formatDue(pipeline.next_action_due_at)
    : null;
  const isOverdue = pipeline.next_action_due_at
    ? new Date(pipeline.next_action_due_at).getTime() < Date.now()
    : false;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 200px 60px',
        gap: '1rem',
        padding: '0.85rem 0',
        borderBottom: '1px solid #f3f4f6',
        alignItems: 'center',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Link
            href={`/portal/investors/${entity.id}`}
            style={{ fontSize: 14, fontWeight: 500, color: '#111827', textDecoration: 'none' }}
          >
            {entity.name}
          </Link>
          <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>
            {entity.entity_type}
          </span>
          {pipeline.priority !== 'normal' && (
            <span
              style={{
                fontSize: 10,
                color: pipeline.priority === 'high' ? '#991b1b' : '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: '1px solid currentColor',
                padding: '1px 6px',
                borderRadius: 3,
              }}
            >
              {pipeline.priority}
            </span>
          )}
        </div>
        {pipeline.next_action ? (
          <div style={{ fontSize: 12, color: '#4b5563' }}>
            <span style={{ color: '#6b7280' }}>Next:</span> {pipeline.next_action}
            {dueText && (
              <span style={{ color: isOverdue ? '#dc2626' : '#6b7280', marginLeft: 8 }}>
                · {dueText}
              </span>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            Added {new Date(pipeline.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>

      <StageSelect raiseId={raiseId} pipelineId={pipeline.id} stage={pipeline.stage} />

      <RemoveFromPipelineButton
        raiseId={raiseId}
        pipelineId={pipeline.id}
        entityName={entity.name}
      />
    </div>
  );
}

function formatDue(iso: string): string {
  const due = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((due.getTime() - now.getTime()) / 86_400_000);
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'due today';
  if (diffDays === 1) return 'due tomorrow';
  if (diffDays < 7) return `due in ${diffDays}d`;
  return `due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}
