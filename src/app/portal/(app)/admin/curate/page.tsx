'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { IntelItem } from '@/lib/types';

export default function DigestBuilderPage() {
  const [items, setItems] = useState<IntelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [introNote, setIntroNote] = useState('');
  const [subject, setSubject] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [minRelevance, setMinRelevance] = useState(0.7);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('min_relevance', minRelevance.toString());
      params.set('limit', '100');
      const res = await fetch(`/api/intel?${params.toString()}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [minRelevance]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function toggleItem(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setSelected((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setSelected((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function addAllTopItems() {
    const topItems = items.slice(0, 8).map((i) => i.id);
    setSelected((prev) => {
      const merged = [...prev];
      for (const id of topItems) {
        if (!merged.includes(id)) merged.push(id);
      }
      return merged;
    });
  }

  async function handlePreview() {
    setMessage('');
    try {
      const res = await fetch('/api/digest/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'preview',
          item_ids: selected,
          intro_note: introNote,
          subject,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Preview failed');
      }
      const { html } = await res.json();
      setPreview(html);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Preview failed');
    }
  }

  async function handleSend() {
    if (!confirm(`Send this digest to all members of your organization? (${selected.length} items)`)) return;
    setSending(true);
    setMessage('');
    try {
      const res = await fetch('/api/digest/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'send',
          item_ids: selected,
          intro_note: introNote,
          subject,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Send failed');
      }
      const { sent_to } = await res.json();
      setMessage(`Sent to ${sent_to} recipient${sent_to === 1 ? '' : 's'}.`);
      setSelected([]);
      setIntroNote('');
      setSubject('');
      setPreview(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  }

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const selectedItems = selected.map((id) => itemMap.get(id)).filter(Boolean) as IntelItem[];

  return (
    <>
      <div className="portal-header">
        <h1>Digest Builder</h1>
        <Link href="/portal/admin" className="portal-btn portal-btn-ghost">&larr; Admin</Link>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Hand-pick 5-10 high-signal items from the past week and email them to your team or clients
        with a personal note. This replaces the auto-generated Monday digest.
      </p>

      {message && (
        <div
          className="portal-card"
          style={{
            marginBottom: '1rem',
            borderColor: message.startsWith('Sent') ? '#86efac' : '#fca5a5',
            background: message.startsWith('Sent') ? '#f0fdf4' : '#fef2f2',
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: message.startsWith('Sent') ? '#166534' : '#991b1b' }}>{message}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Available items */}
        <div className="portal-card" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div
            className="portal-card-header"
            style={{
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 2,
              paddingBottom: 12,
              marginBottom: 0,
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <span className="portal-card-title">Available Intel · past week</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 11, color: '#9ca3af' }}>
                Min relevance: {minRelevance.toFixed(1)}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={minRelevance}
                  onChange={(e) => setMinRelevance(parseFloat(e.target.value))}
                  style={{ marginLeft: 8, width: 80, verticalAlign: 'middle' }}
                />
              </label>
              <button
                className="portal-btn portal-btn-ghost"
                onClick={addAllTopItems}
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                Add top 8
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ fontSize: 13, color: '#9ca3af', padding: '1rem 0' }}>Loading...</p>
          ) : items.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af', padding: '1rem 0' }}>No items match your filter.</p>
          ) : (
            <div style={{ marginTop: 12 }}>
              {items.map((item) => {
                const isSelected = selected.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: isSelected ? '#f0fdf4' : 'transparent',
                      transition: 'background 0.15s',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ marginTop: 4, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span className="badge badge-source" data-source={item.source} style={{ fontSize: 9 }}>
                          {item.source.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 11, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
                          {item.relevance_score?.toFixed(2) ?? '—'}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>
                        {item.title}
                      </div>
                      {item.summary && (
                        <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
                          {item.summary.slice(0, 140)}
                          {item.summary.length > 140 ? '…' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Digest draft */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="portal-card">
            <div className="portal-card-header">
              <span className="portal-card-title">Digest Draft · {selected.length} items</span>
            </div>

            <label style={fieldLabelStyle}>Subject Line</label>
            <input
              type="text"
              className="filter-search"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Auto: Weekly Intelligence — [date]"
              style={{ width: '100%', marginBottom: 12 }}
            />

            <label style={fieldLabelStyle}>Note from You (optional)</label>
            <textarea
              value={introNote}
              onChange={(e) => setIntroNote(e.target.value)}
              rows={4}
              placeholder="Add a personal message to the top of the digest…"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                fontFamily: 'inherit',
                fontSize: 13,
                resize: 'vertical',
                marginBottom: 12,
              }}
            />

            <label style={fieldLabelStyle}>Selected Items (use arrows to reorder)</label>
            {selectedItems.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  border: '1px dashed #e5e7eb',
                  borderRadius: 4,
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#9ca3af',
                }}
              >
                Click items on the left to add them to the digest.
              </div>
            ) : (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 4 }}>
                {selectedItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '8px 10px',
                      borderBottom: idx < selectedItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: '#9ca3af',
                        fontVariantNumeric: 'tabular-nums',
                        width: 20,
                      }}
                    >
                      {idx + 1}.
                    </span>
                    <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: '#111827' }}>{item.title}</div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        title="Move up"
                        style={reorderBtn(idx === 0)}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === selectedItems.length - 1}
                        title="Move down"
                        style={reorderBtn(idx === selectedItems.length - 1)}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => toggleItem(item.id)}
                        title="Remove"
                        style={{
                          background: 'none',
                          border: '1px solid #fca5a5',
                          color: '#dc2626',
                          padding: '2px 6px',
                          borderRadius: 3,
                          cursor: 'pointer',
                          fontSize: 10,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                className="portal-btn portal-btn-ghost"
                onClick={handlePreview}
                disabled={selected.length === 0 || sending}
              >
                Preview
              </button>
              <button
                className="portal-btn portal-btn-primary"
                onClick={handleSend}
                disabled={selected.length === 0 || sending}
              >
                {sending ? 'Sending…' : 'Send Digest'}
              </button>
            </div>
          </div>

          {preview && (
            <div className="portal-card">
              <div className="portal-card-header">
                <span className="portal-card-title">Preview</span>
                <button
                  onClick={() => setPreview(null)}
                  style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 12 }}
                >
                  Close
                </button>
              </div>
              <div
                style={{ border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 4,
  fontWeight: 500,
};

function reorderBtn(disabled: boolean): React.CSSProperties {
  return {
    background: 'none',
    border: '1px solid #d1d5db',
    padding: '2px 6px',
    borderRadius: 3,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    fontSize: 10,
  };
}
