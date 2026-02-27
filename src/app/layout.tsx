import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frontier Consulting Group LLC",
  description:
    "Software, design, branding, property management, and photography services in Broken Bow, Oklahoma.",
  keywords: [
    "Frontier Consulting Group",
    "software development",
    "branding",
    "property management",
    "photography",
    "Broken Bow",
    "Oklahoma",
  ],
  openGraph: {
    title: "Frontier Consulting Group LLC",
    description:
      "Software, design, branding, property management, and photography services in Broken Bow, Oklahoma.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
