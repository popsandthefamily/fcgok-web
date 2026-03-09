import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-dark text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gold">404</h1>
        <p className="mt-4 text-lg text-white/50">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-light"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
