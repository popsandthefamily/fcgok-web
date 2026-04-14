'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  source: string;
}

export default function RefreshButton({ source }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function trigger() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/ingest/${source}`, { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.ok === false) {
        setResult(`Error: ${body.error ?? res.statusText}`);
      } else {
        setResult(`+${body.ingested ?? 0} new, ${body.skipped ?? 0} dedup`);
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'network'}`);
    } finally {
      setRunning(false);
    }
  }

  const disabled = running || isPending;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {result && (
        <span
          style={{
            fontSize: 11,
            color: result.startsWith('Error') ? '#991b1b' : '#166534',
            fontFamily: 'monospace',
          }}
        >
          {result}
        </span>
      )}
      <button
        type="button"
        onClick={trigger}
        disabled={disabled}
        style={{
          fontSize: 11,
          fontWeight: 500,
          padding: '4px 10px',
          borderRadius: 4,
          border: '1px solid #d1d5db',
          background: disabled ? '#f3f4f6' : 'white',
          color: disabled ? '#9ca3af' : '#111827',
          cursor: disabled ? 'default' : 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {disabled ? 'Running…' : 'Refresh'}
      </button>
    </div>
  );
}
