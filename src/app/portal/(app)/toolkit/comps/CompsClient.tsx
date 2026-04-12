'use client';

import { useMemo, useState } from 'react';
import type { IntelItem } from '@/lib/types';

type SortKey = 'date' | 'amount' | 'cap_rate';
type SortDir = 'asc' | 'desc';
type DealType = 'all' | 'acquisition' | 'disposition' | 'fund-raise' | 'debt' | 'development';

interface EnrichedComp {
  id: string;
  title: string;
  source: string;
  sourceUrl: string | null;
  publishedAt: string | null;
  companies: string[];
  locations: string[];
  dollarRaw: string[];
  dollarNumeric: number | null;
  capRateRaw: string[];
  capRateNumeric: number | null;
  tags: string[];
  summary: string | null;
  dealType: DealType;
}

// Parse strings like "$1.1B", "$42 million", "$50M", "$250,000" → number
function parseDollar(s: string): number | null {
  const cleaned = s.replace(/[\$,\s]/g, '').toLowerCase();
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*(b|bn|billion|m|mn|million|k|thousand)?/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const unit = match[2] ?? '';
  if (unit.startsWith('b')) return num * 1_000_000_000;
  if (unit.startsWith('m')) return num * 1_000_000;
  if (unit.startsWith('k') || unit.startsWith('t')) return num * 1_000;
  return num;
}

