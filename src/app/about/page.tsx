import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Frontier Consulting Group — Broken Bow, Oklahoma',
  description: 'Rooted in the Broken Bow area for 50+ years through the Fogg and Camp families. Technology, investor connections, and business growth for the Hochatown corridor.',
  openGraph: {
    title: 'About Frontier Consulting Group',
    description: '50+ years of local roots. Technology consulting, investor connections, and business growth in Broken Bow and Hochatown, Oklahoma.',
    url: 'https://fcgok.com/about',
  },
  twitter: {
    title: 'About Frontier Consulting Group',
    description: '50+ years of local roots. Technology consulting, investor connections, and business growth in Broken Bow and Hochatown, Oklahoma.',
  },
  alternates: { canonical: 'https://fcgok.com/about' },
};

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="mobile-pad" style={{ background: 'var(--forest)', padding: '5rem 3rem' }}>
        <span className="section-label section-label--light">About</span>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
          color: 'var(--cream)', fontWeight: 400, lineHeight: 1.2,
          maxWidth: 620,
        }}>
          The local team behind{' '}
          <em style={{ color: 'var(--sage-light)' }}>Frontier.</em>
        </h1>
      </section>

      {/* Story */}
      <section className="mobile-pad" style={{ padding: '5rem 3rem' }}>
        <div style={{ maxWidth: 680 }}>
          <span className="section-label">Why We&apos;re Here</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, marginBottom: '1.5rem' }}>
            Local knowledge meets technical execution.
          </h2>

          <p style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: '1.5rem' }}>
            Frontier Consulting Group started because there was a gap. The Broken Bow and
            Hochatown area is one of Oklahoma&apos;s fastest-growing tourism markets — but the
            businesses and investors fueling that growth didn&apos;t have a local partner who
            could help them with technology, marketing, and the kind of ground-level market
            knowledge that only comes from living here.
          </p>
          <p style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: '1.5rem' }}>
            We&apos;re not a faceless agency in a distant city. Beth&apos;s family — the Fogg
            and Camp families — has been rooted in this area for over 50 years. We know the
            seasonal rhythms, the builders you can trust, the property managers who actually
            care, and the difference between a location that rents and one that doesn&apos;t.
          </p>
          <p style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: '1.5rem' }}>
            That local knowledge is what makes us different. But it&apos;s the technical ability
            that makes us useful. We don&apos;t just advise — we build custom software for the
            tourism industry. We built{' '}
            <a href="https://hocha.town" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest-mid)', fontWeight: 500 }}>
              hocha.town
            </a>
            , a tourism platform with an AI trip planner, real-time burn ban data, and an STR
            tax calculator. We manage vacation rentals. We shoot real estate and commercial
            photography.
          </p>
          <p style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: '2.5rem' }}>
            We&apos;re in the arena — operating in the same market we advise on.
          </p>

          <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {[
              { num: '50+', label: 'Years of family roots in the Broken Bow area' },
              { num: '4', label: 'Active ventures — software to property management' },
              { num: '2.2M', label: 'Annual visitors to Beavers Bend State Park' },
            ].map(({ num, label }) => (
              <div key={num} style={{ background: 'var(--warm-white)', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--forest)' }}>{num}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="mobile-pad" style={{ background: 'var(--forest)', padding: '5rem 3rem' }}>
        <div style={{ maxWidth: 680 }}>
          <span className="section-label section-label--light">What We Do</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '2rem' }}>
            {[
              { title: 'The ecosystem connector', body: 'We know the cabin owners, property managers, builders, restaurant owners, investors, and visitors. Nobody else in this market has relationships across all those layers.' },
              { title: 'The technical founder', body: "We don't just advise — we build software. Hocha.town is a working tourism platform with AI, real-time data feeds, payments, and a native iOS app. That's a different caliber than social media management." },
              { title: 'The investor bridge', body: "We connect capital with local opportunity through strategic consulting — then help execute with software, marketing, and property management." },
            ].map(({ title, body }) => (
              <div key={title}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--gold-light)', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: 'rgba(244,241,234,0.7)', lineHeight: 1.8, fontWeight: 300 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mobile-pad" style={{ padding: '5rem 3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, marginBottom: '1rem' }}>
          Want to work together?
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
          Whether you&apos;re investing in the Broken Bow market or growing a business here.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/investors" className="btn-primary">For Investors</Link>
          <Link href="/businesses" className="btn-outline--dark" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 28px', fontSize: 13, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 2 }}>For Businesses</Link>
        </div>
      </section>
    </>
  );
}
