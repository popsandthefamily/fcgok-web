import Image from "next/image";

const divisions = [
  {
    name: "Software + Design + Branding",
    description:
      "Custom software development, web applications, UI/UX design, and brand identity for businesses ready to grow.",
    icon: (
      <svg
        className="h-8 w-8"
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
    ),
    services: [
      "Web & Mobile Applications",
      "Brand Identity & Logo Design",
      "UI/UX Design",
      "SaaS Platform Development",
    ],
  },
  {
    name: "Helpible",
    description:
      "Community tourism and local business platforms that connect visitors with the best experiences in town.",
    logo: null,
    links: [
      { label: "hocha.town", href: "https://hocha.town" },
      { label: "blueridge.town", href: "https://blueridge.town" },
    ],
    icon: (
      <svg
        className="h-8 w-8"
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
    ),
  },
  {
    name: "Frontier Property Management",
    description:
      "Professional property management for vacation rentals and long-term properties in the Broken Bow area.",
    logoSrc: "/logos/fpm-logo.png",
    link: { label: "rentwithfrontier.com", href: "https://rentwithfrontier.com" },
    icon: null,
  },
  {
    name: "Frontier Photography",
    description:
      "Professional photography services — real estate, events, portraits, and commercial shoots.",
    logoSrc: "/logos/fp-logo.png",
    link: { label: "frontier.photos", href: "https://frontier.photos" },
    icon: null,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-cream-dark bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/fcg-icon.png"
              alt="FCG"
              width={36}
              height={36}
              className="h-9 w-auto"
            />
            <span className="font-serif text-lg font-bold tracking-wide text-navy">
              Frontier Consulting Group
            </span>
          </div>
          <div className="hidden gap-8 text-sm font-medium text-navy/70 md:flex">
            <a href="#about" className="transition hover:text-navy">
              About
            </a>
            <a href="#divisions" className="transition hover:text-navy">
              Divisions
            </a>
            <a href="#contact" className="transition hover:text-navy">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center justify-center bg-navy pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,163,90,0.15),transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Image
            src="/logos/fcg-logo.png"
            alt="Frontier Consulting Group"
            width={400}
            height={200}
            className="mx-auto mb-8 h-auto w-72 md:w-96"
            priority
          />
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-cream/80 md:text-xl">
            A multi-disciplinary firm delivering software, design, branding,
            property management, and photography from the heart of Southeast
            Oklahoma.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#divisions"
              className="rounded-md bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-light"
            >
              Our Divisions
            </a>
            <a
              href="#contact"
              className="rounded-md border border-cream/30 px-6 py-3 text-sm font-semibold text-cream transition hover:border-cream/60"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-cream py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-navy md:text-4xl">
            Built on the Frontier
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" />
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-navy/70">
            Frontier Consulting Group LLC is a Broken Bow, Oklahoma-based
            company led by Hunter Collins. We bring together technology,
            creativity, and local expertise to help businesses and communities
            thrive — whether through custom software, thoughtful design,
            professional property management, or compelling photography.
          </p>
        </div>
      </section>

      {/* Divisions */}
      <section id="divisions" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-navy md:text-4xl">
              Our Divisions
            </h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" />
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {divisions.map((div) => (
              <div
                key={div.name}
                className="group rounded-xl border border-cream-dark bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-start gap-4">
                  {div.logoSrc ? (
                    <Image
                      src={div.logoSrc}
                      alt={div.name}
                      width={48}
                      height={48}
                      className="h-12 w-auto"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 text-navy">
                      {div.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy">
                      {div.name}
                    </h3>
                  </div>
                </div>
                <p className="mb-6 text-navy/60">{div.description}</p>
                {"services" in div && div.services && (
                  <ul className="mb-4 space-y-2">
                    {div.services.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm text-navy/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                {"links" in div && div.links && (
                  <div className="flex flex-wrap gap-3">
                    {div.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-navy/5 px-3 py-1.5 text-sm font-medium text-navy transition hover:bg-navy/10"
                      >
                        {l.label}
                        <ExternalIcon />
                      </a>
                    ))}
                  </div>
                )}
                {"link" in div && div.link && (
                  <a
                    href={div.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-navy/5 px-3 py-1.5 text-sm font-medium text-navy transition hover:bg-navy/10"
                  >
                    {div.link.label}
                    <ExternalIcon />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-navy py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-cream md:text-4xl">
            Get in Touch
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" />
          <div className="mt-12 grid gap-8 text-cream/80 sm:grid-cols-3">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                <svg
                  className="h-6 w-6 text-gold"
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
              <h3 className="mb-1 font-semibold text-cream">Location</h3>
              <p className="text-sm">
                3156 Old Broken Bow Hwy
                <br />
                Broken Bow, OK 74728
              </p>
            </div>
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                <svg
                  className="h-6 w-6 text-gold"
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
              <h3 className="mb-1 font-semibold text-cream">Email</h3>
              <a
                href="mailto:info@fcgok.com"
                className="text-sm text-gold transition hover:text-gold-light"
              >
                info@fcgok.com
              </a>
            </div>
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                <svg
                  className="h-6 w-6 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <h3 className="mb-1 font-semibold text-cream">Principal</h3>
              <p className="text-sm">Hunter Collins</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-light bg-navy py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-cream/40">
          &copy; {new Date().getFullYear()} Frontier Consulting Group LLC. All
          rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}
