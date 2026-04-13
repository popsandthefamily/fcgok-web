'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_DESCRIPTIONS, type DocumentType, type PortalDocument } from '@/lib/types/documents';

const DOC_TYPES: DocumentType[] = ['om', 'prospectus', 'pitch_deck'];

export default function BuilderLandingPage() {
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [loading, setLoading] = useState(true);

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
              <Link
                key={doc.id}
                href={`/portal/toolkit/builder/${doc.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  background: 'white',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{doc.deal_name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {DOCUMENT_TYPE_LABELS[doc.type]} · updated {new Date(doc.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <span className={`status-badge status-${doc.status === 'ready' ? 'active' : doc.status === 'generating' ? 'watching' : 'passed'}`}>
                  {doc.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
