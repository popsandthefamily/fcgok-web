import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { RaisePipelineRow } from '@/lib/types/pipeline';
import type { Raise } from '@/lib/types/raises';
import type { TrackedEntity } from '@/lib/types';
import type { EngagementRollup } from '@/lib/types/engagement';
import PipelineKanban from './PipelineKanban';

export const dynamic = 'force-dynamic';

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

  // Per-pipeline engagement counters maintained by the engagement_after_insert
  // trigger. Used for Kanban dots so we don't aggregate per render.
  const pipelineIds = rows.map((r) => r.id);
  const rollupByPipeline = new Map<string, EngagementRollup>();
  if (pipelineIds.length > 0) {
    const { data: rollups } = await supabase
      .from('engagement_rollups')
      .select('*')
      .in('pipeline_id', pipelineIds);
    for (const r of (rollups ?? []) as EngagementRollup[]) {
      rollupByPipeline.set(r.pipeline_id, r);
    }
  }

  const initialRows = rows
    .map((pipeline) => {
      const entity = entitiesById.get(pipeline.entity_id);
      if (!entity) return null;
      return {
        pipeline,
        entity,
        rollup: rollupByPipeline.get(pipeline.id) ?? null,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

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

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1rem', lineHeight: 1.6 }}>
        {initialRows.length === 0
          ? 'No investors in pipeline yet. Use Find investors to add candidates from the matches view.'
          : `${initialRows.length} ${initialRows.length === 1 ? 'investor' : 'investors'}. Drag cards between columns to change stage; click a card to open the timeline and edit details.`}
      </p>

      {initialRows.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>
            Pipeline is empty.
          </p>
          <Link href={`/portal/raises/${id}/matches`} className="portal-btn portal-btn-primary">
            View top matches
          </Link>
        </div>
      ) : (
        <PipelineKanban raiseId={id} initialRows={initialRows} />
      )}
    </>
  );
}
