'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RemoveFromPipelineButton({
  raiseId,
  pipelineId,
  entityName,
}: {
  raiseId: string;
  pipelineId: string;
  entityName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`Remove ${entityName} from pipeline? Activity history is also deleted.`)) return;
    setBusy(true);
    const res = await fetch(`/api/raises/${raiseId}/pipeline/${pipelineId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      setBusy(false);
      alert('Failed to remove');
    }
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      title="Remove from pipeline"
      style={{
        background: 'none',
        border: 'none',
        cursor: busy ? 'wait' : 'pointer',
        padding: 6,
        color: '#9ca3af',
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 3,
        justifySelf: 'end',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#dc2626';
        e.currentTarget.style.background = '#fef2f2';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#9ca3af';
        e.currentTarget.style.background = 'none';
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      </svg>
    </button>
  );
}
