'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BuggyWheel from '@/components/BuggyWheel';
import type { SnapshotScores } from '@/lib/ai/generate-snapshot';
import { renderSafeMarkdown } from '@/lib/utils/render-markdown';

const ASSET_TYPES = [
  { value: '', label: 'Auto (from org settings)' },
  { value: 'self-storage', label: 'Self-Storage' },
  { value: 'multi-family', label: 'Multi-Family' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'retail', label: 'Retail' },
  { value: 'office', label: 'Office' },
  { value: 'hospitality', label: 'Hospitality / STR' },
  { value: 'mixed', label: 'Mixed / Multi-Asset' },
];

const SCORE_LABELS: Record<keyof SnapshotScores, string> = {
  population_momentum: 'Population Momentum',
  supply_demand_gap: 'Supply / Demand Gap',
  barrier_to_entry: 'Barrier to Entry',
  economic_diversity: 'Economic Diversity',
  competitive_saturation: 'Low Saturation',
  infrastructure_access: 'Infrastructure',
};

function scoreColor(n: number): string {
  if (n >= 70) return '#16a34a';
  if (n >= 50) return '#ca8a04';
  return '#dc2626';
}

function verdictColor(composite: number): string {
  if (composite >= 70) return '#166534';
  if (composite >= 50) return '#854d0e';
  return '#991b1b';
}

interface OrgBranding {
  name: string;
  logo_url?: string;
  brand_primary?: string;
  brand_secondary?: string;
  tagline?: string;
}

interface SnapshotData {
  scores: SnapshotScores;
  composite: number;
  verdict: string;
  narrative: string;
}

export default function MarketSnapshotPage() {
  const [location, setLocation] = useState('');
  const [assetType, setAssetType] = useState('');
  const [keywordsRaw, setKeywordsRaw] = useState('');
  const [result, setResult] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [branding, setBranding] = useState<OrgBranding | null>(null);

  useEffect(() => {
    async function loadBranding() {
      // /api/profile uses the service client so RLS doesn't swallow the
      // join into organizations. The previous direct browser-client query
      // hit RLS and silently returned no org, leaving the uploaded logo
      // invisible on the snapshot.
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const { profile } = await res.json();
        const org = profile?.organizations;
        if (org) setBranding({ name: org.name, ...(org.settings ?? {}) });
      } catch {
        /* no-op — snapshot renders without branding */
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
    setResult(null);
    setElapsed(0);

    const keywords = keywordsRaw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/toolkit/market-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: trimmed,
          assetType: assetType || undefined,
          keywords: keywords.length ? keywords : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
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
            /* Keep the FI outro with the content that precedes it so it
               lands at the bottom of the last content page instead of
               bleeding onto a blank final sheet. */
            .snapshot-fi-outro {
              page-break-before: avoid;
              break-before: avoid;
              page-break-inside: avoid;
              break-inside: avoid;
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

      {/* Inputs */}
      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <span className="portal-card-title">Parameters</span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12, marginTop: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Region
            </label>
            <input
              type="text"
              className="filter-search"
              placeholder="MSA, county, or city (e.g. Sherman, TX)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              disabled={loading}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Asset Type
            </label>
            <select
              className="filter-search"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              disabled={loading}
              style={{ width: '100%', height: 38 }}
            >
              {ASSET_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Focus Keywords <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional, comma-separated)</span>
          </label>
          <input
            type="text"
            className="filter-search"
            placeholder="e.g. cabin STR, Class A, opportunity zone"
            value={keywordsRaw}
            onChange={(e) => setKeywordsRaw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={loading}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button
            className="portal-btn portal-btn-primary"
            onClick={handleGenerate}
            disabled={loading || !location.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            {loading ? `Generating (${elapsed}s)` : 'Generate Snapshot'}
          </button>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            Groq Llama 3.3 70B · typically 5–15 seconds · cross-references your intel feed
          </span>
        </div>
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
            Analyzing <strong>{location}</strong>{assetType ? ` · ${assetType}` : ''}...
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            Scoring viability, cross-referencing intel, and building the market snapshot
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
                  Market Snapshot{assetType ? ` · ${assetType}` : ''}
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

            {/* Viability Scorecard */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: '1.5rem',
              marginBottom: 32,
              padding: '1.5rem',
              background: '#fafaf8',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  fontSize: 42,
                  fontWeight: 700,
                  fontFamily: 'Playfair Display, Georgia, serif',
                  color: verdictColor(result.composite),
                  lineHeight: 1,
                }}>
                  {result.composite}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                  / 100
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: verdictColor(result.composite),
                  marginTop: 8,
                  textAlign: 'center',
                }}>
                  {result.verdict}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.entries(result.scores) as [keyof SnapshotScores, number][]).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 130, fontSize: 11, color: '#6b7280', flexShrink: 0 }}>
                      {SCORE_LABELS[key]}
                    </div>
                    <div style={{ flex: 1, height: 10, background: '#e5e7eb', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{
                        width: `${value}%`,
                        height: '100%',
                        background: scoreColor(value),
                        borderRadius: 5,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ width: 28, fontSize: 12, fontWeight: 600, color: scoreColor(value), textAlign: 'right' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Narrative */}
            <div
              className="snapshot-content"
              style={{ fontSize: 14, lineHeight: 1.7, color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(result.narrative) }}
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

            {/* FI brand stamp at the very end of the document — compact
                so it sits under the last content, not a full-page sheet. */}
            <div
              className="snapshot-fi-outro"
              style={{
                marginTop: 24,
                paddingTop: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                color: '#6b7280',
              }}
            >
              <BuggyWheel size={18} style={{ color: primaryColor }} />
              <span style={{ fontWeight: 600, color: '#111827', fontSize: 12 }}>
                Frontier Intelligence
              </span>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>· fcgok.com</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
