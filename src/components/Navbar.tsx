'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/about', label: 'About' },
  { href: '/about/hunter', label: 'Hunter Collins' },
  { href: '/ventures', label: 'Ventures' },
  { href: '/investors', label: 'For Investors' },
  { href: '/businesses', label: 'For Businesses' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--forest)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 3rem', height: 64,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <Image
          src="/logos/fcg-logo-white.png"
          alt="Frontier Consulting Group"
          width={200}
          height={50}
          style={{ height: 36, width: 'auto' }}
          priority
        />
      </Link>

      {/* Desktop links */}
      <div className="hide-mobile" style={{ display: 'flex' }}>
        {links.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{
              color: active ? 'var(--cream)' : 'rgba(244,241,234,0.65)',
              fontSize: 13, fontWeight: 400, letterSpacing: '0.05em',
              textTransform: 'uppercase', padding: '0 1.1rem',
              height: 64, display: 'flex', alignItems: 'center',
              textDecoration: 'none',
              borderBottom: active ? '2px solid var(--gold-light)' : '2px solid transparent',
              transition: 'color 0.2s, border-color 0.2s',
            }}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Desktop CTA */}
      <Link href="/investors#contact" className="hide-mobile" style={{
        background: 'var(--gold-light)', color: 'var(--forest)',
        fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', padding: '8px 20px',
        borderRadius: 2, textDecoration: 'none',
        transition: 'background 0.2s',
      }}>
        Get in Touch
      </Link>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'none', background: 'none', border: 'none',
          color: 'var(--cream)', cursor: 'pointer', padding: 8,
        }}
        className="mobile-toggle"
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: 'var(--forest)', borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '1rem 1.5rem', zIndex: 99,
        }}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{
              display: 'block', padding: '0.75rem 0',
              color: 'rgba(244,241,234,0.7)', fontSize: 14,
              textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {label}
            </Link>
          ))}
          <Link href="/investors#contact" onClick={() => setOpen(false)} style={{
            display: 'block', marginTop: '1rem',
            background: 'var(--gold-light)', color: 'var(--forest)',
            textAlign: 'center', padding: '10px', borderRadius: 2,
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Get in Touch
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
