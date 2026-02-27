import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Frontier Consulting Group | Software, Design & Branding",
  description:
    "A multi-disciplinary studio in Broken Bow, Oklahoma — software engineering, design, branding, property management, and photography. Led by Hunter Collins.",
  keywords: [
    "Frontier Consulting Group",
    "software development",
    "web design",
    "branding",
    "property management",
    "photography",
    "Broken Bow Oklahoma",
    "startup studio",
  ],
  openGraph: {
    title: "Frontier Consulting Group | Software, Design & Branding",
    description:
      "A multi-disciplinary studio — software, design, property management, and photography — from Broken Bow, Oklahoma.",
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
      <body className={`${dmSans.className} antialiased`}>{children}</body>
    </html>
  );
}
