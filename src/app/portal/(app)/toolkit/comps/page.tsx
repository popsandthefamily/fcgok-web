import Link from 'next/link';
import CompsClient from './CompsClient';

export const metadata = { title: 'Comparable Transactions' };

export default function CompsPage() {
  return (
    <>
      <div className="portal-header">
        <h1>Comparable Transactions</h1>
        <Link href="/portal" className="portal-btn portal-btn-ghost">
          &larr; Dashboard
        </Link>
      </div>
      <CompsClient />
    </>
  );
}
