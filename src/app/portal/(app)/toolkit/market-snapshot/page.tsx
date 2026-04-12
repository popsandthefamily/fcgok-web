'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MarketSnapshotPage() {
  const [location, setLocation] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    const trimmed = location.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await fetch('/api/toolkit/market-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: trimmed }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data.snapshot ?? data.content ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function renderMarkdown(text: string) {
    // Minimal markdown-to-HTML: bold, line breaks
    const html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
    return { __html: html };
  }

  return (
    <>
      <div className="portal-header">
        <h1>Market Snapshot Generator</h1>
        <Link href="/portal/toolkit" className="portal-btn portal-btn-ghost">
          &larr; Toolkit
        </Link>
      </div>

      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <span className="portal-card-title">Location</span>
        <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
          <input
            type="text"
            className="filter-search"
            placeholder="Enter an MSA or county name (e.g. Dallas-Fort Worth, Maricopa County)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={loading}
          />
          <button
            className="portal-btn portal-btn-primary"
            onClick={handleGenerate}
            disabled={loading || !location.trim()}
          >
            {loading ? 'Generating...' : 'Generate Snapshot'}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="portal-card"
          style={{ borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '1.5rem' }}
        >
          <p style={{ fontSize: 14, color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            Generating market snapshot for <strong>{location}</strong>. This may take a moment...
          </p>
        </div>
      )}

      {result && !loading && (
        <div className="portal-card">
          <span className="portal-card-title" style={{ marginBottom: '1rem', display: 'block' }}>
            Snapshot Results
          </span>
          <div
            style={{ fontSize: 14, lineHeight: 1.75, color: '#374151' }}
            dangerouslySetInnerHTML={renderMarkdown(result)}
          />
        </div>
      )}
    </>
  );
}
