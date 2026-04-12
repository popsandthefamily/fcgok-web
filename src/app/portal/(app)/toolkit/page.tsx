import Link from 'next/link';

export const metadata = { title: 'Deal Toolkit' };

const TOOLS = [
  {
    href: '/portal/toolkit/market-snapshot',
    title: 'Market Snapshot Generator',
    description:
      'Generate an AI-powered market snapshot for any MSA or county',
  },
  {
    href: '/portal/toolkit/comps',
    title: 'Comparable Transactions',
    description:
      'Track self-storage transactions, filter by geography and deal size',
  },
  {
    href: '/portal/toolkit/templates',
    title: 'Outreach Templates',
    description:
      'Pre-built email and LinkedIn message templates for investor outreach',
  },
  {
    href: '/portal/toolkit/deck-review',
    title: 'Pitch Deck Review',
    description:
      'Upload a deck and get AI analysis of stale data and missing elements',
  },
];

export default function ToolkitPage() {
  return (
    <>
      <div className="portal-header">
        <h1>Deal Toolkit</h1>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              className="portal-card"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                  {tool.title}
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  {tool.description}
                </p>
              </div>
              <div style={{ marginTop: '1rem', fontSize: 13, fontWeight: 500, color: '#1a3a2a' }}>
                Open &rarr;
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
