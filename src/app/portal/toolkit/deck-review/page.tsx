'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DeckReviewPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleReview() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await fetch('/api/toolkit/deck-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data.content ?? data.review ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function renderMarkdown(md: string) {
    const html = md
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
    return { __html: html };
  }

  return (
    <>
      <div className="portal-header">
        <h1>Pitch Deck Review</h1>
        <Link href="/portal/toolkit" className="portal-btn portal-btn-ghost">
          &larr; Toolkit
        </Link>
      </div>

      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <span className="portal-card-title" style={{ display: 'block', marginBottom: '0.75rem' }}>
          Deck Content
        </span>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.6 }}>
          Paste the text content of your pitch deck below. The AI will analyze it for
          stale data points, missing elements, and areas for improvement.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your pitch deck text here..."
          style={{
            width: '100%',
            minHeight: 280,
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            fontSize: 13,
            lineHeight: 1.65,
            fontFamily: 'inherit',
            resize: 'vertical',
            color: '#374151',
          }}
          disabled={loading}
        />
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="portal-btn portal-btn-primary"
            onClick={handleReview}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Reviewing...' : 'Review Deck'}
          </button>
          {text.trim() && (
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              {text.trim().split(/\s+/).length} words
            </span>
          )}
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
            Analyzing your pitch deck. This may take a moment...
          </p>
        </div>
      )}

      {result && !loading && (
        <div className="portal-card">
          <span className="portal-card-title" style={{ marginBottom: '1rem', display: 'block' }}>
            AI Review
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
