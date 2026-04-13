'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PortalDocument, DocumentSection, SectionLayout } from '@/lib/types/documents';
import { DOCUMENT_TYPE_LABELS } from '@/lib/types/documents';
import BlockEditorClient from './BlockEditorClient';

interface OrgBranding {
  name: string;
  logo_url?: string;
  brand_primary?: string;
  brand_secondary?: string;
  tagline?: string;
}

function formatMoney(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatPct(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  return `${n.toFixed(1)}%`;
}

// Detect if content is HTML (contains tags) or markdown
function isHtml(content: string): boolean {
  return /<(p|h[1-6]|ul|ol|li|strong|em|blockquote|a|br|div)[\s>]/i.test(content);
}

// Simple markdown-to-HTML (for legacy content)
function renderMarkdown(text: string): string {
  if (isHtml(text)) return text;

  let html = text.replace(/\r\n/g, '\n');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<![*])\*([^*]+)\*(?![*])/g, '<em>$1</em>');

  // Tables
  html = html.replace(/((?:^\|.+\|\n)+)/gm, (block) => {
    const rows = block.trim().split('\n').map((r) => r.slice(1, -1).split('|').map((c) => c.trim()));
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
      if (block.match(/^<(h\d|ul|ol|table|blockquote)/)) return block;
      if (!block.trim()) return '';
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

export default function DocumentEditor({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [doc, setDoc] = useState<PortalDocument | null>(null);
  const [branding, setBranding] = useState<OrgBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      if (org) setBranding({ name: org.name, ...(org.settings ?? {}) });
    }
    setLoading(false);
  }, [documentId]);

  useEffect(() => { loadDoc(); }, [loadDoc]);

  async function updateDoc(updates: Partial<PortalDocument>) {
    const res = await fetch(`/api/documents/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const { document } = await res.json();
      setDoc(document);
    }
  }

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
      s.id === section.id
        ? { ...s, content: newContent, content_format: 'html' as const, edited: true }
        : s,
    );
    try {
      await updateDoc({ sections: updated });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File, purpose: string): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    const res = await fetch(`/api/documents/${documentId}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Upload failed');
      return null;
    }
    const { url } = await res.json();
    return url;
  }

  async function handleHeroUpload(file: File) {
    setUploadingHero(true);
    const url = await uploadImage(file, 'cover');
    if (url) await updateDoc({ cover_image_url: url });
    setUploadingHero(false);
  }

  async function handleSectionImageUpload(section: DocumentSection, file: File) {
    if (!doc) return;
    setUploadingSectionId(section.id);
    const url = await uploadImage(file, `section-${section.id}`);
    if (url) {
      const updated = doc.sections.map((s) =>
        s.id === section.id
          ? { ...s, image_url: url, image_layout: (s.image_layout ?? 'hero') as SectionLayout }
          : s,
      );
      await updateDoc({ sections: updated });
    }
    setUploadingSectionId(null);
  }

  async function changeSectionLayout(section: DocumentSection, layout: SectionLayout) {
    if (!doc) return;
    const updated = doc.sections.map((s) =>
      s.id === section.id ? { ...s, image_layout: layout } : s,
    );
    await updateDoc({ sections: updated });
  }

  async function removeSectionImage(section: DocumentSection) {
    if (!doc) return;
    const updated = doc.sections.map((s) =>
      s.id === section.id ? { ...s, image_url: undefined, image_layout: 'none' as SectionLayout } : s,
    );
    await updateDoc({ sections: updated });
  }

  function handlePrint() { window.print(); }

  async function handleDelete() {
    if (!doc) return;
    if (!confirm(`Delete "${doc.deal_name}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Delete failed');
      }
      router.push('/portal/toolkit/builder');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(false);
    }
  }

  if (loading) return <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading document...</p>;
  if (!doc) return <p style={{ fontSize: 14, color: '#9ca3af' }}>Document not found.</p>;

  const hasSections = doc.sections.length > 0;
  const primaryColor = branding?.brand_primary ?? '#1a3a2a';
  const accentColor = branding?.brand_secondary ?? '#dbb532';
  const facts = doc.deal_facts;

  // Auto-derive key metrics for cover stat bar
  const metrics = [
    { label: 'Projected IRR', value: formatPct(facts.projected_irr) },
    { label: 'Equity Multiple', value: facts.equity_multiple ? `${facts.equity_multiple}x` : '—' },
    { label: 'Hold Period', value: facts.hold_period_years ? `${facts.hold_period_years} yrs` : '—' },
    { label: 'Min. Investment', value: formatMoney(facts.minimum_investment) },
  ].filter((m) => m.value !== '—');

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { margin: 0; size: letter; }

              /* Hide everything we don't want in the PDF */
              nav, footer, script, aside,
              .portal-sidebar, .portal-header, .no-print {
                display: none !important;
              }

              /* Keep the parent chain visible and reset its styling */
              html, body, main, .portal-layout, .portal-main, .portal-card {
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                color-adjust: exact;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .doc-print-wrapper { display: block !important; }
              .doc-print {
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                background: white !important;
                max-width: 100% !important;
              }
              .doc-cover {
                page-break-after: always;
                break-after: page;
                min-height: 11in !important;
                color-adjust: exact;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .doc-section {
                page-break-inside: avoid;
                break-inside: avoid;
                padding: 0.5in 0.6in !important;
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
              line-height: 1.25;
            }
            .doc-content h1 { font-size: 1.5rem; }
            .doc-content h2 { font-size: 1.25rem; }
            .doc-content h3 {
              font-size: 1rem;
              font-weight: 600;
              margin-top: 1rem;
              color: ${primaryColor};
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .doc-content p { margin: 0.75rem 0; color: #374151; line-height: 1.75; font-size: 14px; }
            .doc-content ul, .doc-content ol { margin: 0.5rem 0 1rem 1.5rem; color: #374151; }
            .doc-content li { margin: 0.3rem 0; line-height: 1.65; }
            .doc-content strong { color: #111827; font-weight: 600; }
            .doc-content blockquote {
              border-left: 3px solid ${accentColor};
              padding: 0.75rem 1.25rem;
              margin: 1.25rem 0;
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 1.15rem;
              font-style: italic;
              color: ${primaryColor};
              background: #fefbf0;
            }
            .doc-content table {
              border-collapse: collapse;
              width: 100%;
              margin: 0.75rem 0;
              font-size: 13px;
            }
            .doc-content th, .doc-content td {
              border: 1px solid #e5e7eb;
              padding: 8px 12px;
              text-align: left;
            }
            .doc-content th {
              background: ${primaryColor};
              color: white;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .doc-content a { color: ${primaryColor}; text-decoration: underline; }
            /* Drop cap on first paragraph of each section */
            .doc-section > .doc-content > p:first-of-type::first-letter {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 3.5rem;
              font-weight: 400;
              float: left;
              line-height: 0.85;
              padding-right: 8px;
              padding-top: 6px;
              color: ${primaryColor};
            }
            /* Inline floated images (text wraps around) */
            .doc-content .inline-img,
            .rich-editor .inline-img {
              display: block;
              max-width: 100%;
              border-radius: 4px;
              margin: 4px 0;
            }
            .doc-content .inline-img-right,
            .rich-editor .inline-img-right {
              float: right;
              width: 40%;
              margin: 6px 0 12px 20px;
            }
            .doc-content .inline-img-left,
            .rich-editor .inline-img-left {
              float: left;
              width: 40%;
              margin: 6px 20px 12px 0;
            }
            .doc-content .inline-img-full,
            .rich-editor .inline-img-full {
              width: 100%;
              float: none;
              margin: 16px 0;
              clear: both;
            }
            .rich-editor .inline-img {
              cursor: pointer;
              outline: 2px solid transparent;
              transition: outline-color 0.15s;
            }
            .rich-editor .inline-img:hover {
              outline-color: ${accentColor};
            }
            /* Icon button style for section toolbars */
            .section-tool-btn {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 5px 10px;
              font-size: 11px;
              font-weight: 500;
              color: #374151;
              background: white;
              border: 1px solid #d1d5db;
              border-radius: 3px;
              cursor: pointer;
              text-decoration: none;
              line-height: 1;
              transition: border-color 0.15s, background 0.15s, color 0.15s;
            }
            .section-tool-btn:hover {
              border-color: ${primaryColor};
              color: ${primaryColor};
              background: #f9fafb;
            }
            .section-tool-btn.is-primary {
              background: ${primaryColor};
              color: white;
              border-color: ${primaryColor};
            }
            .section-tool-btn.is-primary:hover {
              background: ${accentColor};
              color: ${primaryColor};
              border-color: ${accentColor};
            }
            .section-tool-btn.is-danger:hover {
              border-color: #dc2626;
              color: #dc2626;
              background: #fef2f2;
            }
            .section-tool-select {
              padding: 5px 8px;
              font-size: 11px;
              border: 1px solid #d1d5db;
              border-radius: 3px;
              background: white;
              color: #374151;
              cursor: pointer;
            }
            @media print {
              .doc-content .inline-img-right,
              .doc-content .inline-img-left {
                width: 40%;
              }
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
          <button
            className="portal-btn portal-btn-ghost"
            onClick={handleDelete}
            disabled={deleting}
            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
            title="Delete this document"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          {!hasSections || doc.status === 'draft' ? (
            <button className="portal-btn portal-btn-primary" onClick={generateSections} disabled={generating}>
              {generating ? 'Generating...' : hasSections ? 'Regenerate' : 'Generate Sections with AI'}
            </button>
          ) : (
            <>
              <button className="portal-btn portal-btn-ghost" onClick={generateSections} disabled={generating}>
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
            No sections yet. Click <strong>Generate Sections with AI</strong> to create them.
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>
            Uses Groq Llama 3.3 70B. Typically 10-20 seconds.
          </p>
        </div>
      )}

      {generating && (
        <div className="portal-card no-print" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: primaryColor, borderRadius: '50%', animation: 'doc-spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 16 }}>Writing all sections in parallel...</p>
          <style dangerouslySetInnerHTML={{ __html: '@keyframes doc-spin { to { transform: rotate(360deg); } }' }} />
        </div>
      )}

      {hasSections && (
        <div className="doc-print-wrapper">
          <div className="portal-card doc-print" style={{ padding: 0, background: 'white' }}>
            {/* ═════════ COVER PAGE ═════════ */}
            <div
              className="doc-cover"
              style={{
                position: 'relative',
                minHeight: 640,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: 'white',
                padding: '3.5rem 3rem',
                backgroundColor: primaryColor,
                backgroundImage: doc.cover_image_url
                  ? `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.6) 50%, ${primaryColor}ee 100%), url("${doc.cover_image_url}")`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderBottom: `4px solid ${accentColor}`,
              }}
            >
              {/* Hero upload button (not shown in print) */}
              <div className="no-print" style={{ position: 'absolute', top: 12, right: 12 }}>
                <label
                  className="portal-btn portal-btn-ghost"
                  style={{
                    cursor: uploadingHero ? 'wait' : 'pointer',
                    fontSize: 11,
                    padding: '4px 10px',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#111827',
                    border: 'none',
                  }}
                >
                  {uploadingHero ? 'Uploading...' : doc.cover_image_url ? 'Replace Hero' : '+ Hero Image'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHeroUpload(file);
                    }}
                  />
                </label>
              </div>

              {/* Top: logo + category */}
              <div>
                {branding?.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={branding.logo_url}
                    alt={branding.name}
                    style={{ height: 48, width: 'auto', marginBottom: 32, filter: 'brightness(0) invert(1)' }}
                  />
                )}
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: accentColor, marginBottom: 12, fontWeight: 600 }}>
                  {DOCUMENT_TYPE_LABELS[doc.type]} &middot; {doc.type === 'om' ? 'Strictly Confidential' : 'For Discussion'}
                </div>
              </div>

              {/* Middle: title block */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 0' }}>
                <h1
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                    fontWeight: 400,
                    margin: 0,
                    lineHeight: 1.1,
                    color: 'white',
                    textShadow: doc.cover_image_url ? '0 2px 12px rgba(0,0,0,0.5)' : 'none',
                  }}
                >
                  {doc.deal_name}
                </h1>
                {(facts.city || facts.state) && (
                  <div style={{ fontSize: 18, marginTop: 14, opacity: 0.9, fontWeight: 500 }}>
                    {[facts.city, facts.state].filter(Boolean).join(', ')}
                    {facts.msa && facts.msa !== `${facts.city}-${facts.state}` && ` · ${facts.msa}`}
                  </div>
                )}
                {facts.asset_class && (
                  <div style={{ fontSize: 13, marginTop: 4, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {facts.asset_class}
                    {facts.property_type && ` · ${facts.property_type}`}
                  </div>
                )}
              </div>

              {/* Stats panel */}
              {metrics.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${metrics.length}, 1fr)`,
                    gap: 1,
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    marginBottom: 32,
                  }}
                >
                  {metrics.map((m) => (
                    <div
                      key={m.label}
                      style={{
                        background: 'rgba(0,0,0,0.35)',
                        padding: '1rem 1.25rem',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: 4, fontWeight: 600 }}>
                        {m.label}
                      </div>
                      <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, color: 'white', lineHeight: 1 }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer: sponsor + date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{branding?.name ?? 'Frontier Intelligence'}</div>
                  {branding?.tagline && <div style={{ opacity: 0.7 }}>{branding.tagline}</div>}
                </div>
                <div style={{ opacity: 0.7, textAlign: 'right' }}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* ═════════ SECTIONS ═════════ */}
            <div>
              {doc.sections.map((section, idx) => {
                const layout = section.image_layout ?? 'hero';
                const showImage = section.image_url && layout !== 'none';
                const isSide = layout === 'side-left' || layout === 'side-right';

                return (
                  <div
                    key={section.id}
                    className="doc-section"
                    style={{ padding: '3rem 3rem 2rem', borderBottom: idx < doc.sections.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  >
                    {/* Hero image layout */}
                    {showImage && layout === 'hero' && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={section.image_url}
                        alt={section.title}
                        style={{
                          width: '100%',
                          height: 280,
                          objectFit: 'cover',
                          borderRadius: 4,
                          marginBottom: 24,
                          display: 'block',
                        }}
                      />
                    )}

                    {/* Section header with number badge */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '1rem',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                        <div
                          style={{
                            fontFamily: 'Playfair Display, Georgia, serif',
                            fontSize: 14,
                            color: accentColor,
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                          }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <h2
                          style={{
                            fontFamily: 'Playfair Display, Georgia, serif',
                            fontSize: '1.6rem',
                            fontWeight: 400,
                            color: primaryColor,
                            margin: 0,
                          }}
                        >
                          {section.title}
                        </h2>
                      </div>

                      <div className="no-print" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {section.edited && (
                          <span style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>
                            edited
                          </span>
                        )}
                        <label
                          className="section-tool-btn"
                          style={{ cursor: uploadingSectionId === section.id ? 'wait' : 'pointer' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                          {uploadingSectionId === section.id
                            ? 'Uploading…'
                            : section.image_url
                            ? 'Replace'
                            : 'Add Image'}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSectionImageUpload(section, file);
                            }}
                          />
                        </label>
                        {section.image_url && (
                          <>
                            <select
                              className="section-tool-select"
                              value={layout}
                              onChange={(e) => changeSectionLayout(section, e.target.value as SectionLayout)}
                              title="Image layout"
                            >
                              <option value="hero">Hero (full)</option>
                              <option value="side-left">Side left</option>
                              <option value="side-right">Side right</option>
                            </select>
                            <button
                              className="section-tool-btn is-danger"
                              onClick={() => removeSectionImage(section)}
                              title="Remove image"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              </svg>
                            </button>
                          </>
                        )}
                        <button
                          className={`section-tool-btn${editingId === section.id ? '' : ' is-primary'}`}
                          onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                        >
                          {editingId === section.id ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18" />
                                <path d="M6 6l12 12" />
                              </svg>
                              Cancel
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        height: 3,
                        background: accentColor,
                        width: 48,
                        marginBottom: 18,
                      }}
                    />

                    {/* Content (with optional side layout) */}
                    {editingId === section.id ? (
                      <BlockEditorClient
                        initialContent={section.content}
                        initialFormat={section.content_format ?? 'markdown'}
                        documentId={documentId}
                        primaryColor={primaryColor}
                        onSave={(html) => saveSection(section, html)}
                        onCancel={() => setEditingId(null)}
                        saving={saving}
                      />
                    ) : (
                      <div
                        style={
                          isSide && showImage
                            ? {
                                display: 'grid',
                                gridTemplateColumns: layout === 'side-left' ? '260px 1fr' : '1fr 260px',
                                gap: '1.5rem',
                                alignItems: 'start',
                              }
                            : undefined
                        }
                      >
                        {isSide && showImage && layout === 'side-left' && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={section.image_url} alt={section.title} style={{ width: '100%', borderRadius: 4 }} />
                        )}
                        <div
                          className="doc-content"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
                        />
                        {isSide && showImage && layout === 'side-right' && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={section.image_url} alt={section.title} style={{ width: '100%', borderRadius: 4 }} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Footer */}
              <div
                style={{
                  padding: '1.5rem 3rem 2rem',
                  borderTop: `2px solid ${primaryColor}`,
                  background: '#fafafa',
                  textAlign: 'center',
                  fontSize: 10,
                  color: '#6b7280',
                  lineHeight: 1.7,
                }}
              >
                <div style={{ fontWeight: 600, color: primaryColor, marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {branding?.name ?? 'Frontier Intelligence'}
                </div>
                {branding?.tagline && <div>{branding.tagline}</div>}
                <div style={{ marginTop: 6 }}>
                  Strictly confidential. This document does not constitute an offer to sell or solicitation of an offer to buy any securities.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
