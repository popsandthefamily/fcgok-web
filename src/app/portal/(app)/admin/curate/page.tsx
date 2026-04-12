'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { IntelItem } from '@/lib/types';

export default function CuratePage() {
  const [items, setItems] = useState<IntelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('intel_items')
      .select('*')
      .eq('is_curated', false)
      .order('relevance_score', { ascending: false })
      .limit(50);

    setItems((data as IntelItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleCurate(id: string) {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    const supabase = createClient();
    const { error } = await supabase
      .from('intel_items')
      .update({ is_curated: true })
      .eq('id', id);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  }

  async function handleHide(id: string) {
    if (!confirm('Remove this item permanently?')) return;
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    const supabase = createClient();
    const { error } = await supabase
      .from('intel_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  }

  async function handleScoreChange(id: string, newScore: number) {
    const supabase = createClient();
    await supabase
      .from('intel_items')
      .update({ relevance_score: newScore })
      .eq('id', id);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, relevance_score: newScore } : item
      )
    );
  }

  return (
    <>
      <div className="portal-header">
        <h1>Curate Intel</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {items.length} uncurated items
        </span>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>
        Review incoming intel items sorted by relevance. Curate items to surface them in the client feed, hide irrelevant items, or adjust relevance scores.
      </p>

      {loading ? (
        <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading...</p>
      ) : items.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>All items have been curated. Check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => {
            const relevance = item.relevance_score ?? 0;
            const barColor = relevance > 0.8 ? '#22c55e' : relevance > 0.5 ? '#f59e0b' : '#9ca3af';
            const isProcessing = actionLoading[item.id] ?? false;

            return (
              <div key={item.id} className="intel-card" style={{ opacity: isProcessing ? 0.5 : 1 }}>
                <div className="intel-card-meta">
                  <span className="badge badge-source" data-source={item.source}>
                    {item.source.toUpperCase()}
                  </span>
                  {item.category && (
                    <span className="badge badge-category">
                      {item.category.replace('_', ' ')}
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
                    {item.ingested_at ? timeAgo(item.ingested_at) : ''}
                  </span>
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
                  {item.source_url ? (
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>

                {item.summary && (
                  <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.65, marginBottom: 10 }}>
                    {item.summary}
                  </p>
                )}

                {/* Relevance display + slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                    <span>Relevance:</span>
                    <span className="relevance-bar">
                      <span className="relevance-bar-fill" style={{ width: `${relevance * 100}%`, background: barColor }} />
                    </span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: 32 }}>{relevance.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af' }}>
                    <span>Adjust:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={relevance}
                      onChange={(e) => handleScoreChange(item.id, parseFloat(e.target.value))}
                      style={{ width: 120 }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="portal-btn portal-btn-primary"
                    onClick={() => handleCurate(item.id)}
                    disabled={isProcessing}
                  >
                    Curate
                  </button>
                  <button
                    className="portal-btn portal-btn-ghost"
                    onClick={() => handleHide(item.id)}
                    disabled={isProcessing}
                    style={{ color: '#dc2626' }}
                  >
                    Hide
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
