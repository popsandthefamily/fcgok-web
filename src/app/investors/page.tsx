import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Broken Bow & Hochatown Investment Advisory',
  description:
    'Local market intelligence, builder connections, and STR data for investors exploring the Broken Bow, Oklahoma market. Federal Opportunity Zone. Choctaw casino development.',
  openGraph: {
    title: 'Broken Bow & Hochatown Investment Advisory | Frontier Consulting Group',
    description: 'Local market intelligence for investors exploring the Broken Bow and Hochatown, Oklahoma STR and real estate market.',
    url: 'https://fcgok.com/investors',
  },
  twitter: {
    title: 'Broken Bow & Hochatown Investment Advisory | Frontier Consulting Group',
    description: 'Local market intelligence for investors exploring the Broken Bow and Hochatown, Oklahoma STR and real estate market.',
  },
  alternates: { canonical: 'https://fcgok.com/investors' },
};

const MARKET_STATS = [
  { num: '2.2M', label: 'Annual visitors — Beavers Bend State Park' },
  { num: 'OZ', label: 'Federal Opportunity Zone designation' },
  { num: '▲', label: 'Choctaw casino resort under development' },
  { num: 'STR', label: 'Maturing market with retail expansion' },
];

const PILLARS = [
  { num: '01', title: 'Local Market Intelligence', body: "Real occupancy data, neighborhood-level knowledge, what's actually renting vs. what looks good on paper." },
  { num: '02', title: 'Builder & Operator Connections', body: 'Not a directory — curated introductions to the contractors, property managers, and operators who actually deliver.' },
  { num: '03', title: 'Tourism Platform Data', body: "Through hocha.town, real visitor data on what people search, book, and prioritize. Market intelligence you can't get from a spreadsheet." },
  { num: '04', title: 'Post-Investment Execution', body: "Marketing, software, property management, and operational support. We don't disappear after the introduction." },
];

export default function InvestorsPage() {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--forest)', padding: '6rem 3rem 5rem',
        display: 'grid', gridTemplateColumns: '1fr 380px', gap: '5rem', alignItems: 'start',
      }}>
        <div>
          <span className="section-label section-label--light">For Investors</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
            color: 'var(--cream)', fontWeight: 400, lineHeight: 1.2, marginBottom: '1.5rem',
          }}>
            Your trusted guide to the Broken Bow market.
          </h1>
          <p style={{ color: 'rgba(244,241,234,0.7)', fontSize: 16, lineHeight: 1.8, fontWeight: 300, maxWidth: 520 }}>
            Frontier Consulting Group is led by Hunter Collins, a Broken Bow native
            who operates in this market daily. The capital is coming from Dallas, Tulsa,
            and OKC — but the investors who win here are the ones with a trusted local
            partner.
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1, background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)', margin: '3rem 0',
          }}>
            {MARKET_STATS.map(({ num, label }) => (
              <div key={label} style={{ background: 'rgba(26,58,42,0.6)', padding: '2rem' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--cream)' }}>{num}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <p className="disclaimer">
            <strong>Disclaimer:</strong> Frontier Consulting Group is not a registered financial advisor,
            broker-dealer, or real estate broker. We provide local market knowledge, business consulting,
            technology services, and introductions. Nothing on this page constitutes investment advice.
            Always consult licensed professionals for financial, legal, and real estate decisions.
          </p>
        </div>

        {/* ── CONTACT FORM ────────────────────────────────────────── */}
        <div id="contact" style={{ background: 'var(--cream)', borderRadius: 4, padding: '2rem', marginTop: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--forest)', marginBottom: '0.5rem' }}>
            Exploring the Broken Bow market?
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Tell us what you&apos;re looking at. Straight answers — no sales pitch, just local knowledge.
          </p>

          <form action="https://formspree.io/f/xnjgkbrq" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="hidden" name="_subject" value="Investor Inquiry" />
            <input type="hidden" name="source" value="investors" />
            <div>
              <label className="form-label" htmlFor="name">Name</label>
              <input className="form-input" id="name" name="name" type="text" placeholder="Your name" required />
            </div>
            <div>
              <label className="form-label" htmlFor="email">Email</label>
              <input className="form-input" id="email" name="email" type="email" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="form-label" htmlFor="message">What are you exploring?</label>
              <textarea className="form-textarea" id="message" name="message" rows={3} placeholder="STR acquisition, restaurant concept, land development..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" name="newsletter" value="yes" style={{ width: 'auto' }} />
              Send me occasional market notes from Hochatown
            </label>
            <button type="submit" style={{
              background: 'var(--forest)', color: 'var(--cream)', border: 'none',
              padding: '12px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              borderRadius: 2, marginTop: '0.25rem', transition: 'background 0.2s',
            }}>
              Get in Touch
            </button>
          </form>
        </div>
      </section>

      {/* ── WHAT WE BRING ──────────────────────────────────────────── */}
      <section style={{ padding: '5rem 3rem' }}>
        <span className="section-label">What We Bring</span>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
          fontWeight: 400, marginBottom: '3rem',
        }}>
          Not a broker. A <em style={{ color: 'var(--forest-mid)' }}>guide.</em>
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1, background: 'var(--border)', border: '1px solid var(--border)',
        }}>
          {PILLARS.map(({ num, title, body }) => (
            <div key={num} className="pillar">
              <div className="pillar-num">{num}</div>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section style={{ background: 'var(--forest)', padding: '5rem 3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        <div>
          <span className="section-label section-label--light">How It Works</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--cream)', fontWeight: 400, marginBottom: '1.5rem' }}>
            This is informal advisory, not a brokerage.
          </h2>
          <p style={{ color: 'rgba(244,241,234,0.7)', lineHeight: 1.8, fontWeight: 300, marginBottom: '1.5rem' }}>
            You&apos;re not signing a retainer or getting a pitch deck. You&apos;re getting a phone call with someone who lives
            in the market, operates in the market, and can give you a straight answer about whether your investment
            thesis makes sense here.
          </p>
          <p style={{ color: 'rgba(244,241,234,0.7)', lineHeight: 1.8, fontWeight: 300 }}>
            If the opportunity is real, we connect you with the right people to execute — builders, property managers,
            attorneys, anyone you need. And if you need help with marketing, tech, or operations after you invest,
            that&apos;s what Frontier Consulting Group does.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '2.5rem', borderRadius: 4, width: '100%' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--cream)', lineHeight: 1.5, fontStyle: 'italic', marginBottom: '1.5rem' }}>
              &ldquo;The investors who win here are the ones with a trusted guide on the ground.&rdquo;
            </p>
            <div style={{ fontSize: 13, color: 'var(--sage-light)' }}>— Hunter Collins, Frontier Consulting Group</div>
            <Link href="#contact" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-flex' }}>
              Start the Conversation &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
