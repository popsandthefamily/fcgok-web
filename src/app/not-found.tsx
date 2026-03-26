import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '3rem',
    }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', color: 'var(--forest)', marginBottom: '1rem' }}>
          404
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: '2rem' }}>
          This page doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
