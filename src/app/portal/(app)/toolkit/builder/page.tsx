'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_DESCRIPTIONS, type DocumentType, type PortalDocument } from '@/lib/types/documents';

const DOC_TYPES: DocumentType[] = ['om', 'prospectus', 'pitch_deck'];

export default function BuilderLandingPage() {
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        setDocuments(data.documents ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(e: React.MouseEvent, doc: PortalDocument) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${doc.deal_name}"? This can't be undone.`)) return;
    setDeletingId(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="portal-header">
        <h1>Document Builder</h1>
        <Link href="/portal/toolkit" className="portal-btn portal-btn-ghost">&larr; Toolkit</Link>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Create branded Offering Memoranda, Prospectuses, and Pitch Decks. AI generates
        each section from your deal facts; you edit, then export to PDF.
      </p>

      {/* New document cards */}
      <div className="portal-card" style={{ marginBottom: '2rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Create New</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {DOC_TYPES.map((type) => (
            <Link
              key={type}
              href={`/portal/toolkit/builder/new?type=${type}`}
              style={{
                display: 'block',
                padding: '1.25rem',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                background: 'white',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 6 }}>
                {type === 'om' ? 'Long form' : type === 'prospectus' ? 'Concise' : 'Visual'}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 400, marginBottom: 6 }}>
                {DOCUMENT_TYPE_LABELS[type]}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                {DOCUMENT_TYPE_DESCRIPTIONS[type]}
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: '#1a3a2a', fontWeight: 500 }}>
                Start &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Existing documents */}
      <div className="portal-card">
        <div className="portal-card-header">
          <span className="portal-card-title">Your Documents</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{documents.length}</span>
        </div>

        {loading ? (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>Loading...</p>
        ) : documents.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>No documents yet. Create your first one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="doc-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  background: 'white',
                  position: 'relative',
                }}
              >
                <Link
                  href={`/portal/toolkit/builder/${doc.id}`}
                  style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{doc.deal_name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {DOCUMENT_TYPE_LABELS[doc.type]} · updated {new Date(doc.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className={`status-badge status-${doc.status === 'ready' ? 'active' : doc.status === 'generating' ? 'watching' : 'passed'}`}>
                    {doc.status}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, doc)}
                    disabled={deletingId === doc.id}
                    title="Delete document"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: deletingId === doc.id ? 'wait' : 'pointer',
                      padding: 6,
                      color: '#9ca3af',
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: 3,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#dc2626';
                      e.currentTarget.style.background = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af';
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
