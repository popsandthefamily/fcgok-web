import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Broken Bow Business Services — Websites, SEO & Property Management',
  description:
    'Cabin website design, local SEO, property management, and marketing for tourism businesses in Broken Bow and Hochatown, Oklahoma. Built by the team behind hocha.town.',
  openGraph: {
    title: 'Business Services — Broken Bow & Hochatown',
    description: 'Cabin websites, local SEO, property management, and marketing for tourism businesses in Broken Bow and Hochatown.',
    url: 'https://fcgok.com/businesses',
  },
  twitter: {
    title: 'Business Services — Broken Bow & Hochatown',
    description: 'Cabin websites, local SEO, property management, and marketing for tourism businesses in Broken Bow and Hochatown.',
  },
  alternates: { canonical: 'https://fcgok.com/businesses' },
};

const SERVICES = [
  { num: '01', title: 'Websites that book', body: 'Custom booking sites and guest experience apps built on the same stack as hocha.town — Next.js, AI, native mobile.' },
  { num: '02', title: 'Show up on Google', body: 'Local SEO and Google Business profile optimization that gets you found when visitors search for things to do in Broken Bow.' },
  { num: '03', title: 'Property management', body: 'Full-service STR management — listing optimization, guest communication, cleaning coordination, and maintenance.' },
  { num: '04', title: 'Brand & visual identity', body: 'Logo design, visual identity, signage, and print materials that help you stand out in a crowded cabin market.' },
  { num: '05', title: 'Professional photography', body: 'Real estate, commercial, and event photography. Great photos are the first impression for every cabin listing.' },
  { num: '06', title: 'Get listed on hocha.town', body: "Your business in front of tourists at the moment they're deciding where to eat, what to do, and where to stay." },
];

export default function BusinessesPage() {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--forest)', padding: '5rem 3rem' }}>
        <span className="section-label section-label--light">For Businesses</span>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
          color: 'var(--cream)', fontWeight: 400, lineHeight: 1.2,
          maxWidth: 620, marginBottom: '1.5rem',
        }}>
          Grow your business with tools built{' '}
          <em>for this market.</em>
        </h1>
        <p style={{ color: 'rgba(244,241,234,0.7)', fontSize: 17, maxWidth: 500, lineHeight: 1.7, fontWeight: 300 }}>
          We build and operate in the same market you do. Whether you need more bookings,
          better tech, or a sounding board — we speak the same language.
        </p>
      </section>

      {/* ── SERVICES GRID ──────────────────────────────────────────── */}
      <section style={{ padding: '5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {SERVICES.map(({ num, title, body }) => (
            <div key={num} className="pillar">
              <div className="pillar-num">{num}</div>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOCHA.TOWN CTA ─────────────────────────────────────────── */}
      <section style={{
        margin: '0 3rem 5rem',
        background: 'var(--forest)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem',
        padding: '4rem',
        borderRadius: 4,
      }}>
        <div>
          <span className="section-label section-label--light">The Platform Advantage</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--cream)', fontWeight: 400, marginBottom: '1rem' }}>
            When you work with us, you get listed on hocha.town.
          </h2>
          <p style={{ color: 'rgba(244,241,234,0.7)', lineHeight: 1.8, fontWeight: 300 }}>
            Hocha.town features an AI trip planner, event listings, and local guides — putting
            your business in front of tourists at the moment they&apos;re deciding where to eat,
            what to do, and where to stay.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
          <a href="https://hocha.town" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', width: 'fit-content' }}>
            Visit hocha.town &rarr;
          </a>
          <p style={{ fontSize: 13, color: 'rgba(244,241,234,0.4)', lineHeight: 1.6 }}>
            AI trip planner &middot; Burn ban widget &middot; STR tax calculator &middot; iOS app
          </p>
        </div>
      </section>

      {/* ── CONTACT CTA ────────────────────────────────────────────── */}
      <section style={{ padding: '0 3rem 5rem', maxWidth: 600 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '1rem' }}>
          Ready to grow?
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Whether it&apos;s a new cabin company or a restaurant that&apos;s been here for years — let&apos;s figure out what&apos;s next.
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
            <label className="form-label" htmlFor="biz-message">Tell us about your business</label>
            <textarea className="form-textarea" id="biz-message" name="message" rows={4} placeholder="What kind of business, what you need help with..." />
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>
            Send Message
          </button>
        </form>
      </section>
    </>
  );
}
