import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://fcgok.com"),
  title: {
    default: "Frontier Consulting Group | Small Business Consulting — Broken Bow & Hochatown",
    template: "%s | Frontier Consulting Group",
  },
  description:
    "Broken Bow's hometown consulting partner — travel & hospitality software, marketing, property management, and branding for small businesses in the Hochatown and Southeast Oklahoma area.",
  keywords: [
    "Frontier Consulting Group",
    "small business consulting",
    "Broken Bow Oklahoma",
    "Hochatown",
    "travel and hospitality software",
    "hospitality marketing",
    "vacation rental management",
    "tourism marketing Oklahoma",
    "small business consultant Broken Bow",
    "web design Broken Bow",
    "property management Hochatown",
    "Southeast Oklahoma business",
    "local business consulting",
    "cabin rental marketing",
    "tourism software",
  ],
  openGraph: {
    siteName: "Frontier Consulting Group",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Frontier Consulting Group",
              description:
                "Small business consulting, travel & hospitality software, marketing, and property management for the Broken Bow and Hochatown area.",
              url: "https://fcgok.com",
              email: "info@fcgok.com",
              telephone: "+1-580-207-7154",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Broken Bow",
                addressRegion: "OK",
                postalCode: "74728",
                addressCountry: "US",
              },
              areaServed: [
                {
                  "@type": "Place",
                  name: "Broken Bow, Oklahoma",
                },
                {
                  "@type": "Place",
                  name: "Hochatown, Oklahoma",
                },
                {
                  "@type": "Place",
                  name: "Blue Ridge, Georgia",
                },
              ],
              sameAs: [],
            }),
          }}
        />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
