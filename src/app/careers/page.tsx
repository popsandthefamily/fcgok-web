import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers — Jobs in Hochatown & Broken Bow",
  description:
    "Now hiring: part-time community rep in the Hochatown/Broken Bow area. Flexible hours, commission-based with bonuses. Connect with local businesses on your own schedule.",
  openGraph: {
    title: "Careers | Frontier Consulting Group",
    description:
      "Now hiring in Hochatown/Broken Bow. Part-time community rep — flexible hours, commission-based with bonuses.",
    url: "https://fcgok.com/careers",
  },
  twitter: {
    title: "Careers | Frontier Consulting Group",
    description:
      "Now hiring in Hochatown/Broken Bow. Part-time community rep — flexible hours, commission-based with bonuses.",
  },
  alternates: {
    canonical: "https://fcgok.com/careers",
  },
};

export default function Careers() {
  return (
    <div className="min-h-screen bg-slate-dark text-white">
      {/* Header */}
      <section className="relative pt-32 pb-20">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              Careers
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Work with us
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/50">
              Frontier Consulting Group is a small, flexible team based in
              Broken Bow, Oklahoma. We value people who are self-starters,
              genuinely curious, and care about the communities they work in. No
              corporate red tape — just real work with real impact on local
              businesses and the people behind them.
            </p>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="relative border-t border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-2xl font-bold tracking-tight md:text-3xl">
            Open positions
          </h2>

          {/* Job Card */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 md:p-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
              <span className="text-xs font-medium text-gold">
                Part-Time &middot; Commission-Based
              </span>
            </div>
            <h3 className="text-xl font-bold md:text-2xl">
              Local Community Rep — Hochatown / Broken Bow
            </h3>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/50">
              Frontier Consulting Group is looking for a part-time local
              community rep in the Hochatown/Broken Bow area. Flexible hours,
              work on your own schedule. You&apos;ll be connecting with local
              businesses and property owners on behalf of our clients. Great fit
              for someone who knows the area, loves talking to people, and wants
              to earn extra income. Commission-based with bonuses.
            </p>
            <div className="mt-8">
              <a
                href="mailto:info@fcgok.com?subject=Community%20Rep%20Position%20—%20Interest"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-light"
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
