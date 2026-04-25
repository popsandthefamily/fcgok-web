'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PIPELINE_STAGE_LABELS, type PipelineStage } from '@/lib/types/pipeline';

interface Props {
  raiseId: string;
  entityId: string;
  inPipelineStage: PipelineStage | null;
}

export default function AddToPipelineButton({ raiseId, entityId, inPipelineStage }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (inPipelineStage) {
    return (
      <Link
        href={`/portal/raises/${raiseId}/pipeline`}
        className="portal-btn portal-btn-ghost"
        style={{ fontSize: 11, padding: '4px 10px', whiteSpace: 'nowrap' }}
      >
        ✓ In pipeline · {PIPELINE_STAGE_LABELS[inPipelineStage]}
      </Link>
    );
  }

  async function add() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/raises/${raiseId}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: entityId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <button
        onClick={add}
        disabled={busy}
        className="portal-btn portal-btn-primary"
        style={{ fontSize: 11, padding: '4px 10px', cursor: busy ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
      >
        {busy ? 'Adding…' : '+ Add to pipeline'}
      </button>
      {error && <span style={{ fontSize: 10, color: '#991b1b' }}>{error}</span>}
    </div>
  );
}
