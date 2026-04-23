import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers at Frontier Consulting Group — Broken Bow Jobs',
  description: 'Join the Frontier team in Broken Bow and Hochatown, Oklahoma. Currently hiring a part-time community representative with flexible hours and commission-based pay.',
  openGraph: {
    title: 'Careers — Frontier Consulting Group',
    description: 'Join the Frontier team in Broken Bow and Hochatown. Currently hiring a part-time community representative.',
    url: 'https://fcgok.com/careers',
  },
  twitter: {
    title: 'Careers — Frontier Consulting Group',
    description: 'Join the Frontier team in Broken Bow and Hochatown. Currently hiring a part-time community representative.',
  },
  alternates: { canonical: 'https://fcgok.com/careers' },
};

export default function CareersPage() {
  return (
    <>
      {/* Header */}
      <section className="mobile-pad" style={{ background: 'var(--forest)', padding: '5rem 3rem' }}>
        <span className="section-label section-label--light">Careers</span>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
          color: 'var(--cream)', fontWeight: 400, lineHeight: 1.2,
          maxWidth: 620, marginBottom: '1.5rem',
        }}>
          Work with us
        </h1>
        <p style={{ color: 'rgba(244,241,234,0.7)', fontSize: 17, maxWidth: 560, lineHeight: 1.7, fontWeight: 300 }}>
          Frontier Consulting Group is a small, flexible team based in Broken Bow, Oklahoma.
          We value people who are self-starters, genuinely curious, and care about the
          communities they work in. No corporate red tape — just real work with real impact.
        </p>
      </section>

      {/* Open Positions */}
      <section className="mobile-pad" style={{ padding: '5rem 3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '2rem' }}>
          Open positions
        </h2>

        <div style={{ border: '1px solid var(--border)', padding: '2.5rem', background: 'var(--warm-white)' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--gold)', background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)',
            padding: '4px 12px', borderRadius: 2, marginBottom: '1rem',
          }}>
            Part-Time &middot; Commission-Based
          </span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginBottom: '1rem' }}>
            Local Community Rep — Hochatown / Broken Bow
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 580, marginBottom: '2rem' }}>
            Frontier Consulting Group is looking for a part-time local community rep in the
            Hochatown/Broken Bow area. Flexible hours, work on your own schedule. You&apos;ll
            be connecting with local businesses and property owners on behalf of our clients.
            Great fit for someone who knows the area, loves talking to people, and wants to
            earn extra income. Commission-based with bonuses.
          </p>
          <a
            href="mailto:info@fcgok.com?subject=Community%20Rep%20Position%20—%20Interest"
            className="btn-primary"
          >
            Apply via Email &rarr;
          </a>
        </div>
      </section>
    </>
  );
}
