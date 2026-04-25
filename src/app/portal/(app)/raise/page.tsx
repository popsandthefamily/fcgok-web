import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { PortalDocument } from '@/lib/types/documents';
import type { TrackedEntity } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Capital Raise Workspace' };

const REQUIRED_DOCS = [
  { type: 'pitch_deck', label: 'Pitch deck' },
  { type: 'prospectus', label: 'Investor prospectus' },
  { type: 'om', label: 'Offering memorandum' },
] as const;

const PIPELINE_STATUSES = ['watching', 'contacted', 'engaged', 'passed'] as const;

export default async function RaiseWorkspacePage() {
  const auth = await getAuthedUser();
  if (!auth?.orgId) return null;

  const supabase = await createServiceClient();
  const [{ data: docs }, { data: entities }] = await Promise.all([
    supabase
      .from('documents')
      .select('*')
      .eq('organization_id', auth.orgId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('tracked_entities')
      .select('*')
      .eq('organization_id', auth.orgId)
      .order('last_activity_at', { ascending: false, nullsFirst: false }),
  ]);

  const documents = (docs as PortalDocument[] | null) ?? [];
  const investors = ((entities as TrackedEntity[] | null) ?? []).filter((entity) =>
    entity.categories?.some((category) => category === 'equity_investor' || category === 'lender'),
  );
  const readyDocs = REQUIRED_DOCS.filter((required) =>
    documents.some((doc) => doc.type === required.type && doc.status === 'ready'),
  );
  const engaged = investors.filter((entity) => entity.status === 'engaged').length;
  const contacted = investors.filter((entity) => entity.status === 'contacted').length;
  const readiness = Math.round(((readyDocs.length + Math.min(engaged + contacted, 3)) / 6) * 100);

  const checklist = [
    {
      label: 'Create a concise pitch deck',
      done: documents.some((doc) => doc.type === 'pitch_deck' && doc.status === 'ready'),
      href: '/portal/toolkit/builder/new?type=pitch_deck',
    },
    {
      label: 'Create a prospectus or OM',
      done: documents.some((doc) => ['prospectus', 'om'].includes(doc.type) && doc.status === 'ready'),
      href: '/portal/toolkit/builder',
    },
    {
      label: 'Review stale or missing deck claims',
      done: documents.some((doc) => doc.type === 'pitch_deck'),
      href: '/portal/toolkit/deck-review',
    },
    {
      label: 'Build a target investor list',
      done: investors.length >= 10,
      href: '/portal/investors',
    },
    {
      label: 'Start outreach and track replies',
      done: contacted + engaged > 0,
      href: '/portal/toolkit/templates',
    },
    {
      label: 'Prepare market support',
      done: documents.some((doc) => doc.deal_facts?.city || doc.deal_facts?.state),
      href: '/portal/toolkit/market-snapshot',
    },
  ];

  return (
    <>
      <div className="portal-header">
        <div>
          <h1>Capital Raise Workspace</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            A single command center for getting investor-ready and tracking capital conversations.
          </p>
        </div>
        <Link href="/portal/toolkit/builder/new?type=pitch_deck" className="portal-btn portal-btn-primary">
          New Pitch Deck
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{readiness}%</div>
          <div className="stat-label">Raise readiness</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{investors.length}</div>
          <div className="stat-label">Capital targets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{engaged}</div>
          <div className="stat-label">Engaged conversations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{readyDocs.length}/3</div>
          <div className="stat-label">Core docs ready</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="portal-card">
          <div className="portal-card-header">
            <span className="portal-card-title">Investor-Ready Checklist</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              {checklist.filter((item) => item.done).length}/{checklist.length} complete
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
            {checklist.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '0.85rem 1rem',
                  background: 'white',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: 14, color: '#111827' }}>{item.label}</span>
                <span
                  className={`status-badge status-${item.done ? 'active' : 'watching'}`}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {item.done ? 'done' : 'next'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="portal-card">
          <div className="portal-card-header">
            <span className="portal-card-title">Pipeline Snapshot</span>
            <Link href="/portal/investors" style={{ fontSize: 12, color: '#1a3a2a', textDecoration: 'none' }}>
              Open radar &rarr;
            </Link>
          </div>
          {PIPELINE_STATUSES.map((status) => {
            const count = investors.filter((entity) => entity.status === status).length;
            return (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>{status}</span>
                <span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{count}</span>
              </div>
            );
          })}
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/portal/admin/entities" className="portal-btn portal-btn-ghost">
              Add Target
            </Link>
            <Link href="/portal/toolkit/templates" className="portal-btn portal-btn-ghost">
              Outreach
            </Link>
          </div>
        </div>
      </div>

      <div className="portal-card" style={{ marginTop: '1.5rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Recent Raise Materials</span>
          <Link href="/portal/toolkit/builder" style={{ fontSize: 12, color: '#1a3a2a', textDecoration: 'none' }}>
            Document builder &rarr;
          </Link>
        </div>
        {documents.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9ca3af' }}>No materials yet. Start with a pitch deck or prospectus.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
            {documents.slice(0, 6).map((doc) => (
              <Link
                key={doc.id}
                href={`/portal/toolkit/builder/${doc.id}`}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'white', color: 'inherit', textDecoration: 'none' }}
              >
                <span style={{ fontSize: 14, color: '#111827' }}>{doc.deal_name}</span>
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
