import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import BuggyWheel from '@/components/BuggyWheel';

export const metadata: Metadata = {
  title: 'Our Ventures — hocha.town, Frontier Intelligence, Property Management & Photography',
  description: 'hocha.town tourism platform, Frontier Intelligence investor software, Frontier Property Management, and Frontier Photography — businesses we built and operate in the Broken Bow and Hochatown market.',
  openGraph: {
    title: 'Ventures — Frontier Consulting Group',
    description: 'hocha.town, Frontier Intelligence, Frontier Property Management, and Frontier Photography. Four businesses built and operated in Broken Bow and Hochatown.',
    url: 'https://fcgok.com/ventures',
  },
  twitter: {
    title: 'Ventures — Frontier Consulting Group',
    description: 'hocha.town, Frontier Intelligence, Frontier Property Management, and Frontier Photography. Four businesses built and operated in Broken Bow and Hochatown.',
  },
  alternates: { canonical: 'https://fcgok.com/ventures' },
};

interface Venture {
  logo?: string;
  logoNode?: ReactNode;
  name: string;
  tag: string;
  href: string;
  body: string;
  detail: string;
}

const VENTURES: Venture[] = [
  {
    logo: '/logos/hocha-icon.png',
    name: 'hocha.town',
    tag: 'Tourism Platform',
    href: 'https://hocha.town',
    body: 'A full-featured tourism platform for Hochatown and Broken Bow. Built with Next.js, Supabase, and Groq/LLaMA — featuring an AI trip planner, real-time burn ban data from Oklahoma Forestry Services, an STR tax calculator, and a native iOS app on the App Store.',
    detail: 'Two-sided marketplace connecting visitors with cabins, restaurants, and activities. The data layer behind the investor intelligence.',
  },
  {
    logoNode: <BuggyWheel size={36} strokeWidth={6} style={{ color: 'var(--forest)' }} />,
    name: 'Frontier Intelligence',
    tag: 'Investor Software',
    href: '/portal',
    body: 'A private intelligence platform for investors operating in Southeast Oklahoma. Ingests SEC filings, industry publications, and podcast transcripts, then summarizes what matters — tracked entities, deal flow, regulatory shifts, and market signals — in a branded portal clients can log into daily.',
    detail: 'Same technical foundation as hocha.town. Where hocha.town serves visitors, Frontier Intelligence serves the capital allocators behind the investments.',
  },
  {
    logo: '/logos/fpm-logo.png',
    name: 'Frontier Property Management',
    tag: 'STR Operations',
    href: 'https://rentwithfrontier.com',
    body: 'Full-service vacation rental management in the Broken Bow area. Listing optimization, guest communication, cleaning coordination, and maintenance — operating in the same market we advise on.',
    detail: "This is the credibility that makes our investor advisory real: we manage properties, so we know what actually performs.",
  },
  {
    logo: '/logos/fp-logo.png',
    name: 'Frontier Photography',
    tag: 'Visual Media',
    href: 'https://www.frontier.photos/',
    body: 'Real estate, commercial, and event photography across Southeast Oklahoma. Elopements, cabin shoots, family and pet photos in the Beavers Bend area.',
    detail: 'Great photography is the first impression for every cabin listing, business page, and event in the area.',
  },
];

export default function VenturesPage() {
  return (
    <>
      <section className="mobile-pad" style={{ background: 'var(--forest)', padding: '5rem 3rem' }}>
        <span className="section-label section-label--light">Portfolio</span>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
          color: 'var(--cream)', fontWeight: 400, maxWidth: 600, lineHeight: 1.15,
        }}>
          Four businesses. <em>One market.</em> Total conviction.
        </h1>
      </section>

      <section className="mobile-pad" style={{ padding: '5rem 3rem' }}>
        <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {VENTURES.map(({ logo, logoNode, name, tag, href, body, detail }) => (
            <div key={name} className="mobile-stack" style={{
              background: 'var(--warm-white)', padding: '3rem',
              display: 'grid', gridTemplateColumns: '220px 1fr', gap: '3rem', alignItems: 'start',
            }}>
              <div>
                <div style={{
                  height: 64, background: 'var(--cream)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 4, marginBottom: '1rem', border: '1px solid var(--border)',
                  padding: '10px 20px',
                }}>
                  {logoNode ?? (
                    <Image src={logo!} alt={name} width={140} height={48} style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
                  )}
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginBottom: '0.5rem' }}>{name}</h2>
                <span style={{
                  display: 'inline-block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--forest-mid)', background: 'var(--cream)', border: '1px solid var(--border)',
                  padding: '3px 10px', borderRadius: 2, marginBottom: '1rem',
                }}>
                  {tag}
                </span>
                <a href={href} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', fontSize: 13, color: 'var(--forest-mid)', fontWeight: 500,
                  textDecoration: 'none', letterSpacing: '0.03em',
                }}>
                  Visit site &rarr;
                </a>
              </div>
              <div>
                <p style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '1rem' }}>{body}</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
