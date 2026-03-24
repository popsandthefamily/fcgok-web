import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers — Jobs in Hochatown & Broken Bow",
  description:
    "Join the Frontier team. We're a small, flexible crew building technology and connections in the Broken Bow and Hochatown market. See open positions.",
  openGraph: {
    title: "Careers | Frontier Consulting Group",
    description:
      "Join the Frontier team. Small, flexible, building in the Broken Bow and Hochatown market.",
    url: "https://fcgok.com/careers",
  },
  twitter: {
    title: "Careers | Frontier Consulting Group",
    description:
      "Join the Frontier team. Small, flexible, building in the Broken Bow and Hochatown market.",
  },
  alternates: {
    canonical: "https://fcgok.com/careers",
  },
};

export default function Careers() {
  return (
    <div className="min-h-screen bg-forest-dark text-cream">
      {/* Header */}
      <section className="relative pt-32 pb-20">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">
              Careers
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Work with us
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/50">
              Frontier Consulting Group is a small, flexible team based in
              Broken Bow, Oklahoma. We value people who are self-starters,
              genuinely curious, and care about the communities they work in.
              No corporate red tape — just real work with real impact on local
              businesses and the people behind them.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight md:text-3xl">
            How we work
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
              <h3 className="font-bold text-copper">Ownership</h3>
              <p className="mt-2 text-sm text-cream/50">
                We&apos;re a small team. Everyone owns their work end to end.
                No hand-offs, no waiting for approval — if you see something
                that needs doing, do it.
              </p>
            </div>
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
              <h3 className="font-bold text-copper">Local first</h3>
              <p className="mt-2 text-sm text-cream/50">
                We care about this community. The work we do directly impacts
                the businesses and people in the Broken Bow and Hochatown
                area. That matters to us.
              </p>
            </div>
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
              <h3 className="font-bold text-copper">Builder mindset</h3>
              <p className="mt-2 text-sm text-cream/50">
                We ship software, manage properties, shoot photos, and
                connect people. If you like building things and making them
                better, you&apos;ll fit right in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-2xl font-bold tracking-tight md:text-3xl">
            Open positions
          </h2>

          {/* Job Card */}
          <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 md:p-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-copper/20 bg-copper/5 px-3 py-1">
              <span className="text-xs font-medium text-copper">
                Part-Time &middot; Commission-Based
              </span>
            </div>
            <h3 className="text-xl font-bold md:text-2xl">
              Local Community Rep — Hochatown / Broken Bow
            </h3>
            <p className="mt-4 max-w-2xl leading-relaxed text-cream/50">
              We&apos;re looking for a part-time local community rep in the
              Hochatown/Broken Bow area. Flexible hours, work on your own
              schedule. You&apos;ll be connecting with local businesses and
              property owners on behalf of our clients. Great fit for someone
              who knows the area, loves talking to people, and wants to earn
              extra income. Commission-based with bonuses.
            </p>
            <div className="mt-8">
              <a
                href="mailto:info@fcgok.com?subject=Community%20Rep%20Position%20—%20Interest"
                className="inline-flex items-center gap-2 rounded-full bg-copper px-6 py-3 text-sm font-semibold text-cream transition hover:bg-copper-light"
              >
                Apply via Email
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
