import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Hunter Collins & Frontier Consulting Group",
  description:
    "Rooted in the Broken Bow area for 50+ years through the Fogg and Camp families. We build technology, connect investors, and help businesses grow in Hochatown and Southeast Oklahoma.",
  openGraph: {
    title: "About | Frontier Consulting Group",
    description:
      "Rooted in Broken Bow for 50+ years. Technology, investor connections, and business growth for the Hochatown corridor.",
    url: "https://fcgok.com/about",
  },
  twitter: {
    title: "About | Frontier Consulting Group",
    description:
      "Rooted in Broken Bow for 50+ years. Technology, investor connections, and business growth for the Hochatown corridor.",
  },
  alternates: {
    canonical: "https://fcgok.com/about",
  },
};

export default function About() {
  return (
    <div className="min-h-screen bg-forest-dark text-cream">
      {/* Header */}
      <section className="relative pt-32 pb-20">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">
              About
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              The local team behind{" "}
              <span className="bg-gradient-to-r from-copper to-copper-light bg-clip-text text-transparent">
                Frontier.
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              Why we&apos;re here
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/60">
              Frontier Consulting Group started because we saw a gap. The
              Broken Bow and Hochatown area is one of Oklahoma&apos;s
              fastest-growing tourism markets — but the businesses and
              investors fueling that growth didn&apos;t have a local partner
              who could help them with technology, marketing, and the kind of
              ground-level market knowledge that only comes from living here.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-cream/60">
              We&apos;re not a faceless agency in a distant city. We live
              here. Beth&apos;s family — the Fogg and Camp families — has been
              rooted in this area for over 50 years. We know the seasonal
              rhythms, the builders you can trust, the property managers who
              actually care, and the difference between a location that rents
              and one that doesn&apos;t.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-cream/60">
              That local knowledge is what makes us different. But it&apos;s
              the technical ability that makes us useful. We don&apos;t just
              advise — we build custom software for the tourism industry. We
              built{" "}
              <a
                href="https://hocha.town"
                target="_blank"
                rel="noopener noreferrer"
                className="text-copper hover:text-copper-light"
              >
                hocha.town
              </a>
              , a tourism platform with an AI trip planner, real-time burn ban
              data, and an STR tax calculator. We manage vacation rentals
              through Frontier Property Management. We shoot real estate and
              commercial photography through Frontier Photography.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-cream/60">
              We&apos;re in the arena — operating in the same market we advise
              on. That&apos;s the credibility you can&apos;t fake.
            </p>

            <div className="mt-16 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
                <div className="text-2xl font-bold text-copper">50+</div>
                <div className="mt-1 text-sm text-cream/40">
                  Years of family roots in the Broken Bow area through the
                  Fogg and Camp families
                </div>
              </div>
              <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
                <div className="text-2xl font-bold text-copper">4</div>
                <div className="mt-1 text-sm text-cream/40">
                  Active ventures — from tourism software to property
                  management and photography
                </div>
              </div>
              <div className="rounded-2xl border border-cream/5 bg-cream/[0.02] p-6">
                <div className="text-2xl font-bold text-copper">2.2M</div>
                <div className="mt-1 text-sm text-cream/40">
                  Annual visitors to Beavers Bend State Park — the market
                  we know best
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Are */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              What we actually do
            </h2>
            <div className="mt-10 space-y-10">
              <div>
                <h3 className="text-lg font-bold text-copper">
                  The ecosystem connector
                </h3>
                <p className="mt-2 text-cream/60">
                  We know the cabin owners, the property managers, the
                  builders, the restaurant owners, the investors, and the
                  visitors. Nobody else in this market has relationships
                  across all those layers. When you work with us, you tap into
                  an entire network.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-copper">
                  The technical founder
                </h3>
                <p className="mt-2 text-cream/60">
                  We don&apos;t just advise — we build software. Hocha.town is
                  a working tourism platform with AI, real-time data feeds,
                  payments, and a native iOS app. That&apos;s a different
                  caliber than &quot;I&apos;ll post on your Instagram.&quot;
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-copper">
                  The investor bridge
                </h3>
                <p className="mt-2 text-cream/60">
                  We&apos;re not a broker or financial advisor. We&apos;re the
                  person who connects capital with local opportunity — and
                  then helps execute with software, marketing, and property
                  management. The money is coming from Dallas, Tulsa, and OKC.
                  Those investors need a trusted guide on the ground.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-cream/5 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Want to work together?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-cream/50">
            Whether you&apos;re investing in the Broken Bow market or growing
            a business here, we&apos;d love to hear from you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/investors"
              className="rounded-full bg-copper px-6 py-3 text-sm font-semibold text-cream transition hover:bg-copper-light"
            >
              For Investors
            </Link>
            <Link
              href="/businesses"
              className="rounded-full border border-cream/10 px-6 py-3 text-sm font-semibold text-cream/70 transition hover:border-cream/20 hover:text-cream"
            >
              For Businesses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
