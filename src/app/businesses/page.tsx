import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Business Owner Capital Portal — Investor Materials & Market Intelligence',
  description:
    'Investor-ready materials, market snapshots, outreach templates, and capital partner intelligence for business owners and developers raising capital.',
  openGraph: {
    title: 'Business Owner Capital Portal',
    description: 'Investor-ready materials, market snapshots, outreach templates, and capital partner intelligence for owners raising capital.',
    url: 'https://fcgok.com/businesses',
  },
  twitter: {
    title: 'Business Owner Capital Portal',
    description: 'Investor-ready materials, market snapshots, outreach templates, and capital partner intelligence for owners raising capital.',
  },
  alternates: { canonical: 'https://fcgok.com/businesses' },
};

const SERVICES = [
  { num: '01', title: 'Investor-ready materials', body: 'Build pitch decks, prospectuses, and offering memoranda from structured deal facts instead of starting from a blank page.' },
  { num: '02', title: 'Market snapshots', body: 'Generate branded, source-informed summaries that help investors understand the market, asset class, and thesis.' },
  { num: '03', title: 'Capital partner radar', body: 'Track lenders, equity investors, brokers, funds, and strategic partners with status, fit, and recent activity.' },
  { num: '04', title: 'Outreach templates', body: 'Use reusable email templates, placeholder fills, send logs, and reply tracking to keep follow-up disciplined.' },
  { num: '05', title: 'Comps and support data', body: 'Capture transaction comps and extract structured deal evidence from relevant intel in one workspace.' },
  { num: '06', title: 'Readiness workflow', body: 'See what is missing before outreach: materials, market support, target list, and active conversations.' },
];

export default function BusinessesPage() {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="mobile-pad" style={{ background: 'var(--forest)', padding: '5rem 3rem' }}>
        <span className="section-label section-label--light">For Businesses</span>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
          color: 'var(--cream)', fontWeight: 400, lineHeight: 1.2,
          maxWidth: 620, marginBottom: '1.5rem',
        }}>
          Raise capital with materials built{' '}
          <em>for investor conversations.</em>
        </h1>
        <p style={{ color: 'rgba(244,241,234,0.7)', fontSize: 17, maxWidth: 500, lineHeight: 1.7, fontWeight: 300 }}>
          Turn your deal facts, market knowledge, and target list into a cleaner capital
          raise process — from first deck to investor follow-up.
        </p>
      </section>

      {/* ── SERVICES GRID ──────────────────────────────────────────── */}
      <section className="mobile-pad" style={{ padding: '5rem 3rem' }}>
        <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {SERVICES.map(({ num, title, body }) => (
            <div key={num} className="pillar">
              <div className="pillar-num">{num}</div>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PORTAL CTA ─────────────────────────────────────────────── */}
      <section className="mobile-stack mobile-nomargin mobile-pad" style={{
        margin: '0 3rem 5rem',
        background: 'var(--forest)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem',
        padding: '4rem',
        borderRadius: 4,
      }}>
        <div>
          <span className="section-label section-label--light">The Platform Advantage</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--cream)', fontWeight: 400, marginBottom: '1rem' }}>
            One workspace for the messy middle of a raise.
          </h2>
          <p style={{ color: 'rgba(244,241,234,0.7)', lineHeight: 1.8, fontWeight: 300 }}>
            The portal keeps materials, market context, outreach, comps, and investor tracking
            in one place so business owners can move from idea to credible investor conversation
            without duct-taping spreadsheets and docs together.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
          <Link href="#contact" className="btn-primary" style={{ display: 'inline-flex', width: 'fit-content' }}>
            Request Portal Access &rarr;
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(244,241,234,0.4)', lineHeight: 1.6 }}>
            Deck builder &middot; Market snapshots &middot; Investor radar &middot; Outreach tracking
          </p>
        </div>
      </section>

      {/* ── CONTACT CTA ────────────────────────────────────────────── */}
      <section className="mobile-pad" style={{ padding: '0 3rem 5rem', maxWidth: 600 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '1rem' }}>
          Ready to grow?
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Tell us what you&apos;re raising for, what materials you already have, and who you need to reach.
        </p>

        <form action="https://formspree.io/f/xnjgkbrq" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="hidden" name="_subject" value="Business Inquiry" />
          <input type="hidden" name="source" value="businesses" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" htmlFor="biz-name">Name</label>
              <input className="form-input" id="biz-name" name="name" type="text" placeholder="Your name" required />
            </div>
            <div>
              <label className="form-label" htmlFor="biz-email">Email</label>
              <input className="form-input" id="biz-email" name="email" type="email" placeholder="your@email.com" required />
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="biz-message">Tell us about the raise</label>
            <textarea className="form-textarea" id="biz-message" name="message" rows={4} placeholder="Deal size, use of funds, target investors, current materials..." />
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>
            Send Message
          </button>
        </form>
      </section>
    </>
  );
}
