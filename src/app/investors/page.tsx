import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Investors — Broken Bow & Hochatown Market Advisory",
  description:
    "Exploring investment opportunities in Broken Bow and Hochatown, Oklahoma? Local market intelligence, builder connections, and operational support from the team that lives and builds here.",
  openGraph: {
    title: "For Investors | Frontier Consulting Group",
    description:
      "Local market intelligence and connections for investors exploring the Broken Bow and Hochatown, Oklahoma market.",
    url: "https://fcgok.com/investors",
  },
  twitter: {
    title: "For Investors | Frontier Consulting Group",
    description:
      "Local market intelligence and connections for investors exploring the Broken Bow and Hochatown, Oklahoma market.",
  },
  alternates: {
    canonical: "https://fcgok.com/investors",
  },
};

export default function Investors() {
  return (
    <div className="min-h-screen bg-forest-dark text-cream">
      {/* Header */}
      <section className="relative pt-32 pb-20">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">
              For Investors
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Your trusted guide to the{" "}
              <span className="bg-gradient-to-r from-copper to-copper-light bg-clip-text text-transparent">
                Broken Bow market.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/50">
              The money is coming from Dallas, Tulsa, and OKC. But the
              investors who win here are the ones who have someone local in
              their corner — someone who knows which builders deliver, which
              locations actually rent, and how this market really works.
            </p>
          </div>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              The opportunity
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
                <div className="text-2xl font-bold text-copper">
                  Opportunity Zone
                </div>
                <p className="mt-2 text-sm text-cream/40">
                  Hochatown sits in a federal Opportunity Zone, offering
                  capital gains tax benefits for qualifying long-term
                  investments.
                </p>
              </div>
              <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
                <div className="text-2xl font-bold text-copper">
                  2.2M Visitors
                </div>
                <p className="mt-2 text-sm text-cream/40">
                  Beavers Bend State Park draws over 2.2 million visitors
                  annually — and the area&apos;s tourism infrastructure is
                  still expanding.
                </p>
              </div>
              <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
                <div className="text-2xl font-bold text-copper">
                  Casino Development
                </div>
                <p className="mt-2 text-sm text-cream/40">
                  The Choctaw Resort &amp; Casino is under development,
                  bringing significant new demand for lodging, dining, and
                  entertainment.
                </p>
              </div>
              <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
                <div className="text-2xl font-bold text-copper">
                  Maturing STR Market
                </div>
                <p className="mt-2 text-sm text-cream/40">
                  The short-term rental market is professionalizing. Retail
                  corridors are expanding. Early movers with the right
                  strategy are well-positioned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What I Bring */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              What I bring to the table
            </h2>
            <div className="mt-10 space-y-8">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10">
                  <svg className="h-5 w-5 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold">Local market intelligence</h3>
                  <p className="mt-1 text-cream/50">
                    I live here. I know which neighborhoods rent, which
                    developments are delivering, what the real occupancy rates
                    look like, and where the next growth is happening.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10">
                  <svg className="h-5 w-5 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold">Builder &amp; operator connections</h3>
                  <p className="mt-1 text-cream/50">
                    I connect you with the builders, property managers, and
                    operators who actually deliver. Not a directory — a
                    curated introduction based on your specific needs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10">
                  <svg className="h-5 w-5 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold">Tourism platform data</h3>
                  <p className="mt-1 text-cream/50">
                    Through hocha.town, I have real traffic data on what
                    visitors search for, where they go, and what they book.
                    That&apos;s market intelligence you can&apos;t get from a
                    spreadsheet.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10">
                  <svg className="h-5 w-5 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.181A2.255 2.255 0 013 16.272V6.728a2.255 2.255 0 013.036-2.079l5.384 3.182m0 0L16.804 4.65a2.255 2.255 0 013.196 0l.001.001a2.255 2.255 0 010 3.196l-5.384 3.182m0 0l5.384 3.182a2.255 2.255 0 010 3.196l-.001.001a2.255 2.255 0 01-3.196 0L11.42 15.17z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold">Post-investment execution</h3>
                  <p className="mt-1 text-cream/50">
                    I don&apos;t disappear after the introduction. I help with
                    marketing, software, property management, and the
                    operational details that determine whether an investment
                    performs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              How it works
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/50">
              This is informal advisory, not a brokerage. You&apos;re not
              signing a retainer or getting a pitch deck. You&apos;re getting
              a phone call with someone who lives in the market, operates in
              the market, and can give you a straight answer about whether
              your investment thesis makes sense here.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-cream/50">
              If the opportunity is real, I&apos;ll connect you with the right
              people to execute — builders, property managers, attorneys,
              anyone you need. And if you need help with marketing, tech, or
              operations after you invest, that&apos;s what Frontier
              Consulting Group does.
            </p>

            {/* Disclaimer */}
            <div className="mt-12 rounded-2xl border border-cream/10 bg-cream/[0.02] p-6">
              <p className="text-xs leading-relaxed text-cream/40">
                <strong className="text-cream/60">Disclaimer:</strong>{" "}
                Frontier Consulting Group is not a registered financial
                advisor, broker-dealer, or real estate broker. We provide
                local market knowledge, business consulting, technology
                services, and introductions. Nothing on this page constitutes
                investment advice, and we do not manage, solicit, or recommend
                specific investments. Always consult licensed professionals
                for financial, legal, and real estate decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Exploring the Broken Bow market?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-cream/50">
            Tell me what you&apos;re looking at. I&apos;ll give you a
            straight answer about the market — no sales pitch, just local
            knowledge.
          </p>
          <a
            href="/#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-copper px-8 py-3 text-sm font-semibold text-cream transition hover:bg-copper-light"
          >
            Get in Touch
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
