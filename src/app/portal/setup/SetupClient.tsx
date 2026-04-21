'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  INDUSTRY_PRESETS,
  defaultConfigForIndustry,
  type Industry,
  type OrgConfig,
  type PrimaryRole,
} from '@/lib/config/industries';
import type { Organization } from '@/lib/types';

const INDUSTRIES: Industry[] = [
  'self-storage',
  'multi-family',
  'industrial',
  'retail',
  'office',
  'hospitality',
  'mixed',
];

const ROLES: { value: PrimaryRole; label: string; description: string }[] = [
  { value: 'developer', label: 'Developer', description: 'Ground-up and value-add development projects' },
  { value: 'operator', label: 'Operator', description: 'Acquire, operate, and manage existing properties' },
  { value: 'investor', label: 'Investor', description: 'Deploy capital as LP or equity into deals' },
  { value: 'broker', label: 'Broker', description: 'Transaction advisory and deal sourcing' },
  { value: 'lender', label: 'Lender', description: 'Provide debt or mezzanine financing' },
  { value: 'consultant', label: 'Consultant', description: 'Advisory, capital introduction, or strategy' },
];

type Step = 1 | 2 | 3 | 4 | 5;

interface SetupClientProps {
  org: Organization;
}

export default function SetupClient({ org }: SetupClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>(1);

  const initialSettings = (org.settings ?? {}) as Partial<OrgConfig>;
  const initialIndustry = (initialSettings.industry as Industry | undefined) ?? 'self-storage';
  const initialRole = (initialSettings.primary_role as PrimaryRole | undefined) ?? 'developer';

  const [orgName, setOrgName] = useState(org.name ?? '');
  const [industry, setIndustry] = useState<Industry>(initialIndustry);
  const [role, setRole] = useState<PrimaryRole>(initialRole);
  const [config, setConfig] = useState<OrgConfig>(
    initialSettings.industry
      ? ({ ...defaultConfigForIndustry(initialIndustry, initialRole), ...initialSettings, onboarding_completed: false } as OrgConfig)
      : defaultConfigForIndustry(initialIndustry, initialRole),
  );

  function pickIndustry(i: Industry) {
    setIndustry(i);
    setConfig(defaultConfigForIndustry(i, role));
  }

  function pickRole(r: PrimaryRole) {
    setRole(r);
    setConfig({ ...config, primary_role: r });
  }

  function toggleSource(key: keyof OrgConfig['sources']) {
    setConfig({
      ...config,
      sources: { ...config.sources, [key]: !config.sources[key] },
    });
  }

  function updateKeywords(text: string) {
    const keywords = text.split(/[\n,]/).map((k) => k.trim()).filter(Boolean);
    setConfig({ ...config, intel: { ...config.intel, keywords } });
  }

  function updateCompanies(text: string) {
    const companies = text.split(/\n/).map((k) => k.trim()).filter(Boolean);
    setConfig({ ...config, intel: { ...config.intel, target_companies: companies } });
  }

  async function finish() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/setup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, orgName }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save setup');
      }
      router.push('/portal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1f17', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#f4f1ea' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.8rem',
            fontWeight: 400,
            marginBottom: 8,
          }}>
            Configure your intelligence instance
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(244,241,234,0.6)' }}>
            Tell us about your business so we can pull the right data. Step {step} of 5
          </p>

          {/* Progress bar */}
          <div style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            marginTop: 16,
          }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: n <= step ? '#dbb532' : 'rgba(244,241,234,0.15)',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 8, padding: '2.5rem' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: 4, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Step 1: Company & Industry */}
          {step === 1 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: 4 }}>
                Welcome to Frontier Intelligence
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                First, what's your company and what kind of real estate do you focus on?
              </p>

              <Label>Company Name</Label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="720 Companies LP"
                className="filter-search"
                style={{ width: '100%', marginBottom: 20 }}
              />

              <Label>Asset Class</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {INDUSTRIES.map((ind) => {
                  const preset = INDUSTRY_PRESETS[ind];
                  const selected = industry === ind;
                  return (
                    <button
                      key={ind}
                      onClick={() => pickIndustry(ind)}
                      style={{
                        textAlign: 'left',
                        padding: '0.85rem',
                        border: `1px solid ${selected ? '#1a3a2a' : '#e5e7eb'}`,
                        borderRadius: 4,
                        background: selected ? '#f0fdf4' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{preset.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>
                        {preset.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 2: Role */}
          {step === 2 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: 4 }}>
                What's your primary role?
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                This shapes how we analyze and score intelligence for you.
              </p>

              <div style={{ display: 'grid', gap: 8 }}>
                {ROLES.map((r) => {
                  const selected = role === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => pickRole(r.value)}
                      style={{
                        textAlign: 'left',
                        padding: '0.85rem',
                        border: `1px solid ${selected ? '#1a3a2a' : '#e5e7eb'}`,
                        borderRadius: 4,
                        background: selected ? '#f0fdf4' : 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{r.description}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 3: Keywords & Companies */}
          {step === 3 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: 4 }}>
                Keywords and target companies
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                We pre-loaded defaults for {INDUSTRY_PRESETS[industry].label}. Edit or add your own.
              </p>

              <Label>Keywords (comma or newline separated)</Label>
              <textarea
                value={config.intel.keywords.join('\n')}
                onChange={(e) => updateKeywords(e.target.value)}
                rows={6}
                className="filter-search"
                style={{ width: '100%', marginBottom: 20, fontFamily: 'inherit', resize: 'vertical' }}
              />

              <Label>Target Companies (one per line)</Label>
              <textarea
                value={config.intel.target_companies.join('\n')}
                onChange={(e) => updateCompanies(e.target.value)}
                rows={8}
                className="filter-search"
                style={{ width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </>
          )}

          {/* Step 4: Sources */}
          {step === 4 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: 4 }}>
                Enable intelligence sources
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                Pick which sources to ingest. You can change this later in Settings.
              </p>

              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { key: 'news' as const, label: 'News', description: 'Press releases, trade publications, real estate news via NewsAPI' },
                  { key: 'sec' as const, label: 'SEC EDGAR', description: 'Public company filings, Form D private placements, REIT reports' },
                  { key: 'biggerpockets' as const, label: 'BiggerPockets', description: 'Blog posts filtered for your asset class' },
                  { key: 'podcasts' as const, label: 'Podcasts', description: 'Episode summaries from industry podcasts' },
                  ...(industry === 'self-storage'
                    ? [{ key: 'iss' as const, label: 'Inside Self-Storage', description: 'Primary self-storage trade publication RSS feed' }]
                    : []),
                ].map((source) => (
                  <label
                    key={source.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '0.85rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: config.sources[source.key] ? '#f0fdf4' : 'white',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={config.sources[source.key]}
                      onChange={() => toggleSource(source.key)}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{source.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{source.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Step 5: Subreddits & Review */}
          {step === 5 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: 4 }}>
                Fine-tune and review
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                Almost done. Review your settings and kick off your instance.
              </p>

              <div
                style={{
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: 4,
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
                  Summary
                </div>
                <SummaryRow label="Company" value={orgName || '—'} />
                <SummaryRow label="Asset class" value={INDUSTRY_PRESETS[industry].label} />
                <SummaryRow label="Primary role" value={ROLES.find((r) => r.value === role)?.label ?? ''} />
                <SummaryRow label="Keywords" value={`${config.intel.keywords.length} terms`} />
                <SummaryRow label="Target companies" value={`${config.intel.target_companies.length} entities`} />
                <SummaryRow
                  label="Active sources"
                  value={Object.entries(config.sources)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(', ')}
                />
              </div>
            </>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button
              className="portal-btn portal-btn-ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              disabled={step === 1}
              style={{ opacity: step === 1 ? 0.4 : 1 }}
            >
              &larr; Back
            </button>
            {step < 5 ? (
              <button
                className="portal-btn portal-btn-primary"
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={step === 1 && !orgName.trim()}
              >
                Continue &rarr;
              </button>
            ) : (
              <button
                className="portal-btn portal-btn-primary"
                onClick={finish}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Finish Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: 11,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 6,
        fontWeight: 500,
      }}
    >
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ color: '#111827', fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
