'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { PortalDocument, DocumentSection } from '@/lib/types/documents';
import { DOCUMENT_TYPE_LABELS } from '@/lib/types/documents';

interface OrgBranding {
  name: string;
  logo_url?: string;
  brand_primary?: string;
  brand_secondary?: string;
  tagline?: string;
}

// Simple markdown renderer (same pattern as market snapshot)
function renderMarkdown(text: string): string {
  let html = text.replace(/\r\n/g, '\n');

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<![*])\*([^*]+)\*(?![*])/g, '<em>$1</em>');

  // Tables (simple pipe-delimited)
  html = html.replace(/((?:^\|.+\|\n)+)/gm, (block) => {
    const rows = block.trim().split('\n').map((r) =>
      r.slice(1, -1).split('|').map((c) => c.trim()),
    );
    if (rows.length < 2) return block;
    const [header, sep, ...body] = rows;
    if (!sep.every((c) => /^-+$/.test(c))) return block;
    return `<table><thead><tr>${header.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${body
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`;
  });

  html = html.replace(/(^[-*] .+(\n[-*] .+)*)/gm, (block) => {
    const items = block.split('\n').map((l) => l.replace(/^[-*]\s+/, '').trim());
    return '<ul>' + items.map((i) => `<li>${i}</li>`).join('') + '</ul>';
  });

  html = html.replace(/(^\d+\. .+(\n\d+\. .+)*)/gm, (block) => {
    const items = block.split('\n').map((l) => l.replace(/^\d+\.\s+/, '').trim());
    return '<ol>' + items.map((i) => `<li>${i}</li>`).join('') + '</ol>';
  });

  html = html
    .split(/\n\n+/)
    .map((block) => {
      if (block.match(/^<(h\d|ul|ol|table)/)) return block;
      if (!block.trim()) return '';
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

export default function DocumentEditor({ documentId }: { documentId: string }) {
  const [doc, setDoc] = useState<PortalDocument | null>(null);
  const [branding, setBranding] = useState<OrgBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadDoc = useCallback(async () => {
    const [docRes, profRes] = await Promise.all([
      fetch(`/api/documents/${documentId}`),
      fetch('/api/profile'),
    ]);

    if (docRes.ok) {
      const { document } = await docRes.json();
      setDoc(document);
    }
    if (profRes.ok) {
      const { profile } = await profRes.json();
      const org = profile?.organizations;
      if (org) {
        setBranding({ name: org.name, ...(org.settings ?? {}) });
      }
    }
    setLoading(false);
  }, [documentId]);

  useEffect(() => {
    loadDoc();
  }, [loadDoc]);

  async function generateSections() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`/api/documents/${documentId}/generate`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Generation failed');
      }
      await loadDoc();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function saveSection(section: DocumentSection, newContent: string) {
    if (!doc) return;
    setSaving(true);
    const updated = doc.sections.map((s) =>
      s.id === section.id ? { ...s, content: newContent, edited: true } : s,
    );
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: updated }),
      });
      if (res.ok) {
        setDoc({ ...doc, sections: updated });
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading document...</p>;
  }

  if (!doc) {
    return <p style={{ fontSize: 14, color: '#9ca3af' }}>Document not found.</p>;
  }

  const hasSections = doc.sections.length > 0;
  const primaryColor = branding?.brand_primary ?? '#1a3a2a';
  const accentColor = branding?.brand_secondary ?? '#dbb532';
  const facts = doc.deal_facts;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { margin: 0.75in 0.65in; size: letter; }
              html, body { background: white !important; }
              body > *:not(.doc-print-wrapper),
              .portal-sidebar,
              .portal-header,
              .no-print,
              .portal-main > *:not(.doc-print-wrapper) {
                display: none !important;
              }
              .portal-layout { display: block !important; }
              .portal-main { padding: 0 !important; background: white !important; display: block !important; }
              .doc-print-wrapper { display: block !important; }
              .doc-print {
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                background: white !important;
                max-width: 100% !important;
              }
              .doc-section {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .doc-section + .doc-section {
                page-break-before: auto;
              }
              .doc-cover {
                page-break-after: always;
                break-after: page;
                min-height: 8.5in;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
              .doc-content h1, .doc-content h2, .doc-content h3 {
                page-break-after: avoid;
              }
              .doc-content p, .doc-content li {
                orphans: 3;
                widows: 3;
              }
            }
            .doc-content h1, .doc-content h2 {
              font-family: 'Playfair Display', Georgia, serif;
              color: ${primaryColor};
              margin-top: 1.25rem;
              margin-bottom: 0.5rem;
              line-height: 1.3;
            }
            .doc-content h1 { font-size: 1.5rem; }
            .doc-content h2 { font-size: 1.2rem; }
            .doc-content h3 { font-size: 1rem; font-weight: 600; margin-top: 0.75rem; color: ${primaryColor}; }
            .doc-content p { margin: 0.5rem 0; color: #374151; line-height: 1.7; }
            .doc-content ul, .doc-content ol { margin: 0.5rem 0 0.75rem 1.5rem; color: #374151; }
            .doc-content li { margin: 0.2rem 0; line-height: 1.55; }
            .doc-content strong { color: #111827; font-weight: 600; }
            .doc-content table {
              border-collapse: collapse;
              width: 100%;
              margin: 0.75rem 0;
              font-size: 13px;
            }
            .doc-content th, .doc-content td {
              border: 1px solid #e5e7eb;
              padding: 6px 10px;
              text-align: left;
            }
            .doc-content th {
              background: #f9fafb;
              font-weight: 600;
              color: ${primaryColor};
            }
          `,
        }}
      />

      <div className="portal-header no-print">
        <h1>{doc.deal_name}</h1>
        <Link href="/portal/toolkit/builder" className="portal-btn portal-btn-ghost">&larr; Builder</Link>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {DOCUMENT_TYPE_LABELS[doc.type]} &middot; {doc.sections.length} sections &middot;
        </span>
        <span className={`status-badge status-${doc.status === 'ready' ? 'active' : doc.status === 'generating' ? 'watching' : 'passed'}`}>
          {doc.status}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {!hasSections || doc.status === 'draft' ? (
            <button
              className="portal-btn portal-btn-primary"
              onClick={generateSections}
              disabled={generating}
            >
              {generating ? 'Generating sections...' : hasSections ? 'Regenerate Sections' : 'Generate Sections with AI'}
            </button>
          ) : (
            <>
              <button
                className="portal-btn portal-btn-ghost"
                onClick={generateSections}
                disabled={generating}
              >
                {generating ? 'Regenerating...' : 'Regenerate'}
              </button>
              <button className="portal-btn portal-btn-primary" onClick={handlePrint}>
                Print / Save as PDF
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="portal-card no-print" style={{ borderColor: '#fca5a5', background: '#fef2f2', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      {!hasSections && !generating && (
        <div className="portal-card no-print" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>
            No sections yet. Click <strong>Generate Sections with AI</strong> to create them from your deal facts.
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>
            Uses Groq Llama 3.3 70B. Typically takes 10-20 seconds.
          </p>
        </div>
      )}

      {generating && (
        <div className="portal-card no-print" style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            style={{
              display: 'inline-block',
              width: 32,
              height: 32,
              border: '3px solid #e5e7eb',
              borderTopColor: primaryColor,
              borderRadius: '50%',
              animation: 'doc-spin 1s linear infinite',
            }}
          />
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 16 }}>
            Writing all sections in parallel...
          </p>
          <style dangerouslySetInnerHTML={{ __html: '@keyframes doc-spin { to { transform: rotate(360deg); } }' }} />
        </div>
      )}

      {/* Document preview */}
      {hasSections && (
        <div className="doc-print-wrapper">
          <div className="portal-card doc-print" style={{ padding: 0, background: 'white' }}>
            {/* Cover Page */}
            <div
              className="doc-cover"
              style={{
                padding: '3.5rem 3rem',
                background: primaryColor,
                color: 'white',
                minHeight: 600,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderBottom: `4px solid ${accentColor}`,
              }}
            >
              <div>
                {branding?.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={branding.logo_url} alt={branding.name} style={{ height: 56, width: 'auto', marginBottom: 40, filter: 'brightness(0) invert(1)' }} />
                )}
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: accentColor, marginBottom: 16 }}>
                  {DOCUMENT_TYPE_LABELS[doc.type]} &middot; {doc.type === 'om' ? 'Confidential' : 'For Discussion'}
                </div>
                <h1
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '2.8rem',
                    fontWeight: 400,
                    margin: 0,
                    lineHeight: 1.15,
                    color: 'white',
                  }}
                >
                  {doc.deal_name}
                </h1>
                {(facts.city || facts.state) && (
                  <div style={{ fontSize: 18, marginTop: 12, opacity: 0.8 }}>
                    {[facts.city, facts.state].filter(Boolean).join(', ')}
                  </div>
                )}
                {facts.asset_class && (
                  <div style={{ fontSize: 14, marginTop: 4, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {facts.asset_class}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{branding?.name ?? 'Frontier Intelligence'}</div>
                  {branding?.tagline && <div style={{ opacity: 0.7 }}>{branding.tagline}</div>}
                </div>
                <div style={{ opacity: 0.7, textAlign: 'right' }}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Sections */}
            <div style={{ padding: '2.5rem 3rem' }}>
              {doc.sections.map((section) => (
                <div key={section.id} className="doc-section" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem', borderBottom: `2px solid ${accentColor}`, paddingBottom: 6 }}>
                    <h2
                      style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '1.5rem',
                        fontWeight: 400,
                        color: primaryColor,
                        margin: 0,
                      }}
                    >
                      {section.title}
                    </h2>
                    {section.edited && (
                      <span className="no-print" style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>edited</span>
                    )}
                    <button
                      className="no-print"
                      onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                      style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >
                      {editingId === section.id ? 'cancel' : 'edit'}
                    </button>
                  </div>

                  {editingId === section.id ? (
                    <SectionEditor
                      section={section}
                      onSave={(content) => saveSection(section, content)}
                      saving={saving}
                    />
                  ) : (
                    <div
                      className="doc-content"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
                    />
                  )}
                </div>
              ))}

              <div
                style={{
                  marginTop: 32,
                  paddingTop: 16,
                  borderTop: '1px solid #e5e7eb',
                  fontSize: 10,
                  color: '#9ca3af',
                  textAlign: 'center',
                }}
              >
                {branding?.name ?? 'Frontier Intelligence'} &middot; Confidential &middot; Not an offer to sell securities
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SectionEditor({
  section,
  onSave,
  saving,
}: {
  section: DocumentSection;
  onSave: (content: string) => void;
  saving: boolean;
}) {
  const [content, setContent] = useState(section.content);

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: 4,
          fontSize: 13,
          fontFamily: 'inherit',
          lineHeight: 1.6,
          resize: 'vertical',
          marginBottom: 8,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          className="portal-btn portal-btn-primary"
          onClick={() => onSave(content)}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
