import type { Metadata } from 'next';
import Link from 'next/link';

const TIMELINE = [
  {
    year: '2024–Present',
    title: 'Founder — Frontier Consulting Group',
    body: 'Launched FCG as the umbrella for technology consulting, investor advisory, property management, and photography across Southeast Oklahoma. Currently building the investor portal to connect outside capital with local opportunity.',
    gold: true,
  },
  {
    year: '2024–Present',
    title: 'Builder — hocha.town',
    body: 'Built and shipped a full-stack tourism platform for Hochatown and Broken Bow: AI trip planner (Groq/LLaMA), real-time burn ban data via ArcGIS API, STR tax calculator, push notifications, and a native iOS app on the App Store via Capacitor.',
    gold: true,
  },
  {
    year: '2023–Present',
    title: 'Principal — Frontier Property Management',
    body: 'Full-service STR management in the Broken Bow area — listing optimization, guest communication, cleaning coordination, and maintenance. Operates in the same market as the consulting work, creating real feedback loops.',
    gold: false,
  },
  {
    year: '2023–Present',
    title: 'Founder — Frontier Photography',
    body: 'Real estate, commercial, and event photography across Southeast Oklahoma, including elopements, cabin shoots, and family sessions in the Beavers Bend area.',
    gold: false,
  },
  {
    year: 'Prior',
    title: 'Technical Career & Background',
    body: 'Professional background in technology and operations, including hands-on development experience that predates the FCG ventures. Comfortable at every layer of the stack and every stage of a business.',
    gold: false,
  },
];

const STACK = [
  'Next.js', 'Supabase', 'Vercel', 'Clerk', 'Stripe',
  'Capacitor', 'Groq / LLaMA', 'TypeScript', 'iOS App Store', 'GitHub',
];

const STATS = [
  { num: '4+', label: 'Active Ventures' },
  { num: '1', label: 'iOS App Shipped' },
  { num: '50+', label: 'Years Family Roots' },
  { num: '5+', label: 'Years Building Here' },
];

export const metadata: Metadata = {
  title: 'Hunter Collins — Founder & Principal',
  description: 'Entrepreneur, software builder, and Hochatown local. Founder of Frontier Consulting Group, hocha.town, Frontier Property Management, and Frontier Photography.',
  openGraph: {
    title: 'Hunter Collins | Frontier Consulting Group',
    description: 'Founder of Frontier Consulting Group. Software builder and local operator in the Broken Bow market.',
    url: 'https://fcgok.com/about/hunter',
  },
  alternates: { canonical: 'https://fcgok.com/about/hunter' },
};

export default function HunterPage() {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--forest)',
        padding: '5rem 3rem',
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '4rem',
        alignItems: 'center',
      }}>
        <div>
          <span className="section-label section-label--light">Founder &amp; Principal</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 4vw, 3.8rem)',
            color: 'var(--cream)', fontWeight: 400, lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            Hunter Collins
          </h1>
          <p style={{ color: 'rgba(244,241,234,0.75)', fontSize: 17, lineHeight: 1.8, fontWeight: 300, maxWidth: 520, marginBottom: '2rem' }}>
            Entrepreneur, software builder, and Hochatown local. Founded Frontier Consulting Group
            to connect the capital and technology flowing into this market with the ground-level
            knowledge only someone who lives here can provide.
          </p>
          <Link href="/investors" className="btn-primary">Work With Us</Link>
        </div>

        {/* Headshot placeholder */}
        <div style={{
          width: '100%', aspectRatio: '1',
          background: 'var(--forest-mid)',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'var(--sage)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--cream)',
              border: '3px solid rgba(255,255,255,0.15)', margin: '0 auto 12px',
            }}>
              HC
            </div>
            <div style={{ fontSize: 13, color: 'rgba(244,241,234,0.4)', letterSpacing: '0.1em' }}>
              Photo coming soon
            </div>
          </div>
        </div>
      </section>

      {/* ── STAT BAR ───────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--cream)',
        display: 'grid', gridTemplateColumns: `repeat(${STATS.length}, 1fr)`,
        gap: 1, borderTop: '1px solid var(--border)',
      }}>
        {STATS.map(({ num, label }) => (
          <div key={label} style={{ padding: '2rem', background: 'white', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--forest)' }}>{num}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '5rem', padding: '5rem 3rem', alignItems: 'start' }}>
        <div>
          <span className="section-label">Background</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 400, lineHeight: 1.2, marginBottom: '1.5rem' }}>
            Built from the ground up — <em style={{ color: 'var(--forest-mid)' }}>literally.</em>
          </h2>

          {[
            "The roots run deep. Beth's family — the Fogg and Camp families — has been part of this community for over 50 years. This market is known firsthand because it's been lived in, invested in, and built in.",
            "When hocha.town was built, there was no template. It started as a single-page component and became a full two-sided marketplace with authentication, subscriptions, an AI trip planner, and a native iOS app on the App Store. That's the kind of execution behind every consulting engagement.",
            "The technical side is Next.js, Supabase, Vercel, Clerk, Stripe, and whatever else the problem requires. The operational side is property management, photography, and knowing which builders actually show up. That combination — technical founder plus local operator — is genuinely rare in a market this size.",
          ].map((para, i) => (
            <p key={i} style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: '1.5rem' }}>{para}</p>
          ))}

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, margin: '3rem 0 2rem' }}>
            Career &amp; background
          </h3>
          <ul className="timeline-list">
            {TIMELINE.map(({ year, title, body, gold }) => (
              <li key={title} className="timeline-item">
                <div className={`timeline-dot${gold ? ' timeline-dot--gold' : ''}`} />
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 6 }}>
                  {year}
                </div>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 500, color: 'var(--text-dark)', marginBottom: 6 }}>{title}</h4>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>{body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Sticky sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--forest)', padding: '2rem', borderRadius: 4, marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sage-light)', marginBottom: '1rem' }}>
              Core Stack
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STACK.map((s) => (
                <span key={s} className="stack-chip">{s}</span>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', padding: '2rem', borderRadius: 4, marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Also in the field
            </div>
            {[
              'STR property operations',
              'Local contractor network',
              'Real estate photography',
              'Investor deal sourcing',
              'Market data & analytics',
            ].map((item) => (
              <div key={item} style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.8 }}>• {item}</div>
            ))}
          </div>

          <Link href="/investors" className="btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
            Work With Frontier &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
