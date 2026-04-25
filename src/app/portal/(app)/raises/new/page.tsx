'use client';

import Link from 'next/link';
import RaiseForm from '../RaiseForm';

export default function NewRaisePage() {
  return (
    <>
      <div className="portal-header">
        <h1>New Raise</h1>
        <Link href="/portal/raises" className="portal-btn portal-btn-ghost">&larr; Raises</Link>
      </div>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Capture the deal profile. Only the name is required — fill what you know;
        the rest can be edited later. The more you provide, the better fit scoring works.
      </p>
      <RaiseForm mode={{ kind: 'create' }} />
    </>
  );
}
