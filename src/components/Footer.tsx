import Link from 'next/link';

const LOGO_MARK = (
  <div style={{
    width: 28, height: 28, background: 'var(--gold-light)', flexShrink: 0,
    clipPath: 'polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%)',
  }} />
);

export default function Footer() {
  return (
    <>
      <footer style={{
        background: '#0f1f17',
        padding: '4rem 3rem 0',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
        gap: '3rem',
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            {LOGO_MARK}
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'rgba(244,241,234,0.9)' }}>
              Frontier Consulting Group
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(244,241,234,0.4)', lineHeight: 1.7, maxWidth: 240 }}>
            Technology, consulting, and local market intelligence for investors and businesses
            in Broken Bow and Hochatown, Oklahoma.
          </p>
        </div>

        {/* Company */}
        <FooterCol title="Company">
          <FooterLink href="/about/hunter">Hunter Collins</FooterLink>
          <FooterLink href="/ventures">Our Ventures</FooterLink>
          <FooterLink href="/careers">Careers</FooterLink>
        </FooterCol>

        {/* Work */}
        <FooterCol title="Work With Us">
          <FooterLink href="/investors">For Investors</FooterLink>
          <FooterLink href="/businesses">For Businesses</FooterLink>
          <FooterLink href="https://rentwithfrontier.com">Property Management</FooterLink>
        </FooterCol>

        {/* Contact */}
        <FooterCol title="Contact">
          <FooterLink href="mailto:info@fcgok.com">info@fcgok.com</FooterLink>
          <FooterLink href="tel:+15802077154">(580) 207-7154</FooterLink>
          <span style={{ display: 'block', fontSize: 14, color: 'rgba(244,241,234,0.55)', marginBottom: 8 }}>
            Broken Bow, OK 74728
          </span>
        </FooterCol>
      </footer>

      {/* Bottom bar */}
      <div style={{
        background: '#0f1f17',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '1.25rem 3rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontSize: 12, color: 'rgba(244,241,234,0.3)' }}>
          &copy; 2026 Frontier Consulting Group LLC. Broken Bow, Oklahoma.
        </p>
        <p style={{ fontSize: 12, color: 'rgba(244,241,234,0.2)' }}>
          Not a registered broker-dealer or financial advisor.
        </p>
      </div>
    </>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{
        fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'rgba(244,241,234,0.35)', marginBottom: '1rem',
      }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel');
  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      style={{ display: 'block', fontSize: 14, color: 'rgba(244,241,234,0.6)', marginBottom: 8, textDecoration: 'none' }}
    >
      {children}
    </Link>
  );
}
