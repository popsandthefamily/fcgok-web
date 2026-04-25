'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  source: string;
  iconOnly?: boolean;
}

export default function RefreshButton({ source, iconOnly = false }: Props) {
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
      {result && !iconOnly && (
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
        aria-label={`Refresh ${source}`}
        title={result ?? `Refresh ${source}`}
        style={{
          fontSize: 11,
          fontWeight: 500,
          width: iconOnly ? 28 : undefined,
          height: iconOnly ? 28 : undefined,
          padding: iconOnly ? 0 : '4px 10px',
          borderRadius: 4,
          border: '1px solid #d1d5db',
          background: disabled ? '#f3f4f6' : 'white',
          color: disabled ? '#9ca3af' : '#111827',
          cursor: disabled ? 'default' : 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {iconOnly ? (
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: disabled ? 'rotate(45deg)' : undefined, transition: 'transform 0.15s' }}
          >
            <path d="M21 12a9 9 0 0 1-15.5 6.2" />
            <path d="M3 12A9 9 0 0 1 18.5 5.8" />
            <path d="M18 2v4h4" />
            <path d="M6 22v-4H2" />
          </svg>
        ) : disabled ? (
          'Running...'
        ) : (
          'Refresh'
        )}
      </button>
    </div>
  );
}
