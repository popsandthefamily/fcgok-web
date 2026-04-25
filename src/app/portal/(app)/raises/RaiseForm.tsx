'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Raise, RaiseStatus, RaiseStructure } from '@/lib/types/raises';
import { RAISE_STATUS_LABELS, RAISE_STRUCTURE_LABELS } from '@/lib/types/raises';

interface DocOption {
  id: string;
  deal_name: string;
}

type Mode = { kind: 'create' } | { kind: 'edit'; raise: Raise };

interface FormState {
  name: string;
  status: RaiseStatus;
  amount_sought_usd: string;
  min_check_usd: string;
  max_check_usd: string;
  use_of_funds: string;
  revenue_usd: string;
  noi_usd: string;
  ebitda_usd: string;
  collateral_summary: string;
  geographyText: string;
  asset_class: string;
  stage: string;
  structure: RaiseStructure | '';
  target_close_date: string;
  data_room_url: string;
  linked_document_id: string;
  notes: string;
}

function emptyForm(): FormState {
  return {
    name: '',
    status: 'draft',
    amount_sought_usd: '',
    min_check_usd: '',
    max_check_usd: '',
    use_of_funds: '',
    revenue_usd: '',
    noi_usd: '',
    ebitda_usd: '',
    collateral_summary: '',
    geographyText: '',
    asset_class: '',
    stage: '',
    structure: '',
    target_close_date: '',
    data_room_url: '',
    linked_document_id: '',
    notes: '',
  };
}

function fromRaise(r: Raise): FormState {
  return {
    name: r.name,
    status: r.status,
    amount_sought_usd: r.amount_sought_usd?.toString() ?? '',
    min_check_usd: r.min_check_usd?.toString() ?? '',
    max_check_usd: r.max_check_usd?.toString() ?? '',
    use_of_funds: r.use_of_funds ?? '',
    revenue_usd: r.revenue_usd?.toString() ?? '',
    noi_usd: r.noi_usd?.toString() ?? '',
    ebitda_usd: r.ebitda_usd?.toString() ?? '',
    collateral_summary: r.collateral_summary ?? '',
    geographyText: r.geography?.join(', ') ?? '',
    asset_class: r.asset_class ?? '',
    stage: r.stage ?? '',
    structure: r.structure ?? '',
    target_close_date: r.target_close_date ?? '',
    data_room_url: r.data_room_url ?? '',
    linked_document_id: r.linked_document_id ?? '',
    notes: r.notes ?? '',
  };
}

function toPayload(f: FormState) {
  const num = (s: string) => (s === '' ? null : Number(s));
  const geography = f.geographyText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    name: f.name.trim(),
    status: f.status,
    amount_sought_usd: num(f.amount_sought_usd),
    min_check_usd: num(f.min_check_usd),
    max_check_usd: num(f.max_check_usd),
    use_of_funds: f.use_of_funds.trim() || null,
    revenue_usd: num(f.revenue_usd),
    noi_usd: num(f.noi_usd),
    ebitda_usd: num(f.ebitda_usd),
    collateral_summary: f.collateral_summary.trim() || null,
    geography: geography.length ? geography : null,
    asset_class: f.asset_class.trim() || null,
    stage: f.stage.trim() || null,
    structure: f.structure || null,
    target_close_date: f.target_close_date || null,
    data_room_url: f.data_room_url.trim() || null,
    linked_document_id: f.linked_document_id || null,
    notes: f.notes.trim() || null,
  };
}

