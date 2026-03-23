import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-dark py-10">
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
          <div className="flex items-center gap-6">
            <Link
              href="/#about"
              className="text-xs text-white/30 transition hover:text-white/60"
            >
              Who We Are
            </Link>
            <Link
              href="/#services"
              className="text-xs text-white/30 transition hover:text-white/60"
            >
              What We Do
            </Link>
            <Link
              href="/#ventures"
              className="text-xs text-white/30 transition hover:text-white/60"
            >
              Our Ventures
            </Link>
            <Link
              href="/#contact"
              className="text-xs text-white/30 transition hover:text-white/60"
            >
              Contact
            </Link>
            <Link
              href="/careers"
              className="text-xs text-white/30 transition hover:text-white/60"
            >
              Careers
            </Link>
          </div>
          <div className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Frontier Consulting Group LLC. Broken Bow, Oklahoma.
          </div>
        </div>
      </div>
    </footer>
  );
}
