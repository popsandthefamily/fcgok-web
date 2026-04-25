'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  type PipelineStage,
  type PipelinePriority,
  type RaisePipelineRow,
} from '@/lib/types/pipeline';

const PRIORITIES: PipelinePriority[] = ['low', 'normal', 'high'];

interface FormState {
  stage: PipelineStage;
  priority: PipelinePriority;
  next_action: string;
  next_action_due_at: string;       // YYYY-MM-DD
  notes: string;
  committed_amount_usd: string;     // numeric string
  passed_reason: string;
}

function fromRow(p: RaisePipelineRow): FormState {
  return {
    stage: p.stage,
    priority: p.priority,
    next_action: p.next_action ?? '',
    next_action_due_at: p.next_action_due_at?.slice(0, 10) ?? '',
    notes: p.notes ?? '',
    committed_amount_usd: p.committed_amount_usd?.toString() ?? '',
    passed_reason: p.passed_reason ?? '',
  };
}

export default function PipelineEditor({
  raiseId,
  pipeline,
}: {
  raiseId: string;
  pipeline: RaisePipelineRow;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(fromRow(pipeline));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        stage: form.stage,
        priority: form.priority,
        next_action: form.next_action.trim() || null,
        next_action_due_at: form.next_action_due_at || null,
        notes: form.notes.trim() || null,
        committed_amount_usd: form.committed_amount_usd === ''
          ? null
          : Number(form.committed_amount_usd),
        passed_reason: form.passed_reason.trim() || null,
      };
      const res = await fetch(`/api/raises/${raiseId}/pipeline/${pipeline.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  const showCommitted = form.stage === 'committed' || form.stage === 'soft_circle';
  const showPassed = form.stage === 'passed';

  return (
    <form onSubmit={save} className="portal-card">
      <div className="portal-card-header">
        <span className="portal-card-title">Pipeline</span>
        {savedAt && !saving && (
          <span style={{ fontSize: 11, color: '#15803d' }}>Saved</span>
        )}
      </div>

      {error && (
        <div style={{ fontSize: 13, color: '#991b1b', background: '#fef2f2', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: 4, marginBottom: '0.75rem' }}>
          {error}
        </div>
      )}

      <Grid>
        <Field label="Stage">
          <select
            value={form.stage}
            onChange={(e) => set('stage', e.target.value as PipelineStage)}
            className="filter-search"
            style={{ width: '100%' }}
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>{PIPELINE_STAGE_LABELS[s]}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select
            value={form.priority}
            onChange={(e) => set('priority', e.target.value as PipelinePriority)}
            className="filter-search"
            style={{ width: '100%' }}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Next Action" span={2}>
          <input
            type="text"
            className="filter-search"
            style={{ width: '100%' }}
            value={form.next_action}
            onChange={(e) => set('next_action', e.target.value)}
            placeholder="Send NDA · Follow up after Wednesday's call · Wire commit confirmation"
          />
        </Field>
        <Field label="Due Date" span={2}>
          <input
            type="date"
            className="filter-search"
            style={{ width: '100%' }}
            value={form.next_action_due_at}
            onChange={(e) => set('next_action_due_at', e.target.value)}
          />
        </Field>

        {showCommitted && (
          <Field label="Committed Amount ($)" span={2}>
            <input
              type="number"
              className="filter-search"
              style={{ width: '100%' }}
              value={form.committed_amount_usd}
              onChange={(e) => set('committed_amount_usd', e.target.value)}
              placeholder="500000"
            />
          </Field>
        )}

        {showPassed && (
          <Field label="Pass Reason" span={2}>
            <textarea
              rows={2}
              value={form.passed_reason}
              onChange={(e) => set('passed_reason', e.target.value)}
              placeholder="Wrong asset class · Out of fund cycle · Check size too small"
              style={textareaStyle}
            />
          </Field>
        )}

        <Field label="Internal Notes" span={2}>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Background, relationship context, talking points…"
            style={textareaStyle}
          />
        </Field>
      </Grid>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
        <button type="submit" className="portal-btn portal-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
      {children}
    </div>
  );
}

function Field({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: 1 | 2 }) {
  return (
    <div style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
      <label style={{ display: 'block', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  fontFamily: 'inherit',
  fontSize: 13,
  resize: 'vertical',
};
