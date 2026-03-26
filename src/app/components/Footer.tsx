import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-forest-dark py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/fcg-logo-white.png"
              alt="Frontier Consulting Group"
              width={180}
              height={45}
              className="h-9 w-auto opacity-40"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/about"
              className="text-xs text-cream/30 transition hover:text-cream/60"
            >
              About
            </Link>
            <Link
              href="/ventures"
              className="text-xs text-cream/30 transition hover:text-cream/60"
            >
              Ventures
            </Link>
            <Link
              href="/investors"
              className="text-xs text-cream/30 transition hover:text-cream/60"
            >
              For Investors
            </Link>
            <Link
              href="/businesses"
              className="text-xs text-cream/30 transition hover:text-cream/60"
            >
              For Businesses
            </Link>
            <Link
              href="/careers"
              className="text-xs text-cream/30 transition hover:text-cream/60"
            >
              Careers
            </Link>
          </div>
          <div className="text-xs text-cream/30">
            &copy; {new Date().getFullYear()} Frontier Consulting Group LLC. Broken Bow, Oklahoma.
          </div>
        </div>
      </div>
    </footer>
  );
}
