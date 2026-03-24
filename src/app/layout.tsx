import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://fcgok.com"),
  title: {
    default: "Frontier Consulting Group | Technology, Consulting & Connections — Broken Bow & Hochatown",
    template: "%s | Frontier Consulting Group",
  },
  description:
    "We build the technology and connections that power Hochatown's next chapter. Local consulting, tourism software, investor advisory, and business growth for Broken Bow and Southeast Oklahoma.",
  keywords: [
    "Frontier Consulting Group",
    "Broken Bow Oklahoma",
    "Hochatown",
    "Hochatown consulting",
    "Broken Bow investor",
    "Hochatown investment",
    "Opportunity Zone Oklahoma",
    "tourism software",
    "travel and hospitality software",
    "vacation rental management",
    "Broken Bow property management",
    "tourism marketing Oklahoma",
    "Hochatown business",
    "Southeast Oklahoma business",
    "cabin rental marketing",
    "Broken Bow real estate",
    "Beavers Bend",
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
                "Technology, consulting, and investor connections for the Broken Bow and Hochatown market. Tourism software, marketing, property management, and local market advisory.",
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
                  name: "Southeast Oklahoma",
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
