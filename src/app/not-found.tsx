import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-dark text-cream">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-copper">404</h1>
        <p className="mt-4 text-lg text-cream/50">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-copper px-6 py-3 text-sm font-semibold text-cream transition hover:bg-copper-light"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
