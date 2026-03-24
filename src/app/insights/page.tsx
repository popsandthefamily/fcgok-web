import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights — Market Intel, Business Tips & Builder's Log",
  description:
    "Local market intelligence, business playbooks, and behind-the-scenes updates from the team building technology and connections in the Broken Bow and Hochatown market.",
  openGraph: {
    title: "Insights | Frontier Consulting Group",
    description:
      "Market intel, business tips, and builder updates from the Broken Bow and Hochatown market.",
    url: "https://fcgok.com/insights",
  },
  twitter: {
    title: "Insights | Frontier Consulting Group",
    description:
      "Market intel, business tips, and builder updates from the Broken Bow and Hochatown market.",
  },
  alternates: {
    canonical: "https://fcgok.com/insights",
  },
};

export default function Insights() {
  return (
    <div className="min-h-screen bg-forest-dark text-cream">
      {/* Header */}
      <section className="relative pt-32 pb-20">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">
              Insights
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Thinking out loud about{" "}
              <span className="bg-gradient-to-r from-copper to-copper-light bg-clip-text text-transparent">
                this market.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/50">
              Local market intelligence, business playbooks, and
              behind-the-scenes updates on what we&apos;re building. Written
              from the ground in Broken Bow and Hochatown.
            </p>
          </div>
        </div>
      </section>

      {/* Content Pillars */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Market Intel</h3>
              <p className="mt-2 text-sm text-cream/50">
                Informed local commentary on the Broken Bow investment
                landscape, STR trends, and development activity. For
                investors and anyone watching this market.
              </p>
            </div>

            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.994 2.994 0 00-1.166.599m19.332 0A2.994 2.994 0 0022.166 9.948M4.5 9.349l1.648-7.093A.75.75 0 016.882 1.5h10.236a.75.75 0 01.734.756L19.5 9.35" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Business Playbooks</h3>
              <p className="mt-2 text-sm text-cream/50">
                Tactical content for local business owners — SEO, Google
                Business, tax tips, and marketing strategies that actually
                work in this market.
              </p>
            </div>

            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.181A2.255 2.255 0 013 16.272V6.728a2.255 2.255 0 013.036-2.079l5.384 3.182m0 0L16.804 4.65a2.255 2.255 0 013.196 0l.001.001a2.255 2.255 0 010 3.196l-5.384 3.182m0 0l5.384 3.182a2.255 2.255 0 010 3.196l-.001.001a2.255 2.255 0 01-3.196 0L11.42 15.17z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Builder&apos;s Log</h3>
              <p className="mt-2 text-sm text-cream/50">
                Behind-the-scenes updates on what we&apos;re building —
                shipping features, launching products, and the decisions
                behind our ventures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex rounded-full border border-copper/20 bg-copper/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-copper">
              Coming Soon
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">
              First posts are on the way.
            </h2>
            <p className="mt-4 text-cream/50">
              We&apos;re working on our first round of insights — including
              market analysis for Hochatown investors and tactical playbooks
              for local businesses. Check back soon, or get in touch to be
              notified when we publish.
            </p>
            <a
              href="/#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-copper px-6 py-3 text-sm font-semibold text-cream transition hover:bg-copper-light"
            >
              Notify me
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