export default function RaiseForm({ mode, onCancel }: { mode: Mode; onCancel?: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    mode.kind === 'edit' ? fromRaise(mode.raise) : emptyForm(),
  );
  const [docs, setDocs] = useState<DocOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/documents')
      .then((r) => r.json())
      .then((d) => setDocs((d.documents ?? []).map((x: DocOption) => ({ id: x.id, deal_name: x.deal_name }))))
      .catch(() => {});
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const payload = toPayload(form);
      const url = mode.kind === 'edit' ? `/api/raises/${mode.raise.id}` : '/api/raises';
      const method = mode.kind === 'edit' ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save raise');
      }
      const { raise } = (await res.json()) as { raise: Raise };
      router.push(`/portal/raises/${raise.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {error && (
        <div className="portal-card" style={{ borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '1rem' }}>
          <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Basics */}
      <Card title="Raise Basics">
        <Grid>
          <Field label="Name *" span={2}>
            <input
              type="text"
              className="filter-search"
              style={{ width: '100%' }}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g., Sherman Storage — Series A Equity"
              required
            />
          </Field>
          <Field label="Status">
            <select
              className="filter-search"
              style={{ width: '100%' }}
              value={form.status}
              onChange={(e) => set('status', e.target.value as RaiseStatus)}
            >
              {(Object.keys(RAISE_STATUS_LABELS) as RaiseStatus[]).map((s) => (
                <option key={s} value={s}>{RAISE_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="Use of Funds" span={2}>
            <textarea
              rows={2}
              value={form.use_of_funds}
              onChange={(e) => set('use_of_funds', e.target.value)}
              placeholder="Acquisition + capex; growth equity for Phase 2; ..."
              style={textareaStyle}
            />
          </Field>
        </Grid>
      </Card>

      {/* Capital ask */}
      <Card title="Capital Ask">
        <Grid>
          <Field label="Amount Sought ($)">
            <input type="number" className="filter-search" style={{ width: '100%' }} value={form.amount_sought_usd} onChange={(e) => set('amount_sought_usd', e.target.value)} placeholder="2800000" />
          </Field>
          <Field label="" span={1}>{/* spacer */}</Field>
          <Field label="Min Check ($)">
            <input type="number" className="filter-search" style={{ width: '100%' }} value={form.min_check_usd} onChange={(e) => set('min_check_usd', e.target.value)} placeholder="100000" />
          </Field>
          <Field label="Max Check ($)">
            <input type="number" className="filter-search" style={{ width: '100%' }} value={form.max_check_usd} onChange={(e) => set('max_check_usd', e.target.value)} placeholder="500000" />
          </Field>
        </Grid>
      </Card>

      {/* Match dimensions */}
      <Card title="Match Dimensions">
        <p style={helperStyle}>These drive fit scoring. The more you fill, the better the match list.</p>
        <Grid>
          <Field label="Asset Class">
            <input type="text" className="filter-search" style={{ width: '100%' }} value={form.asset_class} onChange={(e) => set('asset_class', e.target.value)} placeholder="self-storage" />
          </Field>
          <Field label="Stage">
            <input type="text" className="filter-search" style={{ width: '100%' }} value={form.stage} onChange={(e) => set('stage', e.target.value)} placeholder="development | stabilized | distressed | growth" />
          </Field>
          <Field label="Structure">
            <select
              className="filter-search"
              style={{ width: '100%' }}
              value={form.structure}
              onChange={(e) => set('structure', e.target.value as RaiseStructure | '')}
            >
              <option value="">— select —</option>
              {(Object.keys(RAISE_STRUCTURE_LABELS) as RaiseStructure[]).map((s) => (
                <option key={s} value={s}>{RAISE_STRUCTURE_LABELS[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="Target Close Date">
            <input type="date" className="filter-search" style={{ width: '100%' }} value={form.target_close_date} onChange={(e) => set('target_close_date', e.target.value)} />
          </Field>
          <Field label="Geography (comma-separated)" span={2}>
            <input
              type="text"
              className="filter-search"
              style={{ width: '100%' }}
              value={form.geographyText}
              onChange={(e) => set('geographyText', e.target.value)}
              placeholder="TX, OK, Sun Belt"
            />
          </Field>
        </Grid>
      </Card>

      {/* Business financials */}
      <Card title="Business / Asset Financials">
        <p style={helperStyle}>Optional. Helps investors qualify deal size and yield profile.</p>
        <Grid>
          <Field label="Revenue ($)">
            <input type="number" className="filter-search" style={{ width: '100%' }} value={form.revenue_usd} onChange={(e) => set('revenue_usd', e.target.value)} />
          </Field>
          <Field label="NOI ($)">
            <input type="number" className="filter-search" style={{ width: '100%' }} value={form.noi_usd} onChange={(e) => set('noi_usd', e.target.value)} />
          </Field>
          <Field label="EBITDA ($)">
            <input type="number" className="filter-search" style={{ width: '100%' }} value={form.ebitda_usd} onChange={(e) => set('ebitda_usd', e.target.value)} />
          </Field>
          <Field label="" span={1}>{/* spacer */}</Field>
          <Field label="Collateral Summary" span={2}>
            <textarea
              rows={2}
              value={form.collateral_summary}
              onChange={(e) => set('collateral_summary', e.target.value)}
              placeholder="First lien on land + improvements; corporate guarantee; ..."
              style={textareaStyle}
            />
          </Field>
        </Grid>
      </Card>

      {/* Resources */}
      <Card title="Resources">
        <Grid>
          <Field label="Linked Document">
            <select
              className="filter-search"
              style={{ width: '100%' }}
              value={form.linked_document_id}
              onChange={(e) => set('linked_document_id', e.target.value)}
            >
              <option value="">— none —</option>
              {docs.map((d) => (
                <option key={d.id} value={d.id}>{d.deal_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Data Room URL">
            <input type="url" className="filter-search" style={{ width: '100%' }} value={form.data_room_url} onChange={(e) => set('data_room_url', e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Notes" span={2}>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Internal notes, context, sponsor highlights..."
              style={textareaStyle}
            />
          </Field>
        </Grid>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="portal-btn portal-btn-ghost">Cancel</button>
        ) : (
          <Link href="/portal/raises" className="portal-btn portal-btn-ghost">Cancel</Link>
        )}
        <button type="submit" className="portal-btn portal-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : mode.kind === 'edit' ? 'Save changes' : 'Create raise'}
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="portal-card" style={{ marginBottom: '1rem' }}>
      <div className="portal-card-header">
        <span className="portal-card-title">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
      {children}
    </div>
  );
}

function Field({ label, children, span = 1 }: { label: string; children?: React.ReactNode; span?: 1 | 2 }) {
  return (
    <div style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
      <label style={{ display: 'block', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
        {label || ' '}
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

const helperStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#6b7280',
  marginTop: -4,
  marginBottom: 12,
};
