'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SHARED_ASSET_TYPES,
  SHARED_ASSET_TYPE_LABELS,
  type SharedAsset,
  type SharedAssetType,
} from '@/lib/types/engagement';

const EXPIRY_OPTIONS: { label: string; days: number | null }[] = [
  { label: 'Never', days: null },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function ShareLinkCreator({
  raiseId,
  pipelineId,
}: {
  raiseId: string;
  pipelineId: string;
}) {
  const router = useRouter();
  const [shares, setShares] = useState<SharedAsset[] | null>(null);
  const [assetType, setAssetType] = useState<SharedAssetType>('pitch_deck');
  const [externalUrl, setExternalUrl] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch(`/api/raises/${raiseId}/pipeline/${pipelineId}/share`)
      .then((r) => r.json())
      .then((d) => setShares((d.shares ?? []) as SharedAsset[]))
      .catch(() => setShares([]));
  }, [raiseId, pipelineId]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!externalUrl.trim()) {
      setError('Paste a URL to share');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/raises/${raiseId}/pipeline/${pipelineId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_type: assetType,
          external_url: externalUrl.trim(),
          expires_in_days: expiresInDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setShares((prev) => [data.share as SharedAsset, ...(prev ?? [])]);
      setExternalUrl('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  async function copy(share: SharedAsset) {
    const url = `${origin}/s/${share.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(share.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  }

  async function revoke(share: SharedAsset) {
    if (!confirm('Revoke this link? Anyone who has it will see a "revoked" message.')) return;
    const res = await fetch(`/api/raises/${raiseId}/pipeline/${pipelineId}/share/${share.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setShares((prev) => prev?.map((s) => (s.id === share.id ? { ...s, revoked_at: new Date().toISOString() } : s)) ?? null);
      router.refresh();
    }
  }

  const activeShares = (shares ?? []).filter((s) => !s.revoked_at);

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <span className="portal-card-title">Share Links</span>
        {shares && (
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            {activeShares.length} active
          </span>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 0, marginBottom: '0.75rem', lineHeight: 1.5 }}>
        Tokenized links. Each click logs an engagement event on this investor's
        timeline. Paste the share URL into outreach in place of the raw asset URL.
      </p>

      {/* Existing shares */}
      {shares && shares.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
          {shares.map((s) => {
            const url = `${origin}/s/${s.token}`;
            const isRevoked = !!s.revoked_at;
            const isExpired = !!s.expires_at && new Date(s.expires_at).getTime() < Date.now();
            const dim = isRevoked || isExpired;
            return (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: 8,
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center',
                  fontSize: 12,
                  opacity: dim ? 0.5 : 1,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#111827', fontWeight: 500, marginBottom: 2 }}>
                    {SHARED_ASSET_TYPE_LABELS[s.asset_type]}
                    {isRevoked && <span style={{ color: '#991b1b', marginLeft: 6 }}>· revoked</span>}
                    {!isRevoked && isExpired && <span style={{ color: '#92400e', marginLeft: 6 }}>· expired</span>}
                  </div>
                  <div style={{ color: '#6b7280', fontFamily: 'ui-monospace, monospace', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {url}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(s)}
                  disabled={dim}
                  className="portal-btn portal-btn-ghost"
                  style={{ fontSize: 11, padding: '4px 8px' }}
                >
                  {copiedId === s.id ? 'Copied' : 'Copy'}
                </button>
                {!dim && (
                  <button
                    type="button"
                    onClick={() => revoke(s)}
                    className="portal-btn portal-btn-ghost"
                    style={{ fontSize: 11, padding: '4px 8px', color: '#991b1b' }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div style={{ fontSize: 13, color: '#991b1b', background: '#fef2f2', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: 4, marginBottom: '0.75rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={fieldLabel}>Asset Type</label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value as SharedAssetType)}
            className="filter-search"
            style={{ width: '100%' }}
          >
            {SHARED_ASSET_TYPES.map((t) => (
              <option key={t} value={t}>{SHARED_ASSET_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Expires</label>
          <select
            value={expiresInDays ?? ''}
            onChange={(e) => setExpiresInDays(e.target.value === '' ? null : Number(e.target.value))}
            className="filter-search"
            style={{ width: '100%' }}
          >
            {EXPIRY_OPTIONS.map((o) => (
              <option key={o.label} value={o.days ?? ''}>{o.label}</option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={fieldLabel}>Destination URL</label>
          <input
            type="url"
            className="filter-search"
            style={{ width: '100%' }}
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://drive.google.com/... or https://docsend.com/..."
            required
          />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="portal-btn portal-btn-primary" disabled={creating}>
            {creating ? 'Creating…' : 'Create share link'}
          </button>
        </div>
      </form>
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 4,
  fontWeight: 500,
};