// Parse strings like "6.2%", "5.8-6.4%" → first numeric value
function parseCapRate(s: string): number | null {
  const match = s.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function formatDollar(n: number | null): string {
  if (n === null) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// Classify the deal type from title + tags
function classifyDealType(title: string, tags: string[]): DealType {
  const text = `${title} ${tags.join(' ')}`.toLowerCase();
  if (/fund\s+(close|raise|iv|v|vi|vii|viii|ix|x)|form\s*d/i.test(text)) return 'fund-raise';
  if (/construction|ground[\s-]up|development|new build/i.test(text)) return 'development';
  if (/loan|debt|lending|credit|bridge|refinanc/i.test(text)) return 'debt';
  if (/sold|disposition|divest/i.test(text)) return 'disposition';
  if (/acqui|purchas|buy|portfolio sale/i.test(text)) return 'acquisition';
  return 'all';
}

function enrichItem(item: IntelItem): EnrichedComp {
  const entities = item.ai_analysis?.entities;
  const dollarRaw = entities?.dollar_amounts ?? [];
  const capRateRaw = entities?.cap_rates ?? [];

  // Pick the largest dollar amount (usually the deal size)
  const dollarNumerics = dollarRaw.map(parseDollar).filter((n): n is number => n !== null);
  const dollarNumeric = dollarNumerics.length > 0 ? Math.max(...dollarNumerics) : null;

  // First cap rate if present
  const capRateNumerics = capRateRaw.map(parseCapRate).filter((n): n is number => n !== null);
  const capRateNumeric = capRateNumerics.length > 0 ? capRateNumerics[0] : null;

  return {
    id: item.id,
    title: item.title,
    source: item.source,
    sourceUrl: item.source_url,
    publishedAt: item.published_at,
    companies: entities?.companies ?? [],
    locations: entities?.locations ?? [],
    dollarRaw,
    dollarNumeric,
    capRateRaw,
    capRateNumeric,
    tags: item.tags ?? [],
    summary: item.summary,
    dealType: classifyDealType(item.title, item.tags ?? []),
  };
}

export default function CompsClient({ items }: { items: IntelItem[] }) {
  const enriched = useMemo(() => items.map(enrichItem), [items]);

  const [geoFilter, setGeoFilter] = useState('');
  const [dealTypeFilter, setDealTypeFilter] = useState<DealType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [minDollar, setMinDollar] = useState<number>(0);

  const filtered = useMemo(() => {
    let result = [...enriched];

    if (geoFilter.trim()) {
      const q = geoFilter.toLowerCase();
      result = result.filter(
        (c) =>
          c.locations.some((l) => l.toLowerCase().includes(q)) ||
          c.title.toLowerCase().includes(q) ||
          c.companies.some((co) => co.toLowerCase().includes(q)),
      );
    }

    if (dealTypeFilter !== 'all') {
      result = result.filter((c) => c.dealType === dealTypeFilter);
    }

    if (minDollar > 0) {
      result = result.filter((c) => (c.dollarNumeric ?? 0) >= minDollar);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') {
        const ad = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bd = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        cmp = ad - bd;
      } else if (sortKey === 'amount') {
        cmp = (a.dollarNumeric ?? -Infinity) - (b.dollarNumeric ?? -Infinity);
      } else if (sortKey === 'cap_rate') {
        cmp = (a.capRateNumeric ?? Infinity) - (b.capRateNumeric ?? Infinity);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [enriched, geoFilter, dealTypeFilter, sortKey, sortDir, minDollar]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'cap_rate' ? 'asc' : 'desc');
    }
  }

  function exportCSV() {
    const headers = ['Date', 'Title', 'Deal Type', 'Companies', 'Locations', 'Amount', 'Cap Rate', 'Source', 'URL'];
    const rows = filtered.map((c) => [
      c.publishedAt ? new Date(c.publishedAt).toISOString().split('T')[0] : '',
      c.title.replace(/"/g, '""'),
      c.dealType,
      c.companies.join('; '),
      c.locations.join('; '),
      c.dollarNumeric ?? '',
      c.capRateNumeric ? `${c.capRateNumeric}%` : '',
      c.source,
      c.sourceUrl ?? '',
    ]);
    const csv = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comps-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const DEAL_TYPES: DealType[] = ['all', 'acquisition', 'disposition', 'fund-raise', 'debt', 'development'];

  return (
    <>
      {/* Filter row */}
      <div className="portal-card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
              Geography / Entity Search
            </label>
            <input
              type="text"
              className="filter-search"
              placeholder="Sherman, Texas, SROA, Platinum..."
              value={geoFilter}
              onChange={(e) => setGeoFilter(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
              Min Deal Size
            </label>
            <select
              value={minDollar}
              onChange={(e) => setMinDollar(parseInt(e.target.value))}
              className="filter-search"
              style={{ width: '100%' }}
            >
              <option value={0}>Any</option>
              <option value={1_000_000}>$1M+</option>
              <option value={5_000_000}>$5M+</option>
              <option value={10_000_000}>$10M+</option>
              <option value={25_000_000}>$25M+</option>
              <option value={50_000_000}>$50M+</option>
              <option value={100_000_000}>$100M+</option>
            </select>
          </div>
          <button className="portal-btn portal-btn-primary" onClick={exportCSV}>
            Export CSV
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>
            Deal Type:
          </span>
          {DEAL_TYPES.map((type) => (
            <button
              key={type}
              className={`filter-chip${dealTypeFilter === type ? ' active' : ''}`}
              onClick={() => setDealTypeFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: '0.75rem' }}>
        {filtered.length} of {enriched.length} comps
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            No comparable transactions match your filters.
          </p>
        </div>
      ) : (
        <div className="portal-card" style={{ overflow: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                <Th label="Date" active={sortKey === 'date'} dir={sortDir} onClick={() => toggleSort('date')} />
                <th style={thStyle}>Deal</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Parties</th>
                <th style={thStyle}>Location</th>
                <Th label="Amount" active={sortKey === 'amount'} dir={sortDir} onClick={() => toggleSort('amount')} />
                <Th label="Cap Rate" active={sortKey === 'cap_rate'} dir={sortDir} onClick={() => toggleSort('cap_rate')} />
                <th style={thStyle}>Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#6b7280' }}>
                    {c.publishedAt
                      ? new Date(c.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                      : '—'}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#111827', maxWidth: 360 }}>
                    {c.title}
                    {c.summary && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, fontWeight: 400, lineHeight: 1.4 }}>
                        {c.summary.slice(0, 120)}
                        {c.summary.length > 120 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span className="badge badge-category" style={{ fontSize: 10 }}>{c.dealType}</span>
                  </td>
                  <td style={{ ...tdStyle, color: '#374151', fontSize: 12 }}>
                    {c.companies.slice(0, 2).join(', ') || '—'}
                    {c.companies.length > 2 && ` +${c.companies.length - 2}`}
                  </td>
                  <td style={{ ...tdStyle, color: '#374151', fontSize: 12 }}>
                    {c.locations.slice(0, 2).join(', ') || '—'}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {formatDollar(c.dollarNumeric)}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {c.capRateNumeric !== null ? `${c.capRateNumeric.toFixed(1)}%` : '—'}
                  </td>
                  <td style={tdStyle}>
                    {c.sourceUrl ? (
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1a3a2a', textDecoration: 'none', fontSize: 12 }}
                      >
                        {c.source} &rarr;
                      </a>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: 12 }}>{c.source}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  color: '#6b7280',
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'top',
};

function Th({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }} onClick={onClick}>
      {label}
      {active && <span style={{ marginLeft: 4 }}>{dir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  );
}
