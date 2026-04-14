'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BuggyWheel from '@/components/BuggyWheel';

interface OrgBranding {
  name: string;
  logo_url?: string;
  brand_primary?: string;
  brand_secondary?: string;
  tagline?: string;
}

function renderMarkdown(text: string): string {
  // Normalize line endings
  let html = text.replace(/\r\n/g, '\n');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold + italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<![*])\*([^*]+)\*(?![*])/g, '<em>$1</em>');

  // Bullet lists — group consecutive lines starting with - or *
  html = html.replace(/(^[-*] .+(\n[-*] .+)*)/gm, (block) => {
    const items = block.split('\n').map((l) => l.replace(/^[-*]\s+/, '').trim());
    return '<ul>' + items.map((i) => `<li>${i}</li>`).join('') + '</ul>';
  });

  // Numbered lists
  html = html.replace(/(^\d+\. .+(\n\d+\. .+)*)/gm, (block) => {
    const items = block.split('\n').map((l) => l.replace(/^\d+\.\s+/, '').trim());
    return '<ol>' + items.map((i) => `<li>${i}</li>`).join('') + '</ol>';
  });

  // Paragraphs — double newlines become paragraph breaks
  html = html
    .split(/\n\n+/)
    .map((block) => {
      if (block.match(/^<(h\d|ul|ol)/)) return block;
      if (!block.trim()) return '';
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

export default function MarketSnapshotPage() {
  const [location, setLocation] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [branding, setBranding] = useState<OrgBranding | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function loadBranding() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organizations(*)')
        .eq('id', user.id)
        .single();
      const orgRaw = profile?.organizations as unknown;
      const org = orgRaw as { name: string; settings?: OrgBranding } | null;
      if (org) {
        setBranding({ name: org.name, ...(org.settings ?? {}) });
      }
    }
    loadBranding();
  }, []);

  useEffect(() => {
    if (!loading) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleGenerate() {
    const trimmed = location.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult('');
    setElapsed(0);

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
      setResult(data.snapshot ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const primaryColor = branding?.brand_primary ?? '#1a3a2a';
  const accentColor = branding?.brand_secondary ?? '#dbb532';

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page { margin: 0.75in 0.65in; size: letter; }
            html, body { background: white !important; }
            /* Hide everything via visibility so ancestors of the print wrapper
               don't collapse it. Then re-show the wrapper + its descendants. */
            body * { visibility: hidden !important; }
            .snapshot-print-wrapper,
            .snapshot-print-wrapper * { visibility: visible !important; }
            .snapshot-print-wrapper .no-print { display: none !important; }
            .snapshot-print-wrapper {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }
            .snapshot-print {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              background: white !important;
              max-width: 100% !important;
              margin: 0 !important;
            }
            .snapshot-print h1, .snapshot-print h2, .snapshot-print h3 {
              page-break-after: avoid;
              break-after: avoid;
            }
            .snapshot-print p, .snapshot-print li {
              orphans: 3;
              widows: 3;
            }
            .snapshot-print .snapshot-header {
              page-break-after: avoid;
              break-after: avoid;
            }
          }
          .snapshot-content h1, .snapshot-content h2 {
            font-family: 'Playfair Display', Georgia, serif;
            color: ${primaryColor};
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            line-height: 1.3;
          }
          .snapshot-content h1 { font-size: 1.75rem; border-bottom: 2px solid ${accentColor}; padding-bottom: 6px; }
          .snapshot-content h2 { font-size: 1.25rem; }
          .snapshot-content h3 { font-size: 1.05rem; font-weight: 600; margin-top: 1rem; color: ${primaryColor}; }
          .snapshot-content p { margin: 0.65rem 0; color: #374151; line-height: 1.7; }
          .snapshot-content ul, .snapshot-content ol { margin: 0.5rem 0 0.75rem 1.5rem; color: #374151; }
          .snapshot-content li { margin: 0.25rem 0; line-height: 1.6; }
          .snapshot-content strong { color: #111827; font-weight: 600; }
        `,
      }} />

      <div className="portal-header">
        <h1>Market Snapshot Generator</h1>
        <Link href="/portal" className="portal-btn portal-btn-ghost">&larr; Dashboard</Link>
      </div>

      {/* Input */}
      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <span className="portal-card-title">Location</span>
        <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
          <input
            type="text"
            className="filter-search"
            placeholder="Enter an MSA, county, or city (e.g. Sherman, TX)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={loading}
          />
          <button
            className="portal-btn portal-btn-primary"
            onClick={handleGenerate}
            disabled={loading || !location.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            {loading ? `Generating (${elapsed}s)` : 'Generate Snapshot'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: '0.75rem' }}>
          Using Groq Llama 3.3 70B for fast generation (typically 5-15 seconds). Cross-references recent intel from this market.
        </p>
      </div>

      {error && (
        <div className="portal-card" style={{ borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      {loading && !result && (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BuggyWheel spinning size={44} style={{ color: primaryColor }} />
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 16 }}>
            Analyzing <strong>{location}</strong>...
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            Cross-referencing intel and building the market snapshot
          </p>
        </div>
      )}

      {result && !loading && (
        <div className="snapshot-print-wrapper">
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }} className="no-print">
            <button className="portal-btn portal-btn-ghost" onClick={handlePrint}>
              Print / Save as PDF
            </button>
          </div>

          <div className="portal-card snapshot-print" style={{ padding: '2.5rem 3rem', background: 'white' }}>
            {/* Branded header */}
            <div className="snapshot-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: `3px solid ${accentColor}`,
              paddingBottom: 20,
              marginBottom: 24,
            }}>
              <div>
                {branding?.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={branding.logo_url}
                    alt={branding.name}
                    style={{ height: 48, width: 'auto', marginBottom: 12 }}
                  />
                )}
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280' }}>
                  Market Snapshot
                </div>
                <h1 style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '1.9rem',
                  color: primaryColor,
                  margin: '4px 0 0',
                  fontWeight: 400,
                }}>
                  {location}
                </h1>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#6b7280' }}>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>
                  {branding?.name ?? 'Frontier Intelligence'}
                </div>
                {branding?.tagline && (
                  <div style={{ marginTop: 2 }}>{branding.tagline}</div>
                )}
                <div style={{ marginTop: 8 }}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            <div
              className="snapshot-content"
              style={{ fontSize: 14, lineHeight: 1.7, color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }}
            />

            <div style={{
              marginTop: 32,
              paddingTop: 16,
              borderTop: '1px solid #e5e7eb',
              fontSize: 10,
              color: '#9ca3af',
              textAlign: 'center',
            }}>
              Generated by Frontier Intelligence · AI-assisted market analysis · Not investment advice
            </div>
          </div>
        </div>
      )}
    </>
  );
}
