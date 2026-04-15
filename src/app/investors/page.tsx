import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Invest in Broken Bow & Hochatown — Local Advisory',
  description:
    'Local market intelligence, builder connections, and STR data for investors exploring the Broken Bow, Oklahoma market. Rural Opportunity Zone (Census Tract 986), 2.2M annual visitors, and a trusted local guide.',
  openGraph: {
    title: 'Invest in Broken Bow & Hochatown',
    description: 'Local advisory for investors exploring Broken Bow and Hochatown. Rural Opportunity Zone, 2.2M annual visitors, and a trusted local guide.',
    url: 'https://fcgok.com/investors',
  },
  twitter: {
    title: 'Invest in Broken Bow & Hochatown',
    description: 'Local advisory for investors exploring Broken Bow and Hochatown. Rural Opportunity Zone, 2.2M annual visitors, and a trusted local guide.',
  },
  alternates: { canonical: 'https://fcgok.com/investors' },
};

const MARKET_STATS = [
  { num: '2.2M', label: 'Annual visitors — Beavers Bend State Park' },
  { num: 'OZ', label: 'Rural Opportunity Zone — Tract 986 (tract-specific)' },
  { num: '▲', label: 'Choctaw casino resort under development' },
  { num: 'STR', label: 'Maturing market with retail expansion' },
];

const OZ_POINTS = [
  {
    title: 'It\u2019s real, but tract-specific.',
    body: 'Broken Bow and parts of the Hochatown gateway sit inside Census Tract 986 — one of four federal Opportunity Zones in McCurtain County. The line matters cabin-by-cabin, so we verify the exact tract for each parcel before you write an offer.',
  },
  {
    title: 'Rural zone in a growth market.',
    body: 'Unlike the OZ tracts in OKC and Tulsa that were drawn for urban revitalization, this one was designated on county-level income data. You\u2019re not rescuing a distressed neighborhood — you\u2019re getting federal tax treatment for investing in a market that\u2019s growing on its own.',
  },
  {
    title: 'Original program winds down Dec 31, 2026.',
    body: 'Legacy capital-gain deferrals under the 2017 rules come due on that date — tax payable with 2026 returns. If you\u2019re sitting on deferred gains in an existing QOF, the clock is short.',
  },
  {
    title: 'OZ 2.0 starts Jan 1, 2027 — better for rural.',
    body: 'The One Big Beautiful Bill Act made Opportunity Zones permanent. Governors nominate new tracts starting July 2026. Rural zones get a 30% basis step-up (vs. 10% urban) and a 50% substantial-improvement requirement (vs. 100%) — which actually pencils for buy-and-hold cabin strategies.',
  },
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
          Your strategic partner <em style={{ color: 'var(--forest-mid)' }}>on the ground.</em>
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

      {/* ── OPPORTUNITY ZONE ───────────────────────────────────────── */}
      <section style={{ padding: '1rem 3rem 5rem' }}>
        <span className="section-label">Opportunity Zone</span>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
          fontWeight: 400, marginBottom: '1rem',
        }}>
          The OZ story here <em style={{ color: 'var(--forest-mid)' }}>isn&apos;t the OKC story.</em>
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 760, marginBottom: '2.5rem' }}>
          Broken Bow&apos;s Opportunity Zone designation gets cited a lot in pitch decks, usually without the fine print.
          The program is real and the tax treatment is meaningful — but the mechanics differ from most Oklahoma OZ
          conversations, which are built around urban OKC and Tulsa tracts. Here&apos;s what actually applies in
          McCurtain County.
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1, background: 'var(--border)', border: '1px solid var(--border)',
        }}>
          {OZ_POINTS.map(({ title, body }) => (
            <div key={title} style={{ background: 'var(--warm-white)', padding: '2rem' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--forest)' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
        <p className="disclaimer" style={{ marginTop: '2rem' }}>
          <strong>Not tax advice.</strong> OZ eligibility is tract- and parcel-specific, substantial-improvement rules
          apply to most real estate plays, and Oklahoma conforms to the federal framework through rolling AGI
          conformity. Confirm everything with a qualified tax advisor before investing.
        </p>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section style={{ background: 'var(--forest)', padding: '5rem 3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        <div>
          <span className="section-label section-label--light">How It Works</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--cream)', fontWeight: 400, marginBottom: '1.5rem' }}>
            Strategic consulting, on retainer.
          </h2>
          <p style={{ color: 'rgba(244,241,234,0.7)', lineHeight: 1.8, fontWeight: 300, marginBottom: '1.5rem' }}>
            We work on a retainer basis — you get ongoing access to someone who lives in the market, operates
            in the market, and can give you a straight answer about whether your investment thesis makes sense here.
          </p>
          <p style={{ color: 'rgba(244,241,234,0.7)', lineHeight: 1.8, fontWeight: 300 }}>
            When the opportunity is real, we connect you with the right people to execute — builders, property managers,
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
