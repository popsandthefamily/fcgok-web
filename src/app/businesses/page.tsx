import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cabin Websites, Property Management & Marketing — Broken Bow",
  description:
    "Broken Bow cabin website design, Hochatown property management, and local SEO for tourism businesses. Custom booking sites, Google optimization, and marketing from the team behind hocha.town.",
  openGraph: {
    title: "For Businesses | Frontier Consulting Group",
    description:
      "Cabin websites, property management, and local SEO for businesses in the Broken Bow and Hochatown market.",
    url: "https://fcgok.com/businesses",
  },
  twitter: {
    title: "For Businesses | Frontier Consulting Group",
    description:
      "Cabin websites, property management, and local SEO for businesses in the Broken Bow and Hochatown market.",
  },
  alternates: {
    canonical: "https://fcgok.com/businesses",
  },
};

export default function Businesses() {
  return (
    <div className="min-h-screen bg-forest-dark text-cream">
      {/* Header */}
      <section className="relative pt-32 pb-20">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">
              For Businesses
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Grow your business with{" "}
              <span className="bg-gradient-to-r from-copper to-copper-light bg-clip-text text-transparent">
                tools built for this market.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/50">
              Whether you need more bookings, a better website, help getting
              found on Google, or someone to manage your property — we build
              and operate in the same market you do.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Travel & Hospitality Software */}
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 transition hover:border-copper/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Get a website that books</h3>
              <p className="mt-3 text-sm text-cream/50">
                Custom booking websites, guest experience apps, and tourism
                platforms built specifically for cabins, resorts, outfitters,
                and local attractions in the Broken Bow area. Built on the
                same stack as hocha.town — full-stack software with AI,
                real-time data, and a native mobile app.
              </p>
            </div>

            {/* Marketing & SEO */}
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 transition hover:border-copper/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Show up on Google</h3>
              <p className="mt-3 text-sm text-cream/50">
                Local SEO, Google Business profile optimization, and content
                strategy that gets you found when visitors search for
                &quot;things to do in Broken Bow.&quot;
              </p>
            </div>

            {/* Property Management */}
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 transition hover:border-copper/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Get your property managed right</h3>
              <p className="mt-3 text-sm text-cream/50">
                Full-service vacation rental management — listing
                optimization, guest communication, cleaning coordination,
                and maintenance. We treat your property like our own because
                we manage our own.
              </p>
            </div>

            {/* Branding & Design */}
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 transition hover:border-copper/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Build a brand that stands out</h3>
              <p className="mt-3 text-sm text-cream/50">
                Logo design, visual identity, signage, and print materials
                that help your business stand out — whether you&apos;re a new
                cabin company or a long-standing local shop.
              </p>
            </div>

            {/* Photography */}
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 transition hover:border-copper/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Look great in every listing</h3>
              <p className="mt-3 text-sm text-cream/50">
                Professional real estate, commercial, and event photography.
                Great photos are the first impression for every cabin listing
                and business in the area.
              </p>
            </div>

            {/* Consulting */}
            <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-8 transition hover:border-copper/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Get a sounding board</h3>
              <p className="mt-3 text-sm text-cream/50">
                Not sure what tech to invest in, how to market to tourists,
                or where to focus limited time and budget? Straight talk from
                people who run businesses in the same market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* hocha.town Distribution */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-copper/20 bg-copper/5 p-8 md:p-10">
            <h3 className="text-xl font-bold md:text-2xl">
              Get listed on hocha.town
            </h3>
            <p className="mt-3 text-cream/60">
              When you work with us, your business gets listed on the platform
              visitors already use to plan their trip. Hocha.town features an
              AI trip planner, event listings, and local guides — putting your
              business in front of tourists at the moment they&apos;re
              deciding where to eat, what to do, and where to stay.
            </p>
            <a
              href="https://hocha.town"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-copper transition hover:text-copper-light"
            >
              Visit hocha.town
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Ready to grow?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-cream/50">
            Tell me about your business. Whether it&apos;s a new cabin
            company or a restaurant that&apos;s been here for years — let&apos;s
            figure out what&apos;s next.
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
