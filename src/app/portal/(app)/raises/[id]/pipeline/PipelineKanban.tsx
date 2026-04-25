'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  type PipelineStage,
  type RaisePipelineRow,
} from '@/lib/types/pipeline';
import type { TrackedEntity } from '@/lib/types';

interface RowWithEntity {
  pipeline: RaisePipelineRow;
  entity: Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>;
}

const COLUMN_WIDTH = 220;

export default function PipelineKanban({
  raiseId,
  initialRows,
}: {
  raiseId: string;
  initialRows: RowWithEntity[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<RowWithEntity[]>(initialRows);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = new Map<PipelineStage, RowWithEntity[]>();
  for (const stage of PIPELINE_STAGES) grouped.set(stage, []);
  for (const r of rows) grouped.get(r.pipeline.stage)?.push(r);

  async function moveTo(pipelineId: string, nextStage: PipelineStage) {
    const idx = rows.findIndex((r) => r.pipeline.id === pipelineId);
    if (idx === -1) return;
    const prevStage = rows[idx].pipeline.stage;
    if (prevStage === nextStage) return;

    // Optimistic update
    setRows((prev) =>
      prev.map((r) =>
        r.pipeline.id === pipelineId
          ? {
              ...r,
              pipeline: {
                ...r.pipeline,
                stage: nextStage,
                last_stage_change_at: new Date().toISOString(),
              },
            }
          : r,
      ),
    );

    try {
      const res = await fetch(`/api/raises/${raiseId}/pipeline/${pipelineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      // Roll back
      setRows((prev) =>
        prev.map((r) =>
          r.pipeline.id === pipelineId
            ? { ...r, pipeline: { ...r.pipeline, stage: prevStage } }
            : r,
        ),
      );
    }
  }

  return (
    <>
      {error && (
        <div className="portal-card" style={{ borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '1rem' }}>
          <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {PIPELINE_STAGES.map((stage) => {
          const items = grouped.get(stage) ?? [];
          const isOver = dragOverStage === stage;
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => {
                setDragOverStage((s) => (s === stage ? null : s));
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStage(null);
                const id = e.dataTransfer.getData('text/pipeline-id');
                if (id) moveTo(id, stage);
              }}
              style={{
                flex: `0 0 ${COLUMN_WIDTH}px`,
                width: COLUMN_WIDTH,
                background: isOver ? '#ecfdf5' : '#fafafa',
                border: isOver ? '1px dashed #15803d' : '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                minHeight: 240,
                transition: 'background 0.1s, border-color 0.1s',
              }}
            >
              <div style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#6b7280',
                fontWeight: 500,
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 4px 6px',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <span>{PIPELINE_STAGE_LABELS[stage]}</span>
                <span style={{ color: '#9ca3af' }}>{items.length}</span>
              </div>

              {items.length === 0 ? (
                <div style={{
                  fontSize: 11,
                  color: '#d1d5db',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '1.5rem 0',
                }}>
                  drop here
                </div>
              ) : (
                items.map(({ pipeline, entity }) => (
                  <KanbanCard
                    key={pipeline.id}
                    raiseId={raiseId}
                    pipeline={pipeline}
                    entity={entity}
                    isDragging={draggingId === pipeline.id}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/pipeline-id', pipeline.id);
                      setDraggingId(pipeline.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function KanbanCard({
  raiseId,
  pipeline,
  entity,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  raiseId: string;
  pipeline: RaisePipelineRow;
  entity: Pick<TrackedEntity, 'id' | 'name' | 'entity_type'>;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const dueText = pipeline.next_action_due_at ? formatDue(pipeline.next_action_due_at) : null;
  const isOverdue = pipeline.next_action_due_at
    ? new Date(pipeline.next_action_due_at).getTime() < Date.now()
    : false;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 5,
        padding: '0.6rem 0.7rem',
        cursor: 'grab',
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isDragging ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
        <Link
          href={`/portal/raises/${raiseId}/pipeline/${pipeline.id}`}
          style={{ fontSize: 13, fontWeight: 500, color: '#111827', textDecoration: 'none', lineHeight: 1.3 }}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        >
          {entity.name}
        </Link>
        {pipeline.priority === 'high' && (
          <span title="High priority" style={{ fontSize: 10, color: '#991b1b' }}>●</span>
        )}
      </div>
      <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize', marginBottom: 6 }}>
        {entity.entity_type}
      </div>
      {pipeline.next_action && (
        <div style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.4 }}>
          {pipeline.next_action.length > 60
            ? pipeline.next_action.slice(0, 60) + '…'
            : pipeline.next_action}
          {dueText && (
            <span style={{ display: 'block', color: isOverdue ? '#dc2626' : '#9ca3af', marginTop: 2 }}>
              {dueText}
            </span>
          )}
        </div>
      )}
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
