import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Frontier Consulting Group | Broken Bow, OK Studio",
  description:
    "Software, branding, tourism platforms, and media for local businesses in Broken Bow, Oklahoma. Property management, photography, and community platforms for Southeast Oklahoma and beyond.",
  openGraph: {
    title: "Frontier Consulting Group | Technology & Creative Studio",
    description:
      "Software, branding, and media studio in Broken Bow, Oklahoma helping local businesses and communities grow.",
    url: "https://fcgok.com",
  },
  twitter: {
    title: "Frontier Consulting Group | Technology & Creative Studio",
    description:
      "Software, branding, and media studio in Broken Bow, Oklahoma helping local businesses and communities grow.",
  },
  alternates: {
    canonical: "https://fcgok.com",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-dark text-white">
      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-xs font-medium tracking-wide text-gold">
                Broken Bow, Oklahoma
              </span>
            </div>

            <h1
              className="animate-fade-up text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl"
              style={{ animationDelay: "0.1s" }}
            >
              We build the{" "}
              <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                software
              </span>{" "}
              and{" "}
              <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                brands
              </span>{" "}
              that power local business.
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-white/50"
              style={{ animationDelay: "0.2s" }}
            >
              We work with businesses, property owners, and communities across
              Southeast Oklahoma and beyond — building the tools and brands they
              need to grow.
            </p>

            <div
              className="animate-fade-up mt-10 flex flex-wrap gap-4"
              style={{ animationDelay: "0.3s" }}
            >
              <a
                href="#portfolio"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-white/90"
              >
                View Portfolio
                <svg
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
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
              <a
                href="#contact"
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative border-t border-white/5 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              About
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Technology and creative studio in{" "}
              <span className="text-gold">Broken Bow, Oklahoma</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/50">
              Frontier Consulting Group develops software, destination
              platforms, and media that help local businesses and markets
              grow. Our work spans tourism technology, property management,
              brand design, and commercial photography — with projects rooted
              in Broken Bow, Oklahoma and expanding to markets like Blue
              Ridge, Georgia.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio / Divisions */}
      <section id="portfolio" className="relative border-t border-white/5 py-32">
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-gold/3 blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-20 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              Portfolio
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Our divisions
            </h2>
            <p className="mt-4 text-lg text-white/50">
              From software to destination platforms to commercial media.
            </p>
          </div>

          {/* Software + Design Card */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-white/10 md:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
                  <svg
                    className="h-4 w-4 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gold">
                    Core Division
                  </span>
                </div>
                <h3 className="text-2xl font-bold md:text-3xl">
                  Software, Design &amp; Branding
                </h3>
                <p className="mt-3 max-w-xl text-white/50">
                  Full-stack software engineering, product design, and brand
                  identity for startups and established businesses. We build
                  web applications, mobile apps, SaaS platforms, and the visual
                  identities that tie them together.
                </p>
              </div>
              <div className="hidden h-40 w-40 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] lg:flex">
                <Image
                  src="/logos/fcg-icon.png"
                  alt="FCG"
                  width={80}
                  height={80}
                  className="h-20 w-auto invert brightness-200 opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Helpible / Tourism Platforms */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-white/10 md:p-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/5 px-3 py-1">
              <svg
                className="h-4 w-4 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558"
                />
              </svg>
              <span className="text-xs font-medium text-purple-400">
                Powered by Helpible
              </span>
            </div>
            <h3 className="text-2xl font-bold md:text-3xl">
              Community Tourism Platforms
            </h3>
            <p className="mt-3 max-w-xl text-white/50">
              Hyperlocal tourism guides that connect visitors to the best
              restaurants, activities, and experiences in town. Each platform is
              built on our Helpible engine.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {/* hocha.town */}
              <a
                href="https://hocha.town"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-purple-900/20 to-purple-800/5 p-6 transition hover:border-purple-400/20"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src="/logos/hocha-icon.png"
                    alt="hocha.town"
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl"
                  />
                  <div>
                    <div className="font-semibold">hocha.town</div>
                    <div className="text-sm text-white/40">
                      Hochatown &amp; Broken Bow, OK
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-purple-400 opacity-0 transition group-hover:opacity-100">
                  Visit site
                  <ArrowIcon />
                </div>
              </a>

              {/* blueridge.town */}
              <a
                href="https://blueridge.town"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-emerald-900/20 to-emerald-800/5 p-6 transition hover:border-emerald-400/20"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src="/logos/blueridge-icon.png"
                    alt="blueridge.town"
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl"
                  />
                  <div>
                    <div className="font-semibold">blueridge.town</div>
                    <div className="text-sm text-white/40">
                      Blue Ridge, GA
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-emerald-400 opacity-0 transition group-hover:opacity-100">
                  Visit site
                  <ArrowIcon />
                </div>
              </a>
            </div>
          </div>

          {/* Property Management + Photography — 2 col */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Frontier Property Management */}
            <a
              href="https://rentwithfrontier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-white/10 md:p-10"
            >
              <div className="mb-6">
                <Image
                  src="/logos/fpm-logo-white.png"
                  alt="Frontier Property Management"
                  width={160}
                  height={60}
                  className="h-14 w-auto"
                />
              </div>
              <h3 className="text-xl font-bold">
                Frontier Property Management
              </h3>
              <p className="mt-2 text-sm text-white/50">
                Professional property management for vacation rentals and
                long-term properties in the Broken Bow area. Full-service from
                listing to guest experience.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gold opacity-0 transition group-hover:opacity-100">
                rentwithfrontier.com
                <ArrowIcon />
              </div>
            </a>

            {/* Frontier Photography */}
            <a
              href="https://frontier.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-white/10 md:p-10"
            >
              <div className="mb-6">
                <Image
                  src="/logos/fp-logo.png"
                  alt="Frontier Photography"
                  width={160}
                  height={60}
                  className="h-12 w-auto invert brightness-200"
                />
              </div>
              <h3 className="text-xl font-bold">Frontier Photography</h3>
              <p className="mt-2 text-sm text-white/50">
                Real estate, commercial, event, and portrait photography.
                Capturing properties, people, and places across Southeast
                Oklahoma.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gold opacity-0 transition group-hover:opacity-100">
                frontier.photos
                <ArrowIcon />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="relative border-t border-white/5 py-32"
      >
        <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-gold/3 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              Contact
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Let&apos;s work together
            </h2>
            <p className="mt-4 text-lg text-white/50">
              Whether you need software, branding, or a property manager — we&apos;re
              here to help.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
            <a
              href="mailto:info@fcgok.com"
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center transition hover:border-gold/20"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <svg
                  className="h-5 w-5 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium text-white/80">Email</div>
              <span className="mt-1 block text-sm text-gold transition group-hover:text-gold-light">
                info@fcgok.com
              </span>
            </a>

            <a
              href="tel:+15802077154"
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center transition hover:border-gold/20"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <svg
                  className="h-5 w-5 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium text-white/80">Phone</div>
              <span className="mt-1 block text-sm text-gold transition group-hover:text-gold-light">
                (580) 207-7154
              </span>
            </a>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <svg
                  className="h-5 w-5 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium text-white/80">Location</div>
              <p className="mt-1 text-sm text-white/40">
                Broken Bow, OK 74728
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArrowIcon() {
  return (
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
  );
}
