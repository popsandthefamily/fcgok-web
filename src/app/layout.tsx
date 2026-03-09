import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Frontier Consulting Group | Technology & Creative Studio",
  description:
    "A technology and creative studio in Broken Bow, Oklahoma building software, tourism platforms, brands, and media that help local businesses and communities grow.",
  keywords: [
    "Frontier Consulting Group",
    "software development",
    "tourism technology",
    "branding",
    "property management",
    "photography",
    "Broken Bow Oklahoma",
    "Blue Ridge Georgia",
  ],
  openGraph: {
    title: "Frontier Consulting Group | Technology & Creative Studio",
    description:
      "A technology and creative studio in Broken Bow, Oklahoma building software, tourism platforms, brands, and media for growing communities.",
    type: "website",
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
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
