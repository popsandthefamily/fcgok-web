import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactForm from "./components/ContactForm";

export const metadata: Metadata = {
  title: "Frontier Consulting Group | Technology, Consulting & Connections — Broken Bow & Hochatown",
  description:
    "We build the technology and connections that power Hochatown's next chapter. Local consulting, tourism software, investor advisory, and business growth for Broken Bow and Southeast Oklahoma.",
  openGraph: {
    title: "Frontier Consulting Group | Technology, Consulting & Connections — Broken Bow & Hochatown",
    description:
      "We build the technology and connections that power Hochatown's next chapter. Local consulting, tourism software, and investor advisory for Broken Bow.",
    url: "https://fcgok.com",
  },
  twitter: {
    title: "Frontier Consulting Group | Technology, Consulting & Connections — Broken Bow & Hochatown",
    description:
      "We build the technology and connections that power Hochatown's next chapter. Local consulting, tourism software, and investor advisory for Broken Bow.",
  },
  alternates: {
    canonical: "https://fcgok.com",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-forest-dark text-cream">
      {/* ── Hero ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/20 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-copper/20 bg-copper/5 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-copper" />
              <span className="text-xs font-medium tracking-wide text-copper-light">
                Broken Bow &amp; Hochatown, Oklahoma
              </span>
            </div>

            <h1
              className="animate-fade-up text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl"
              style={{ animationDelay: "0.1s" }}
            >
              We build the{" "}
              <span className="bg-gradient-to-r from-copper to-copper-light bg-clip-text text-transparent">
                technology
              </span>{" "}
              and connections that power Hochatown&apos;s{" "}
              <span className="bg-gradient-to-r from-copper to-copper-light bg-clip-text text-transparent">
                next chapter.
              </span>
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-cream/50"
              style={{ animationDelay: "0.2s" }}
            >
              Frontier Consulting Group sits at the intersection of technology,
              tourism, and local knowledge in one of Oklahoma&apos;s
              fastest-moving markets. We connect investors with opportunity
              and help businesses grow.
            </p>

            <div
              className="animate-fade-up mt-10 flex flex-wrap gap-4"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                href="/investors"
                className="group inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-semibold text-forest-dark transition hover:bg-cream-dark"
              >
                I&apos;m an Investor
                <ArrowIcon />
              </Link>
              <Link
                href="/businesses"
                className="rounded-full border border-cream/10 px-6 py-3 text-sm font-semibold text-cream/70 transition hover:border-cream/20 hover:text-cream"
              >
                I&apos;m a Business Owner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Thesis (Thought Leadership Lead) ── */}
      <section className="relative border-t border-cream/5 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">
              The Opportunity
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Hochatown is at an inflection point.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/50">
              2.2 million visitors to Beavers Bend annually. A federal
              Opportunity Zone drawing capital from Dallas, Tulsa, and OKC.
              A Choctaw casino resort under development. The STR market is
              maturing, retail corridors are expanding, and the infrastructure
              is catching up to the demand.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-cream/50">
              But growth without local knowledge is a gamble. The investors who
              win here are the ones with a trusted guide on the ground — someone
              who knows which builders deliver, which locations actually rent,
              and how the market really works.
            </p>
            <Link
              href="/insights"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-copper transition hover:text-copper-light"
            >
              Read our latest insights
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ventures (Proof) ── */}
      <section className="relative border-t border-cream/5 py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-16 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">
              Our Ventures
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              We don&apos;t just consult — we build.
            </h2>
            <p className="mt-4 text-lg text-cream/50">
              These are our own businesses, built with the same tools and
              strategies we bring to our clients.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* hocha.town */}
            <a
              href="https://hocha.town"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-cream/5 bg-cream/[0.02] p-6 transition hover:border-copper/20"
            >
              <Image
                src="/logos/hocha-icon.png"
                alt="hocha.town"
                width={48}
                height={48}
                className="mb-4 h-12 w-12 rounded-xl"
              />
              <h3 className="font-bold">hocha.town</h3>
              <p className="mt-2 text-sm text-cream/40">
                The tourism platform for Hochatown &amp; Broken Bow — AI trip
                planner, burn ban widget, STR tax calculator, and more.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm text-copper opacity-0 transition group-hover:opacity-100">
                Visit site <ArrowIcon />
              </div>
            </a>

            {/* Frontier Property Management */}
            <a
              href="https://rentwithfrontier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-cream/5 bg-cream/[0.02] p-6 transition hover:border-copper/20"
            >
              <Image
                src="/logos/fpm-logo-white.png"
                alt="Frontier Property Management"
                width={48}
                height={48}
                className="mb-4 h-12 w-12 rounded-xl object-contain"
              />
              <h3 className="font-bold">Frontier Property Management</h3>
              <p className="mt-2 text-sm text-cream/40">
                Full-service vacation rental management in the Broken Bow area.
                We operate in the same market we advise on.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm text-copper opacity-0 transition group-hover:opacity-100">
                Visit site <ArrowIcon />
              </div>
            </a>

            {/* Frontier Photography */}
            <a
              href="https://frontier.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-cream/5 bg-cream/[0.02] p-6 transition hover:border-copper/20"
            >
              <Image
                src="/logos/fp-logo.png"
                alt="Frontier Photography"
                width={48}
                height={48}
                className="mb-4 h-12 w-12 rounded-xl object-contain invert brightness-200"
              />
              <h3 className="font-bold">Frontier Photography</h3>
              <p className="mt-2 text-sm text-cream/40">
                Real estate, commercial, and event photography across Southeast
                Oklahoma.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm text-copper opacity-0 transition group-hover:opacity-100">
                Visit site <ArrowIcon />
              </div>
            </a>

            {/* SofaOps */}
            <div className="relative rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-6 w-6 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <div className="mb-2 inline-flex rounded-full border border-copper/20 bg-copper/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-copper">
                Coming Soon
              </div>
              <h3 className="font-bold">SofaOps</h3>
              <p className="mt-2 text-sm text-cream/40">
                A family planner app to help busy households coordinate
                schedules, tasks, and meals.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/ventures"
              className="inline-flex items-center gap-2 text-sm font-medium text-copper transition hover:text-copper-light"
            >
              See all ventures <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How I Help (Audience Split) ── */}
      <section className="relative border-t border-cream/5 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Investors */}
            <Link
              href="/investors"
              className="group rounded-2xl border border-cream/5 bg-cream/[0.02] p-10 transition hover:border-copper/20"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-7 w-7 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">For Investors</h3>
              <p className="mt-3 text-cream/50">
                Exploring the Broken Bow market? I&apos;ll help you find the
                right opportunity and the right team. Local market
                intelligence, builder connections, and operational support
                from someone who lives here.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-copper transition group-hover:text-copper-light">
                Learn more <ArrowIcon />
              </div>
            </Link>

            {/* Business Owners */}
            <Link
              href="/businesses"
              className="group rounded-2xl border border-cream/5 bg-cream/[0.02] p-10 transition hover:border-copper/20"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-copper/10">
                <svg className="h-7 w-7 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.994 2.994 0 00-1.166.599m19.332 0A2.994 2.994 0 0022.166 9.948M4.5 9.349l1.648-7.093A.75.75 0 016.882 1.5h10.236a.75.75 0 01.734.756L19.5 9.35" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">For Businesses</h3>
              <p className="mt-3 text-cream/50">
                Need more bookings, better tech, or a marketing strategy that
                actually works? From custom software to property management,
                we help local businesses grow with tools built for this
                market.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-copper transition group-hover:text-copper-light">
                Learn more <ArrowIcon />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section
        id="contact"
        className="relative border-t border-cream/5 py-32"
      >
        <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-copper/3 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">
              Get in Touch
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Tell me about your project.
            </h2>
            <p className="mt-4 text-lg text-cream/50">
              Whether you&apos;re an investor exploring the Broken Bow market
              or a business owner looking to grow — I&apos;d love to hear
              from you.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-12 lg:grid-cols-[1fr_auto]">
            <ContactForm />

            {/* Contact Info Sidebar */}
            <div className="flex flex-col gap-6 lg:w-72">
              <a
                href="mailto:info@fcgok.com"
                className="group rounded-2xl border border-cream/5 bg-cream/[0.02] p-6 transition hover:border-copper/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10">
                  <svg className="h-5 w-5 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-cream/80">Email</div>
                <span className="mt-1 block text-sm text-copper transition group-hover:text-copper-light">
                  info@fcgok.com
                </span>
              </a>

              <a
                href="tel:+15802077154"
                className="group rounded-2xl border border-cream/5 bg-cream/[0.02] p-6 transition hover:border-copper/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10">
                  <svg className="h-5 w-5 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-cream/80">Call</div>
                <span className="mt-1 block text-sm text-copper transition group-hover:text-copper-light">
                  (580) 207-7154
                </span>
              </a>

              <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10">
                  <svg className="h-5 w-5 text-copper" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-cream/80">Location</div>
                <p className="mt-1 text-sm text-cream/40">
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
