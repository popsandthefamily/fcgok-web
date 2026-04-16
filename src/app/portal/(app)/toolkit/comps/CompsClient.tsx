'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Comp } from '@/lib/types';
import { WheelLoader } from '@/components/BuggyWheel';

type SortKey = 'date' | 'price' | 'cap_rate' | 'ppu';
type SortDir = 'asc' | 'desc';

const ASSET_TYPES = [
  '', 'self-storage', 'multi-family', 'industrial',
  'retail', 'office', 'hospitality', 'mixed',
];

function fmtDollar(n: number | null): string {
  if (n === null) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: '2-digit',
  });
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px', color: '#6b7280', fontWeight: 600,
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left',
};
const tdStyle: React.CSSProperties = { padding: '10px 12px', verticalAlign: 'top' };

export default function CompsClient() {
  const [comps, setComps] = useState<Comp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [geoFilter, setGeoFilter] = useState('');
  const [assetFilter, setAssetFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showForm, setShowForm] = useState(false);

  const fetchComps = useCallback(async () => {
    try {
      const res = await fetch('/api/toolkit/comps');
      if (!res.ok) throw new Error('Failed to load comps');
      const data = await res.json();
      setComps(data.comps ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchComps(); }, [fetchComps]);

  const filtered = useMemo(() => {
    let result = [...comps];
    if (geoFilter.trim()) {
      const q = geoFilter.toLowerCase();
      result = result.filter((c) =>
        [c.property_name, c.city, c.state, c.buyer, c.seller, c.address]
          .some((f) => f?.toLowerCase().includes(q)),
      );
    }
    if (assetFilter) {
      result = result.filter((c) => c.asset_type === assetFilter);
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') {
        cmp = (a.sale_date ?? '').localeCompare(b.sale_date ?? '');
      } else if (sortKey === 'price') {
        cmp = (a.sale_price ?? 0) - (b.sale_price ?? 0);
      } else if (sortKey === 'cap_rate') {
        cmp = (a.cap_rate ?? 999) - (b.cap_rate ?? 999);
      } else if (sortKey === 'ppu') {
        cmp = (a.price_per_unit ?? 0) - (b.price_per_unit ?? 0);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [comps, geoFilter, assetFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'cap_rate' ? 'asc' : 'desc'); }
  }

  async function handleDelete(id: string) {
    await fetch('/api/toolkit/comps', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setComps((prev) => prev.filter((c) => c.id !== id));
  }

  function exportCSV() {
    const headers = ['Date', 'Property', 'City', 'State', 'Asset Type', 'Sale Price', '$/Unit', '$/SF', 'Cap Rate', 'Buyer', 'Seller', 'Units', 'SF', 'Source', 'Notes'];
    const rows = filtered.map((c) => [
      c.sale_date ?? '', c.property_name ?? '', c.city ?? '', c.state ?? '',
      c.asset_type ?? '', c.sale_price ?? '', c.price_per_unit ?? '',
      c.price_per_sf ?? '', c.cap_rate ? `${c.cap_rate}%` : '',
      c.buyer ?? '', c.seller ?? '', c.units ?? '', c.square_feet ?? '',
      c.source, c.notes ?? '',
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

  if (loading) return <WheelLoader label="Loading comps…" />;

  return (
    <>
      {/* Filters */}
      <div className="portal-card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto auto', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
              Search
            </label>
            <input
              className="filter-search"
              placeholder="Property, city, buyer, seller…"
              value={geoFilter}
              onChange={(e) => setGeoFilter(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
              Asset Type
            </label>
            <select className="filter-search" value={assetFilter} onChange={(e) => setAssetFilter(e.target.value)} style={{ width: '100%', height: 38 }}>
              <option value="">All</option>
              {ASSET_TYPES.filter(Boolean).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button className="portal-btn portal-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Comp'}
          </button>
          <button className="portal-btn portal-btn-ghost" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="portal-card" style={{ borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '1rem' }}>
          <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Add comp form */}
      {showForm && (
        <AddCompForm
          onSaved={(comp) => {
            setComps((prev) => [comp, ...prev]);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: '0.75rem' }}>
        {filtered.length} comp{filtered.length !== 1 ? 's' : ''}
        {comps.length > filtered.length && ` of ${comps.length} total`}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            {comps.length === 0
              ? 'No comps yet. Add one manually or extract from your intel feed.'
              : 'No comps match your filters.'}
          </p>
        </div>
      ) : (
        <div className="portal-card" style={{ overflow: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                <ThSort label="Date" k="date" active={sortKey} dir={sortDir} toggle={toggleSort} />
                <th style={thStyle}>Property</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Type</th>
                <ThSort label="Sale Price" k="price" active={sortKey} dir={sortDir} toggle={toggleSort} />
                <ThSort label="$/Unit" k="ppu" active={sortKey} dir={sortDir} toggle={toggleSort} />
                <th style={thStyle}>$/SF</th>
                <ThSort label="Cap Rate" k="cap_rate" active={sortKey} dir={sortDir} toggle={toggleSort} />
                <th style={thStyle}>Buyer / Seller</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#6b7280' }}>{fmtDate(c.sale_date)}</td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#111827', maxWidth: 280 }}>
                    {c.property_name || '(unnamed)'}
                    {c.notes && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, fontWeight: 400 }}>
                        {c.notes.slice(0, 100)}{c.notes.length > 100 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: '#374151', fontSize: 12 }}>
                    {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td style={tdStyle}>
                    {c.asset_type ? (
                      <span className="badge badge-category" style={{ fontSize: 10 }}>{c.asset_type}</span>
                    ) : '—'}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {fmtDollar(c.sale_price)}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {c.price_per_unit ? fmtDollar(c.price_per_unit) : '—'}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {c.price_per_sf ? `$${Number(c.price_per_sf).toFixed(0)}` : '—'}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {c.cap_rate !== null ? `${Number(c.cap_rate).toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12, color: '#374151' }}>
                    {c.buyer && <div>{c.buyer}</div>}
                    {c.seller && <div style={{ color: '#9ca3af' }}>from {c.seller}</div>}
                    {!c.buyer && !c.seller && '—'}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {!c.verified && (
                        <span style={{ fontSize: 10, color: '#ca8a04', background: '#fefce8', padding: '1px 6px', borderRadius: 3 }}>
                          unverified
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9ca3af' }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
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

function ThSort({ label, k, active, dir, toggle }: {
  label: string; k: SortKey; active: SortKey; dir: SortDir;
  toggle: (k: SortKey) => void;
}) {
  return (
    <th style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => toggle(k)}>
      {label}
      {active === k && <span style={{ marginLeft: 4 }}>{dir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  );
}

function AddCompForm({ onSaved, onCancel }: { onSaved: (c: Comp) => void; onCancel: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string)?.trim() || undefined;
    const num = (k: string) => { const v = get(k); return v ? Number(v) : undefined; };

    const salePrice = num('sale_price');
    const units = num('units');
    const sf = num('square_feet');

    const body = {
      property_name: get('property_name'),
      address: get('address'),
      city: get('city'),
      state: get('state'),
      zip: get('zip'),
      sale_price: salePrice,
      sale_date: get('sale_date'),
      buyer: get('buyer'),
      seller: get('seller'),
      asset_type: get('asset_type'),
      units,
      square_feet: sf,
      lot_acres: num('lot_acres'),
      year_built: num('year_built'),
      price_per_unit: salePrice && units ? Math.round(salePrice / units) : undefined,
      price_per_sf: salePrice && sf ? Math.round((salePrice / sf) * 100) / 100 : undefined,
      cap_rate: num('cap_rate'),
      noi: num('noi'),
      notes: get('notes'),
    };

    try {
      const res = await fetch('/api/toolkit/comps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to save');
      }
      const { comp } = await res.json();
      onSaved(comp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
  };
  const inputStyle: React.CSSProperties = { width: '100%' };

  return (
    <div className="portal-card" style={{ marginBottom: '1rem' }}>
      <span className="portal-card-title" style={{ marginBottom: '1rem', display: 'block' }}>
        Add Comparable Transaction
      </span>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Property Name</label>
            <input className="filter-search" name="property_name" placeholder="Beavers Bend Storage" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input className="filter-search" name="address" placeholder="123 Main St" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input className="filter-search" name="city" placeholder="Broken Bow" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>State</label>
            <input className="filter-search" name="state" placeholder="OK" maxLength={2} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 140px', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Sale Price ($)</label>
            <input className="filter-search" name="sale_price" type="number" placeholder="2500000" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Sale Date</label>
            <input className="filter-search" name="sale_date" type="date" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Asset Type</label>
            <select className="filter-search" name="asset_type" style={{ ...inputStyle, height: 38 }}>
              <option value="">—</option>
              {ASSET_TYPES.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Cap Rate (%)</label>
            <input className="filter-search" name="cap_rate" type="number" step="0.1" placeholder="6.2" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px 100px 100px', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Buyer</label>
            <input className="filter-search" name="buyer" placeholder="Acme Capital" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Seller</label>
            <input className="filter-search" name="seller" placeholder="Local Dev LLC" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Units</label>
            <input className="filter-search" name="units" type="number" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>SF</label>
            <input className="filter-search" name="square_feet" type="number" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>NOI ($)</label>
            <input className="filter-search" name="noi" type="number" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Year Built</label>
            <input className="filter-search" name="year_built" type="number" placeholder="2022" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Notes</label>
          <input className="filter-search" name="notes" placeholder="Off-market deal, sourced via broker relationship" style={inputStyle} />
        </div>

        {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="portal-btn portal-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Comp'}
          </button>
          <button type="button" className="portal-btn portal-btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
