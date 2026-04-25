'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  type PipelineStage,
} from '@/lib/types/pipeline';

export default function StageSelect({
  raiseId,
  pipelineId,
  stage,
}: {
  raiseId: string;
  pipelineId: string;
  stage: PipelineStage;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<PipelineStage>(stage);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: PipelineStage) {
    if (next === current) return;
    setSaving(true);
    setError(null);
    const prev = current;
    setCurrent(next);
    try {
      const res = await fetch(`/api/raises/${raiseId}/pipeline/${pipelineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update stage');
      }
      router.refresh();
    } catch (err) {
      setCurrent(prev);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <select
        value={current}
        onChange={(e) => change(e.target.value as PipelineStage)}
        disabled={saving}
        className="filter-search"
        style={{ width: '100%', cursor: saving ? 'wait' : 'pointer' }}
      >
        {PIPELINE_STAGES.map((s) => (
          <option key={s} value={s}>{PIPELINE_STAGE_LABELS[s]}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: 11, color: '#991b1b' }}>{error}</span>}
    </div>
  );
}
