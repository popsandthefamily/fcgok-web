'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CompsFilters({
  geo,
  dateFrom,
  dateTo,
}: {
  geo: string;
  dateFrom: string;
  dateTo: string;
}) {
  const router = useRouter();
  const [geoVal, setGeoVal] = useState(geo);
  const [fromVal, setFromVal] = useState(dateFrom);
  const [toVal, setToVal] = useState(dateTo);

  function applyFilters() {
    const params = new URLSearchParams();
    if (geoVal.trim()) params.set('geo', geoVal.trim());
    if (fromVal) params.set('from', fromVal);
    if (toVal) params.set('to', toVal);
    const qs = params.toString();
    router.push('/portal/toolkit/comps' + (qs ? `?${qs}` : ''));
  }

  function clearFilters() {
    setGeoVal('');
    setFromVal('');
    setToVal('');
    router.push('/portal/toolkit/comps');
  }

  return (
    <div className="filter-bar" style={{ alignItems: 'flex-end', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 180 }}>
        <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Geography
        </label>
        <input
          type="text"
          className="filter-search"
          placeholder="City, state, or MSA..."
          value={geoVal}
          onChange={(e) => setGeoVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          From
        </label>
        <input
          type="date"
          className="filter-search"
          style={{ minWidth: 140 }}
          value={fromVal}
          onChange={(e) => setFromVal(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          To
        </label>
        <input
          type="date"
          className="filter-search"
          style={{ minWidth: 140 }}
          value={toVal}
          onChange={(e) => setToVal(e.target.value)}
        />
      </div>
      <button className="portal-btn portal-btn-primary" onClick={applyFilters}>
        Apply
      </button>
      {(geo || dateFrom || dateTo) && (
        <button className="portal-btn portal-btn-ghost" onClick={clearFilters}>
          Clear
        </button>
      )}
    </div>
  );
}
