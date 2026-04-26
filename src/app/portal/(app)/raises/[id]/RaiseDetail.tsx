'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Raise } from '@/lib/types/raises';
import { RAISE_STATUS_LABELS, RAISE_STRUCTURE_LABELS } from '@/lib/types/raises';
import RaiseForm from '../RaiseForm';

function formatUsd(n: number | null): string {
  if (n == null) return '—';
  return `$${n.toLocaleString()}`;
}

export default function RaiseDetail({
  raise,
  linkedDocName,
}: {
  raise: Raise;
  linkedDocName: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${raise.name}"? This can't be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/raises/${raise.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/portal/raises');
      router.refresh();
    } else {
      setDeleting(false);
      alert('Failed to delete');
    }
  }

  if (editing) {
    return (
      <>
        <div className="portal-header">
          <h1>Edit Raise</h1>
          <Link href={`/portal/raises/${raise.id}`} className="portal-btn portal-btn-ghost" onClick={() => setEditing(false)}>
            &larr; Back
          </Link>
        </div>
        <RaiseForm mode={{ kind: 'edit', raise }} onCancel={() => setEditing(false)} />
      </>
    );
  }

  return (
    <>
      <div className="portal-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>{raise.name}</h1>
          <span className={`status-badge status-${statusToBadge(raise.status)}`}>
            {RAISE_STATUS_LABELS[raise.status]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/portal/raises" className="portal-btn portal-btn-ghost">&larr; All Raises</Link>
          <button onClick={() => setEditing(true)} className="portal-btn portal-btn-primary">Edit</button>
        </div>
      </div>

      {/* Capital Ask */}
      <Card title="Capital Ask">
        <Row><Label>Amount Sought</Label><Value>{formatUsd(raise.amount_sought_usd)}</Value></Row>
        <Row><Label>Check Range</Label><Value>{formatUsd(raise.min_check_usd)} – {formatUsd(raise.max_check_usd)}</Value></Row>
        {raise.use_of_funds && (
          <Row><Label>Use of Funds</Label><Value>{raise.use_of_funds}</Value></Row>
        )}
      </Card>

      {/* Match Dimensions */}
      <Card title="Match Dimensions">
        <Row><Label>Asset Class</Label><Value>{raise.asset_class ?? '—'}</Value></Row>
        <Row><Label>Stage</Label><Value>{raise.stage ?? '—'}</Value></Row>
        <Row><Label>Structure</Label><Value>{raise.structure ? RAISE_STRUCTURE_LABELS[raise.structure] : '—'}</Value></Row>
        <Row><Label>Geography</Label><Value>{raise.geography?.length ? raise.geography.join(', ') : '—'}</Value></Row>
        <Row><Label>Target Close</Label><Value>{raise.target_close_date ?? '—'}</Value></Row>
      </Card>

      {/* Financials */}
      {(raise.revenue_usd || raise.noi_usd || raise.ebitda_usd || raise.collateral_summary) && (
        <Card title="Business / Asset Financials">
          {raise.revenue_usd != null && <Row><Label>Revenue</Label><Value>{formatUsd(raise.revenue_usd)}</Value></Row>}
          {raise.noi_usd != null && <Row><Label>NOI</Label><Value>{formatUsd(raise.noi_usd)}</Value></Row>}
          {raise.ebitda_usd != null && <Row><Label>EBITDA</Label><Value>{formatUsd(raise.ebitda_usd)}</Value></Row>}
          {raise.collateral_summary && <Row><Label>Collateral</Label><Value>{raise.collateral_summary}</Value></Row>}
        </Card>
      )}

      {/* Resources */}
      {(linkedDocName || raise.data_room_url || raise.notes) && (
        <Card title="Resources">
          {linkedDocName && (
            <Row>
              <Label>Linked Document</Label>
              <Value><Link href={`/portal/toolkit/builder/${raise.linked_document_id}`}>{linkedDocName}</Link></Value>
            </Row>
          )}
          {raise.data_room_url && (
            <Row>
              <Label>Data Room</Label>
              <Value><a href={raise.data_room_url} target="_blank" rel="noopener noreferrer">{raise.data_room_url}</a></Value>
            </Row>
          )}
          {raise.notes && <Row><Label>Notes</Label><Value>{raise.notes}</Value></Row>}
        </Card>
      )}

      {/* Investor matches */}
      <div className="portal-card" style={{ marginBottom: '1rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Investor Matches</span>
          <Link href={`/portal/raises/${raise.id}/matches`} className="portal-btn portal-btn-primary" style={{ fontSize: 12, padding: '4px 10px' }}>
            View top 25 →
          </Link>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
          Tracked investors ranked against this raise's profile, with a per-factor
          breakdown. Edit the raise to refine geography, asset class, and check size for
          better ranking.
        </p>
      </div>

      {/* Pipeline */}
      <div className="portal-card" style={{ marginBottom: '1rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Pipeline</span>
          <Link href={`/portal/raises/${raise.id}/pipeline`} className="portal-btn portal-btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
            Open pipeline →
          </Link>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
          Investors you're actively working through stages — from identified to
          committed. Add candidates from the matches view, then move them through
          the pipeline as conversations progress.
        </p>
      </div>

      {/* Engagement */}
      <div className="portal-card" style={{ marginBottom: '1rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Engagement</span>
          <Link href={`/portal/raises/${raise.id}/engagement`} className="portal-btn portal-btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
            View leaderboard →
          </Link>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
          Who's actually opening emails, clicking links, and viewing materials.
          Tracked via tokenized share links and "Send via app" outreach.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="portal-btn"
          style={{
            color: '#991b1b',
            border: '1px solid #fca5a5',
            background: 'transparent',
            cursor: deleting ? 'wait' : 'pointer',
          }}
        >
          {deleting ? 'Deleting…' : 'Delete raise'}
        </button>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="portal-card" style={{ marginBottom: '1rem' }}>
      <div className="portal-card-header">
        <span className="portal-card-title">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em', fontWeight: 500 }}>{children}</div>;
}

function Value({ children }: { children: React.ReactNode }) {
  return <div style={{ color: '#111827' }}>{children}</div>;
}

function statusToBadge(status: Raise['status']): string {
  switch (status) {
    case 'active': return 'active';
    case 'draft': return 'watching';
    case 'paused': return 'contacted';
    case 'closed_won': return 'engaged';
    case 'closed_lost': return 'passed';
  }
}
