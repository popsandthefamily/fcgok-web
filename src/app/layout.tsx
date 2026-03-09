import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://fcgok.com"),
  title: {
    default: "Frontier Consulting Group | Technology & Creative Studio in Broken Bow, OK",
    template: "%s | Frontier Consulting Group",
  },
  description:
    "A technology and creative studio in Broken Bow, Oklahoma building software, tourism platforms, brands, and media that help local businesses and communities grow.",
  openGraph: {
    title: "Frontier Consulting Group | Technology & Creative Studio",
    description:
      "A technology and creative studio in Broken Bow, Oklahoma building software, tourism platforms, brands, and media for growing communities.",
    url: "https://fcgok.com",
    siteName: "Frontier Consulting Group",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frontier Consulting Group | Technology & Creative Studio",
    description:
      "A technology and creative studio in Broken Bow, Oklahoma building software, tourism platforms, brands, and media for growing communities.",
  },
  alternates: {
    canonical: "https://fcgok.com",
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
                "Technology and creative studio building software, tourism platforms, brands, and media for local businesses.",
              url: "https://fcgok.com",
              email: "info@fcgok.com",
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
