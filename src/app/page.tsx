import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarqueeStrip from '@/components/MarqueeStrip';

export const metadata: Metadata = {
  title: 'Frontier Consulting Group | Broken Bow & Hochatown',
  description:
    'Frontier Consulting Group — local tech, consulting, and market intelligence for investors and businesses in Broken Bow and Hochatown, Oklahoma. Tourism software, property management, and investor advisory.',
  openGraph: {
    title: 'Frontier Consulting Group | Technology & Consulting in Broken Bow',
    description: 'Local tech, consulting, and market intelligence for investors and businesses in Broken Bow and Hochatown, Oklahoma.',
    url: 'https://fcgok.com',
  },
  twitter: {
    title: 'Frontier Consulting Group | Technology & Consulting in Broken Bow',
    description: 'Local tech, consulting, and market intelligence for investors and businesses in Broken Bow and Hochatown, Oklahoma.',
  },
  alternates: { canonical: 'https://fcgok.com' },
};

export default function HomePage() {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--forest)',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '6rem 3rem 180px',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 41px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: -100, top: -100,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,122,86,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 760, position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(184,134,11,0.15)',
            border: '1px solid rgba(212,165,32,0.3)',
            color: 'var(--gold-light)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: 2, marginBottom: '2.5rem',
          }}>
            <div style={{ width: 6, height: 6, background: 'var(--gold-light)', borderRadius: '50%' }} />
            Broken Bow &amp; Hochatown, Oklahoma
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
            color: 'var(--cream)', fontWeight: 400, lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            Helping build<br />
            <em style={{ fontStyle: 'italic', color: 'var(--sage-light)' }}>
              Hochatown&apos;s next chapter.
            </em>
          </h1>

          <p style={{
            fontSize: 17, color: 'rgba(244,241,234,0.82)', lineHeight: 1.7,
            maxWidth: 520, marginBottom: '2.5rem', fontWeight: 400,
          }}>
            Frontier Consulting Group sits at the intersection of technology, tourism,
            and local knowledge — connecting investors with opportunity and helping
            businesses grow.
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/investors" className="btn-primary">I&apos;m an Investor</Link>
            <Link href="/businesses" className="btn-outline">I&apos;m a Business Owner</Link>
          </div>
        </div>

        {/* Stat bar */}
        <div style={{
          position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0, borderTop: '1px solid rgba(255,255,255,0.08)', zIndex: 2,
        }}>
          {[
            { num: '2.2M', label: 'Annual Visitors — Beavers Bend' },
            { num: 'OZ', label: 'Federal Opportunity Zone' },
            { num: '50+', label: 'Years of Local Family Roots' },
          ].map(({ num, label }) => (
            <div key={label} style={{ padding: '1.5rem 2rem' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--cream)' }}>
                {num}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── OPPORTUNITY + WHAT WE DO SPLIT ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--forest)' }}>
        <div style={{ padding: '5rem 3rem' }}>
          <span className="section-label section-label--light">The Opportunity</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            color: 'var(--cream)', fontWeight: 400, lineHeight: 1.2, marginBottom: '1.5rem',
          }}>
            Hochatown is at an <em>inflection point.</em>
          </h2>
          <p style={{ color: 'rgba(244,241,234,0.7)', lineHeight: 1.8, fontSize: 16, fontWeight: 300, marginBottom: '1.5rem' }}>
            A federal Opportunity Zone drawing capital from Dallas, Tulsa, and OKC.
            A Choctaw casino resort under development. The STR market is maturing,
            retail corridors are expanding, and infrastructure is catching up to demand.
          </p>
          <p style={{ color: 'rgba(244,241,234,0.7)', lineHeight: 1.8, fontSize: 16, fontWeight: 300, marginBottom: '2rem' }}>
            But growth without local knowledge is a gamble. The investors who win here
            are the ones with a trusted guide on the ground.
          </p>
          <Link href="/investors" className="btn-outline">Explore the Market &rarr;</Link>
        </div>
        <div style={{ background: 'var(--forest-mid)', padding: '5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
          {[
            { tag: 'What we bring', title: 'Local Intelligence', body: 'Real occupancy data, which neighborhoods rent, where growth is happening — not a spreadsheet, lived experience.' },
            { tag: 'What we build', title: 'Full-Stack Technology', body: "Next.js platforms, native iOS apps, AI trip planners, real-time data feeds. We don't just advise — we ship." },
          ].map(({ tag, title, body }) => (
            <div key={tag} style={{ background: 'rgba(255,255,255,0.06)', padding: '2rem', marginBottom: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sage-light)', marginBottom: 8 }}>{tag}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--cream)', marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 14, color: 'rgba(244,241,234,0.6)', lineHeight: 1.7 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VENTURES ───────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 3rem' }}>
        <span className="section-label">Our Ventures</span>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
          fontWeight: 400, lineHeight: 1.2, marginBottom: '3rem',
        }}>
          We don&apos;t just consult — <em style={{ color: 'var(--forest-mid)' }}>we build.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { logo: '/logos/hocha-icon.png', name: 'hocha.town', desc: 'The tourism platform for Hochatown & Broken Bow — AI trip planner, burn ban widget, STR tax calculator, and native iOS app.', tag: 'Live Platform', href: 'https://hocha.town' },
            { logo: '/logos/fpm-logo.png', name: 'Frontier Property Management', desc: 'Full-service vacation rental management in the Broken Bow area. We operate in the same market we advise on.', tag: 'Active', href: 'https://rentwithfrontier.com' },
            { logo: '/logos/fp-logo.png', name: 'Frontier Photography', desc: 'Real estate, commercial, and event photography across Southeast Oklahoma. Elopements, cabin shoots, family sessions.', tag: 'Active', href: 'https://frontier.photos' },
          ].map(({ logo, name, desc, tag, href }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="venture-card">
              <div style={{ height: 56, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', padding: '8px 16px' }}>
                <Image src={logo} alt={name} width={140} height={48} style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, marginBottom: '0.5rem' }}>{name}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>{desc}</p>
              <span style={{ display: 'inline-block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--forest-mid)', background: 'var(--cream)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 2 }}>{tag}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── DUAL CTA ───────────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', margin: '0 3rem 5rem' }}>
        {[
          { title: 'For Investors', body: 'Exploring the Broken Bow market? Local market intelligence, builder connections, and operational support from someone who lives here.', href: '/investors', cta: 'Investor Resources →' },
          { title: 'For Businesses', body: 'Need more bookings, better tech, or a marketing strategy that actually works? We build tools for this market.', href: '/businesses', cta: 'Business Services →' },
        ].map(({ title, body, href, cta }) => (
          <div key={title} style={{ background: 'var(--warm-white)', padding: '3rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginBottom: '1rem' }}>{title}</h3>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{body}</p>
            <Link href={href} style={{ fontSize: 14, color: 'var(--forest-mid)', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.03em' }}>{cta}</Link>
          </div>
        ))}
      </section>
    </>
  );
}
