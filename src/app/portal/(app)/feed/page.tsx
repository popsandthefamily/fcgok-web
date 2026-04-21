'use client';

import { useEffect, useState, useCallback } from 'react';
import type { IntelItem, IntelSource, IntelCategory, Sentiment } from '@/lib/types';
import { WheelLoader } from '@/components/BuggyWheel';

const SOURCES: IntelSource[] = ['iss', 'news', 'sec', 'biggerpockets', 'podcast'];
const CATEGORIES: IntelCategory[] = ['market_intel', 'investor_activity', 'deal_flow', 'regulatory', 'competitive', 'operational'];
const SENTIMENTS: Sentiment[] = ['bullish', 'bearish', 'neutral', 'mixed'];

type AdminAction = 'pin' | 'unpin' | 'hide' | 'boost' | 'lower';

export default function FeedPage() {
  const [items, setItems] = useState<IntelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<IntelSource[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<IntelCategory[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment[]>([]);
  const [curatedOnly, setCuratedOnly] = useState(false);
  const [relevanceMin, setRelevanceMin] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const { profile } = await res.json();
          setIsAdmin(profile?.role === 'admin');
        }
      } catch {}
    })();
  }, []);

  async function runAction(itemId: string, action: AdminAction) {
    try {
      const res = await fetch(`/api/intel/${itemId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Action failed');
      const { item: updated } = await res.json();
      if (action === 'hide') {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      } else {
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...updated } : i)));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  }

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sourceFilter.length > 0) params.set('source', sourceFilter.join(','));
    if (categoryFilter.length > 0) params.set('category', categoryFilter.join(','));
    if (curatedOnly) params.set('curated', 'true');
    if (relevanceMin > 0) params.set('min_relevance', relevanceMin.toString());
    if (search.trim()) params.set('search', search.trim());

    try {
      const res = await fetch(`/api/intel?${params.toString()}`);
      const data = await res.json();
      let filtered: IntelItem[] = data.items ?? [];

      // Client-side sentiment filter (stored in JSONB)
      if (sentimentFilter.length > 0) {
        filtered = filtered.filter((i) => {
          const s = (i.ai_analysis as { sentiment?: string } | null)?.sentiment;
          return s && sentimentFilter.includes(s as Sentiment);
        });
      }

      setItems(filtered);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, categoryFilter, sentimentFilter, curatedOnly, relevanceMin, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function toggleFilter<T>(arr: T[], val: T, setter: (v: T[]) => void) {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  }

  return (
    <>
      <div className="portal-header">
        <h1>Intel Feed</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{items.length} items</span>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="text"
          className="filter-search"
          placeholder="Search intel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
        />
        <button
          className={`filter-chip${curatedOnly ? ' active' : ''}`}
          onClick={() => setCuratedOnly(!curatedOnly)}
        >
          Curated
        </button>
      </div>

      <div className="filter-bar">
        <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Source:</span>
        {SOURCES.map((s) => (
          <button
            key={s}
            className={`filter-chip${sourceFilter.includes(s) ? ' active' : ''}`}
            onClick={() => toggleFilter(sourceFilter, s, setSourceFilter)}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category:</span>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-chip${categoryFilter.includes(c) ? ' active' : ''}`}
            onClick={() => toggleFilter(categoryFilter, c, setCategoryFilter)}
          >
            {c.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sentiment:</span>
        {SENTIMENTS.map((s) => (
          <button
            key={s}
            className={`filter-chip${sentimentFilter.includes(s) ? ' active' : ''}`}
            onClick={() => toggleFilter(sentimentFilter, s, setSentimentFilter)}
          >
            <span className={`sentiment-dot ${s}`} style={{ marginRight: 6 }} />
            {s}
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Min relevance: {relevanceMin.toFixed(1)}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={relevanceMin}
            onChange={(e) => setRelevanceMin(parseFloat(e.target.value))}
            style={{ width: 100 }}
          />
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <WheelLoader label="Loading intel…" />
      ) : items.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>No items match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <IntelCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onAction={(action) => runAction(item.id, action)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function IntelCard({
  item,
  isAdmin,
  onAction,
}: {
  item: IntelItem;
  isAdmin: boolean;
  onAction: (action: AdminAction) => void;
}) {
  const analysis = item.ai_analysis;
  const relevance = item.relevance_score ?? 0;
  const barColor = relevance > 0.8 ? '#22c55e' : relevance > 0.5 ? '#f59e0b' : '#9ca3af';

  return (
    <div className="intel-card">
      <div className="intel-card-meta">
        <span className="badge badge-source" data-source={item.source}>
          {item.source.toUpperCase()}
        </span>
        {item.category && (
          <span className="badge badge-category">
            {item.category.replace('_', ' ')}
          </span>
        )}
        {item.is_curated && <span className="badge badge-curated">Curated</span>}
        {analysis?.sentiment && <span className={`sentiment-dot ${analysis.sentiment}`} />}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
          {item.published_at ? timeAgo(item.published_at) : ''}
        </span>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
        {item.source_url ? (
          <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
            {item.title}
          </a>
        ) : item.title}
      </h3>

      {item.summary && (
        <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.65, marginBottom: 8 }}>
          {item.summary}
        </p>
      )}

      {/* Entities */}
      {analysis?.entities && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {analysis.entities.companies?.map((c) => (
            <span key={c} style={{ fontSize: 11, background: '#eff6ff', color: '#1e40af', padding: '2px 6px', borderRadius: 3 }}>{c}</span>
          ))}
          {analysis.entities.people?.map((p) => (
            <span key={p} style={{ fontSize: 11, background: '#faf5ff', color: '#7e22ce', padding: '2px 6px', borderRadius: 3 }}>{p}</span>
          ))}
          {analysis.entities.locations?.map((l) => (
            <span key={l} style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', padding: '2px 6px', borderRadius: 3 }}>{l}</span>
          ))}
          {analysis.entities.dollar_amounts?.map((d) => (
            <span key={d} style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 3 }}>{d}</span>
          ))}
        </div>
      )}

      {/* Action items */}
      {analysis?.action_items && analysis.action_items.length > 0 && (
        <div style={{ fontSize: 12, color: '#1a3a2a', marginBottom: 8 }}>
          {analysis.action_items.map((a, i) => (
            <div key={i} style={{ marginBottom: 2 }}>&rarr; {a}</div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#9ca3af', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Relevance:</span>
          <span className="relevance-bar">
            <span className="relevance-bar-fill" style={{ width: `${relevance * 100}%`, background: barColor }} />
          </span>
          <span>{relevance.toFixed(2)}</span>
        </div>
        {item.source_url && (
          <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1a3a2a', textDecoration: 'none' }}>
            View original &rarr;
          </a>
        )}

        {isAdmin && (
          <div className="intel-admin-actions" style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <ActionButton
              title={item.is_curated ? 'Unpin from highlights' : 'Pin to highlights'}
              active={!!item.is_curated}
              onClick={() => onAction(item.is_curated ? 'unpin' : 'pin')}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill={item.is_curated ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17v5" />
                  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                </svg>
              }
            />
            <ActionButton
              title="Boost relevance +0.1"
              onClick={() => onAction('boost')}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 14l5-5 5 5" />
                </svg>
              }
            />
            <ActionButton
              title="Lower relevance -0.1"
              onClick={() => onAction('lower')}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10l5 5 5-5" />
                </svg>
              }
            />
            <ActionButton
              title="Hide from feed"
              danger
              onClick={() => {
                if (confirm('Hide this item from the feed? You can still find it via admin tools.')) {
                  onAction('hide');
                }
              }}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 4.22-5.17" />
                  <path d="M1 1l22 22" />
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                </svg>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  title,
  icon,
  onClick,
  active,
  danger,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        border: '1px solid',
        borderColor: active ? '#1a3a2a' : '#d1d5db',
        background: active ? '#1a3a2a' : 'white',
        color: active ? 'white' : danger ? '#dc2626' : '#6b7280',
        borderRadius: 3,
        cursor: 'pointer',
        padding: 0,
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = danger ? '#dc2626' : '#1a3a2a';
          e.currentTarget.style.background = danger ? '#fef2f2' : '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.background = 'white';
        }
      }}
    >
      {icon}
    </button>
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
