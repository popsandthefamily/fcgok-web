'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { IntelItem, IntelSource, IntelCategory, Sentiment } from '@/lib/types';

const SOURCES: IntelSource[] = ['iss', 'news', 'reddit', 'sec', 'linkedin', 'biggerpockets', 'podcast'];
const CATEGORIES: IntelCategory[] = ['market_intel', 'investor_activity', 'deal_flow', 'regulatory', 'competitive', 'operational'];
const SENTIMENTS: Sentiment[] = ['bullish', 'bearish', 'neutral', 'mixed'];

export default function FeedPage() {
  const [items, setItems] = useState<IntelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<IntelSource[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<IntelCategory[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment[]>([]);
  const [curatedOnly, setCuratedOnly] = useState(false);
  const [relevanceMin, setRelevanceMin] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('intel_items')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

    if (sourceFilter.length > 0) query = query.in('source', sourceFilter);
    if (categoryFilter.length > 0) query = query.in('category', categoryFilter);
    if (curatedOnly) query = query.eq('is_curated', true);
    if (relevanceMin > 0) query = query.gte('relevance_score', relevanceMin);
    if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,body.ilike.%${search}%`);

    const { data } = await query;
    let filtered = (data as IntelItem[]) ?? [];

    // Client-side sentiment filter (stored in JSONB)
    if (sentimentFilter.length > 0) {
      filtered = filtered.filter((i) => {
        const s = (i.ai_analysis as { sentiment?: string } | null)?.sentiment;
        return s && sentimentFilter.includes(s as Sentiment);
      });
    }

    setItems(filtered);
    setLoading(false);
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
        <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading...</p>
      ) : items.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>No items match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <IntelCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}

function IntelCard({ item }: { item: IntelItem }) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#9ca3af' }}>
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
      </div>
    </div>
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
