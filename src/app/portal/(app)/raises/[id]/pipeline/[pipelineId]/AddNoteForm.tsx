'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddNoteForm({
  raiseId,
  pipelineId,
}: {
  raiseId: string;
  pipelineId: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/raises/${raiseId}/pipeline/${pipelineId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setNote('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {error && (
        <div style={{ fontSize: 12, color: '#991b1b', marginBottom: 6 }}>{error}</div>
      )}
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Quick note — what just happened, what's next…"
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: 4,
          fontFamily: 'inherit',
          fontSize: 13,
          resize: 'vertical',
          marginBottom: 8,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          className="portal-btn portal-btn-primary"
          disabled={saving || !note.trim()}
          style={{ fontSize: 12, padding: '4px 12px' }}
        >
          {saving ? 'Saving…' : 'Add note'}
        </button>
      </div>
    </form>
  );
}
