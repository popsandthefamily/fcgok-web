import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Ventures — What We Build",
  description:
    "Our own businesses, built with the same tools and strategies we bring to clients. Tourism software, property management, photography, and more.",
  openGraph: {
    title: "Ventures | Frontier Consulting Group",
    description:
      "Tourism software, property management, photography — built and operated in the Broken Bow market.",
    url: "https://fcgok.com/ventures",
  },
  twitter: {
    title: "Ventures | Frontier Consulting Group",
    description:
      "Tourism software, property management, photography — built and operated in the Broken Bow market.",
  },
  alternates: {
    canonical: "https://fcgok.com/ventures",
  },
};

export default function Ventures() {
  return (
    <div className="min-h-screen bg-forest-dark text-cream">
      {/* Header */}
      <section className="relative pt-32 pb-20">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">
              Our Ventures
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              We don&apos;t just consult —{" "}
              <span className="bg-gradient-to-r from-copper to-copper-light bg-clip-text text-transparent">
                we build.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/50">
              These are our own businesses, built with the same tools and
              strategies we bring to our clients. We operate in the same
              market we advise on — that&apos;s credibility you can&apos;t
              fake.
            </p>
          </div>
        </div>
      </section>

      {/* hocha.town */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <a
            href="https://hocha.town"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 transition hover:border-copper/20 md:p-10"
          >
            <div className="flex items-center gap-4">
              <Image
                src="/logos/hocha-icon.png"
                alt="hocha.town"
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl"
              />
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">hocha.town</h2>
                <p className="text-sm text-cream/40">
                  The tourism platform for Hochatown &amp; Broken Bow
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-cream/60">
              A full-featured tourism platform with an AI-powered trip planner,
              real-time burn ban widget, STR tax calculator, event listings,
              and local business directory. Built with custom software and
              real local knowledge — the features no one else has built for
              this market.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-copper transition group-hover:text-copper-light">
              Visit hocha.town
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </a>
        </div>
      </section>

      {/* Frontier Property Management */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <a
            href="https://rentwithfrontier.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 transition hover:border-copper/20 md:p-10"
          >
            <div className="mb-6">
              <Image
                src="/logos/fpm-logo-white.png"
                alt="Frontier Property Management"
                width={200}
                height={60}
                className="h-14 w-auto"
              />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">
              Frontier Property Management
            </h2>
            <p className="mt-4 max-w-2xl text-cream/60">
              Full-service vacation rental management for the Broken Bow and
              Hochatown area. We manage cabins with the same care and systems
              we recommend to our consulting clients — because we operate in
              the same market we advise on. From listing optimization to guest
              communication, cleaning coordination, and maintenance.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-copper transition group-hover:text-copper-light">
              Visit rentwithfrontier.com
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </a>
        </div>
      </section>

      {/* Frontier Photography */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <a
            href="https://frontier.photos"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 transition hover:border-copper/20 md:p-10"
          >
            <div className="mb-6">
              <Image
                src="/logos/fp-logo.png"
                alt="Frontier Photography"
                width={200}
                height={60}
                className="h-12 w-auto invert brightness-200"
              />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">
              Frontier Photography
            </h2>
            <p className="mt-4 max-w-2xl text-cream/60">
              Real estate, commercial, and event photography across Southeast
              Oklahoma. Elopements, cabin shoots, and commercial work —
              visual proof we&apos;re embedded in this community. Great photos
              fill cabins and seats.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-copper transition group-hover:text-copper-light">
              Visit frontier.photos
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </a>
        </div>
      </section>

      {/* SofaOps */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 md:p-10">
            <div className="mb-4 inline-flex rounded-full border border-copper/20 bg-copper/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-copper">
              Coming Soon
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">SofaOps</h2>
            <p className="mt-4 max-w-2xl text-cream/60">
              A family planner app to help busy households coordinate
              schedules, tasks, and meals. SofaOps extends our product
              development beyond the local tourism market — proving we can
              build consumer products at scale.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
