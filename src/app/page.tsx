import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "./components/ContactForm";

export const metadata: Metadata = {
  title: "Frontier Consulting Group | Small Business Consulting — Broken Bow & Hochatown",
  description:
    "Your neighbors in Broken Bow. We help small businesses grow with travel & hospitality software, marketing, property management, and hands-on consulting for the Hochatown and Southeast Oklahoma area.",
  openGraph: {
    title: "Frontier Consulting Group | Small Business Consulting — Broken Bow & Hochatown",
    description:
      "Your neighbors in Broken Bow. We help local businesses grow with hospitality software, marketing, property management, and hands-on consulting.",
    url: "https://fcgok.com",
  },
  twitter: {
    title: "Frontier Consulting Group | Small Business Consulting — Broken Bow & Hochatown",
    description:
      "Your neighbors in Broken Bow. We help local businesses grow with hospitality software, marketing, property management, and hands-on consulting.",
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
                Broken Bow &amp; Hochatown, Oklahoma
              </span>
            </div>

            <h1
              className="animate-fade-up text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl"
              style={{ animationDelay: "0.1s" }}
            >
              Your{" "}
              <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                neighbors
              </span>{" "}
              who help small businesses{" "}
              <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                grow.
              </span>
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-white/50"
              style={{ animationDelay: "0.2s" }}
            >
              We&apos;re Frontier Consulting Group — a small business consultancy
              rooted right here in Broken Bow. We specialize in travel &amp;
              hospitality software, marketing, and the hands-on work it takes
              to grow a business in our neck of the woods.
            </p>

            <div
              className="animate-fade-up mt-10 flex flex-wrap gap-4"
              style={{ animationDelay: "0.3s" }}
            >
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-white/90"
              >
                Let&apos;s Talk
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
                href="#services"
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
              >
                See How We Help
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About / Community Roots */}
      <section id="about" className="relative border-t border-white/5 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                Who We Are
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Community roots,{" "}
                <span className="text-gold">modern tools.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/50">
                Frontier Consulting Group started because we saw our neighbors —
                cabin owners, outfitters, restaurants, and shop owners — working
                hard but missing the software and marketing help that bigger
                markets take for granted. So we built it ourselves, right here
                in Broken Bow.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-white/50">
                We&apos;re not a faceless agency in a distant city. We live here.
                We know the seasonal rhythms, the tourism patterns, and what it
                really takes to run a business in the Hochatown corridor. That
                local knowledge is what makes us different.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "Broken Bow", label: "Born & Based" },
                { value: "5+", label: "Years in the Community" },
                { value: "Travel", label: "& Hospitality Focus" },
                { value: "Hands-On", label: "Consulting Approach" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                >
                  <div className="text-2xl font-bold text-gold md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="relative border-t border-white/5 py-32">
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-gold/3 blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-20 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              What We Do
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Built for small business
            </h2>
            <p className="mt-4 text-lg text-white/50">
              Whether you need a booking website, help getting found on Google,
              or someone to manage your rental property — we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Travel & Hospitality Software */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-gold/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Travel &amp; Hospitality Software</h3>
              <p className="mt-3 text-sm text-white/50">
                Custom websites, booking platforms, guest experience apps, and
                tourism directories — purpose-built for cabins, resorts, outfitters,
                and local attractions in the Broken Bow area.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Booking Sites", "Guest Apps", "Tourism Platforms", "Integrations"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Marketing & SEO */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-gold/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Marketing &amp; SEO</h3>
              <p className="mt-3 text-sm text-white/50">
                Get found by the visitors already searching for &quot;things to do
                in Broken Bow.&quot; We handle local SEO, Google Business profiles,
                social media, and the content strategy that fills cabins and
                restaurant seats.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Local SEO", "Google Business", "Social Media", "Content Strategy"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Branding & Design */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-gold/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Branding &amp; Design</h3>
              <p className="mt-3 text-sm text-white/50">
                Logo design, visual identity, signage, and print materials that
                help your business stand out — whether you&apos;re a new cabin rental
                company or a long-standing Broken Bow shop.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Logo Design", "Brand Identity", "Print & Signage", "Web Design"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Property Management */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-gold/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Property Management</h3>
              <p className="mt-3 text-sm text-white/50">
                Full-service vacation rental management for the Broken Bow and
                Hochatown area. From listing optimization to guest communication,
                cleaning coordination, and maintenance — we treat your property
                like it&apos;s our own.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Vacation Rentals", "Guest Services", "Listing Management", "Maintenance"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Photography */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-gold/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Photography</h3>
              <p className="mt-3 text-sm text-white/50">
                Real estate photography, commercial shoots, and event coverage
                across Southeast Oklahoma. Great photos are the first impression
                for every cabin listing and local business.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Real Estate", "Commercial", "Events", "Portraits"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Consulting */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-gold/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Small Business Consulting</h3>
              <p className="mt-3 text-sm text-white/50">
                Need a sounding board? We help local business owners figure out
                what tech to invest in, how to market to tourists, and where to
                focus limited time and budget. No jargon, just straight talk
                from people who get it.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Strategy", "Tech Guidance", "Growth Planning", "Tourism"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Ventures */}
      <section id="ventures" className="relative border-t border-white/5 py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-20 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              Our Ventures
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              We don&apos;t just consult — we build.
            </h2>
            <p className="mt-4 text-lg text-white/50">
              These are our own businesses, built right here with the same tools
              and strategies we bring to our clients. We put our money where our
              mouth is.
            </p>
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
              We built the local tourism guides we wished existed — connecting
              visitors with the best restaurants, activities, and experiences.
              These are the same platforms we use to market our clients.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
                Our own vacation rental management company — we manage cabins
                in the Broken Bow area with the same care and systems we
                recommend to our consulting clients.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gold opacity-0 transition group-hover:opacity-100">
                rentwithfrontier.com
                <ArrowIcon />
              </div>
            </a>

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
                Real estate, commercial, and event photography across Southeast
                Oklahoma. Great photos fill cabins — it&apos;s that simple.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gold opacity-0 transition group-hover:opacity-100">
                frontier.photos
                <ArrowIcon />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section
        id="contact"
        className="relative border-t border-white/5 py-32"
      >
        <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-gold/3 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              Get in Touch
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Ready to grow your business?
            </h2>
            <p className="mt-4 text-lg text-white/50">
              Tell us a little about what you need. Whether it&apos;s consulting,
              software, marketing, or one of our ventures — we&apos;d love to hear
              from you.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-12 lg:grid-cols-[1fr_auto]">
            <ContactForm />

            {/* Contact Info Sidebar */}
            <div className="flex flex-col gap-6 lg:w-72">
              <a
                href="mailto:info@fcgok.com"
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-gold/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                  <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white/80">Email us directly</div>
                <span className="mt-1 block text-sm text-gold transition group-hover:text-gold-light">
                  info@fcgok.com
                </span>
              </a>

              <a
                href="tel:+15802077154"
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-gold/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                  <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white/80">Give us a call</div>
                <span className="mt-1 block text-sm text-gold transition group-hover:text-gold-light">
                  (580) 207-7154
                </span>
              </a>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                  <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white/80">Come say hi</div>
                <p className="mt-1 text-sm text-white/40">
                  Broken Bow, OK 74728
                </p>
              </div>
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
