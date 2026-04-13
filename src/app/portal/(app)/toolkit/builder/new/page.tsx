'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DealFacts, DocumentType } from '@/lib/types/documents';
import { DOCUMENT_TYPE_LABELS } from '@/lib/types/documents';

function NewDocumentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get('type') ?? 'om') as DocumentType;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [facts, setFacts] = useState<DealFacts>({ deal_name: '' });

  function update<K extends keyof DealFacts>(key: K, value: DealFacts[K]) {
    setFacts((prev) => ({ ...prev, [key]: value }));
  }

  function updateNum(key: keyof DealFacts, value: string) {
    const num = value === '' ? undefined : parseFloat(value);
    setFacts((prev) => ({ ...prev, [key]: num }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!facts.deal_name?.trim()) {
      setError('Deal name is required');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          deal_name: facts.deal_name,
          deal_facts: facts,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create document');
      }
      const { document: doc } = await res.json();
      router.push(`/portal/toolkit/builder/${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSaving(false);
    }
  }

  return (
    <>
      <div className="portal-header">
        <h1>New {DOCUMENT_TYPE_LABELS[type]}</h1>
        <Link href="/portal/toolkit/builder" className="portal-btn portal-btn-ghost">&larr; Builder</Link>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Fill in the deal facts. You can leave fields blank and AI will generalize.
        You'll be able to edit everything after generation.
      </p>

      {error && (
        <div className="portal-card" style={{ borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '1rem' }}>
          <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="portal-card" style={{ marginBottom: '1rem' }}>
          <div className="portal-card-header">
            <span className="portal-card-title">Property</span>
          </div>
          <Grid>
            <Field label="Deal Name *" span={2}>
              <input type="text" className="filter-search" style={{ width: '100%' }} value={facts.deal_name ?? ''} onChange={(e) => update('deal_name', e.target.value)} placeholder="e.g., Sherman Self-Storage Development" required />
            </Field>
            <Field label="Asset Class">
              <input type="text" className="filter-search" style={{ width: '100%' }} value={facts.asset_class ?? ''} onChange={(e) => update('asset_class', e.target.value)} placeholder="Self-Storage" />
            </Field>
            <Field label="Property Type">
              <input type="text" className="filter-search" style={{ width: '100%' }} value={facts.property_type ?? ''} onChange={(e) => update('property_type', e.target.value)} placeholder="Class A Climate-Controlled" />
            </Field>
            <Field label="Address" span={2}>
              <input type="text" className="filter-search" style={{ width: '100%' }} value={facts.address ?? ''} onChange={(e) => update('address', e.target.value)} placeholder="123 Main Street" />
            </Field>
            <Field label="City">
              <input type="text" className="filter-search" style={{ width: '100%' }} value={facts.city ?? ''} onChange={(e) => update('city', e.target.value)} placeholder="Sherman" />
            </Field>
            <Field label="State">
              <input type="text" className="filter-search" style={{ width: '100%' }} value={facts.state ?? ''} onChange={(e) => update('state', e.target.value)} placeholder="TX" />
            </Field>
            <Field label="MSA">
              <input type="text" className="filter-search" style={{ width: '100%' }} value={facts.msa ?? ''} onChange={(e) => update('msa', e.target.value)} placeholder="Sherman-Denison" />
            </Field>
            <Field label="Year Built">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.year_built ?? ''} onChange={(e) => updateNum('year_built', e.target.value)} placeholder="2027" />
            </Field>
            <Field label="Total SF">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.total_sf ?? ''} onChange={(e) => updateNum('total_sf', e.target.value)} placeholder="60000" />
            </Field>
            <Field label="Units">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.units ?? ''} onChange={(e) => updateNum('units', e.target.value)} placeholder="550" />
            </Field>
            <Field label="Land (acres)">
              <input type="number" step="0.01" className="filter-search" style={{ width: '100%' }} value={facts.land_acres ?? ''} onChange={(e) => updateNum('land_acres', e.target.value)} placeholder="4.5" />
            </Field>
          </Grid>
        </div>

        <div className="portal-card" style={{ marginBottom: '1rem' }}>
          <div className="portal-card-header">
            <span className="portal-card-title">Financials</span>
          </div>
          <Grid>
            <Field label="Total Project Cost ($)">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.total_project_cost ?? ''} onChange={(e) => updateNum('total_project_cost', e.target.value)} placeholder="8000000" />
            </Field>
            <Field label="Land Cost ($)">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.land_cost ?? ''} onChange={(e) => updateNum('land_cost', e.target.value)} placeholder="600000" />
            </Field>
            <Field label="Construction Cost ($)">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.construction_cost ?? ''} onChange={(e) => updateNum('construction_cost', e.target.value)} placeholder="5400000" />
            </Field>
            <Field label="Loan Amount ($)">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.loan_amount ?? ''} onChange={(e) => updateNum('loan_amount', e.target.value)} placeholder="5200000" />
            </Field>
            <Field label="Loan-to-Cost (%)">
              <input type="number" step="0.1" className="filter-search" style={{ width: '100%' }} value={facts.ltc_pct ?? ''} onChange={(e) => updateNum('ltc_pct', e.target.value)} placeholder="65" />
            </Field>
            <Field label="Equity Required ($)">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.equity_required ?? ''} onChange={(e) => updateNum('equity_required', e.target.value)} placeholder="2800000" />
            </Field>
            <Field label="Stabilized NOI ($)">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.stabilized_noi ?? ''} onChange={(e) => updateNum('stabilized_noi', e.target.value)} placeholder="720000" />
            </Field>
            <Field label="Exit Cap Rate (%)">
              <input type="number" step="0.1" className="filter-search" style={{ width: '100%' }} value={facts.exit_cap_rate ?? ''} onChange={(e) => updateNum('exit_cap_rate', e.target.value)} placeholder="6.2" />
            </Field>
            <Field label="Projected IRR (%)">
              <input type="number" step="0.1" className="filter-search" style={{ width: '100%' }} value={facts.projected_irr ?? ''} onChange={(e) => updateNum('projected_irr', e.target.value)} placeholder="18.5" />
            </Field>
            <Field label="Equity Multiple (x)">
              <input type="number" step="0.1" className="filter-search" style={{ width: '100%' }} value={facts.equity_multiple ?? ''} onChange={(e) => updateNum('equity_multiple', e.target.value)} placeholder="2.1" />
            </Field>
            <Field label="Hold Period (years)">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.hold_period_years ?? ''} onChange={(e) => updateNum('hold_period_years', e.target.value)} placeholder="5" />
            </Field>
            <Field label="Minimum Investment ($)">
              <input type="number" className="filter-search" style={{ width: '100%' }} value={facts.minimum_investment ?? ''} onChange={(e) => updateNum('minimum_investment', e.target.value)} placeholder="100000" />
            </Field>
            <Field label="Preferred Return (%)">
              <input type="number" step="0.1" className="filter-search" style={{ width: '100%' }} value={facts.preferred_return_pct ?? ''} onChange={(e) => updateNum('preferred_return_pct', e.target.value)} placeholder="8" />
            </Field>
            <Field label="Promote Structure">
              <input type="text" className="filter-search" style={{ width: '100%' }} value={facts.promote_structure ?? ''} onChange={(e) => update('promote_structure', e.target.value)} placeholder="70/30 over 8% pref" />
            </Field>
            <Field label="Target Close Date" span={2}>
              <input type="date" className="filter-search" style={{ width: '100%' }} value={facts.target_close_date ?? ''} onChange={(e) => update('target_close_date', e.target.value)} />
            </Field>
          </Grid>
        </div>

        <div className="portal-card" style={{ marginBottom: '1rem' }}>
          <div className="portal-card-header">
            <span className="portal-card-title">Narrative (optional — AI will generate if blank)</span>
          </div>
          <Field label="Investment Thesis">
            <textarea rows={3} value={facts.investment_thesis ?? ''} onChange={(e) => update('investment_thesis', e.target.value)} placeholder="Why this deal, why now..." style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 4, fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }} />
          </Field>
          <Field label="Sponsor Highlights">
            <textarea rows={3} value={facts.sponsor_highlights ?? ''} onChange={(e) => update('sponsor_highlights', e.target.value)} placeholder="Track record, experience..." style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 4, fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }} />
          </Field>
          <Field label="Exit Strategy">
            <textarea rows={2} value={facts.exit_strategy ?? ''} onChange={(e) => update('exit_strategy', e.target.value)} placeholder="Sale to REIT at stabilization, or refinance and hold..." style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 4, fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }} />
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/portal/toolkit/builder" className="portal-btn portal-btn-ghost">Cancel</Link>
          <button type="submit" className="portal-btn portal-btn-primary" disabled={saving}>
            {saving ? 'Creating...' : 'Create & Generate Sections →'}
          </button>
        </div>
      </form>
    </>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
      {children}
    </div>
  );
}

function Field({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: 1 | 2 }) {
  return (
    <div style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
      <label style={{ display: 'block', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function NewDocumentPage() {
  return (
    <Suspense>
      <NewDocumentForm />
    </Suspense>
  );
}
