import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://fcgok.com'),
  title: {
    default: 'Frontier Consulting Group | Technology, Consulting & Connections — Broken Bow & Hochatown',
    template: '%s | Frontier Consulting Group',
  },
  description:
    "Frontier Consulting Group sits at the intersection of technology, tourism, and local knowledge in one of Oklahoma's fastest-moving markets. We connect investors with opportunity and help businesses grow.",
  openGraph: {
    title: 'Frontier Consulting Group',
    description: 'Technology, consulting, and local market intelligence for Broken Bow & Hochatown.',
    url: 'https://fcgok.com',
    siteName: 'Frontier Consulting Group',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'Frontier Consulting Group',
              description: 'Technology, consulting, and investor connections for the Broken Bow and Hochatown market.',
              url: 'https://fcgok.com',
              email: 'info@fcgok.com',
              telephone: '+1-580-207-7154',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Broken Bow',
                addressRegion: 'OK',
                postalCode: '74728',
                addressCountry: 'US',
              },
              areaServed: [
                { '@type': 'Place', name: 'Broken Bow, Oklahoma' },
                { '@type': 'Place', name: 'Hochatown, Oklahoma' },
                { '@type': 'Place', name: 'Southeast Oklahoma' },
              ],
            }),
          }}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
