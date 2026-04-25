'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RefreshButton({
  raiseId,
  limit,
  pendingCount,
  totalCount,
}: {
  raiseId: string;
  limit: number;
  pendingCount: number;
  totalCount: number;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allCurrent = pendingCount === 0;
  const label = running
    ? `Generating… (~${Math.ceil(pendingCount / 5) * 6}s)`
    : allCurrent
      ? 'Regenerate AI rationales'
      : `Generate AI rationales (${pendingCount})`;

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/raises/${raiseId}/matches/refresh?limit=${limit}`, {
        method: 'POST',
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <button
        onClick={run}
        disabled={running}
        className={`portal-btn ${allCurrent ? 'portal-btn-ghost' : 'portal-btn-primary'}`}
        style={{ cursor: running ? 'wait' : 'pointer' }}
      >
        {label}
      </button>
      {error && (
        <div style={{ fontSize: 11, color: '#991b1b' }}>{error}</div>
      )}
      {!error && totalCount > 0 && (
        <div style={{ fontSize: 11, color: '#9ca3af' }}>
          {totalCount - pendingCount}/{totalCount} cached
        </div>
      )}
    </div>
  );
}
