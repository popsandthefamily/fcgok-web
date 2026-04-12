'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1f17',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: '3rem',
        maxWidth: 400,
        width: '100%',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: 8 }}>
            Capital Intelligence Portal
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            Frontier Consulting Group — Invite-only access
          </p>
        </div>

        {sent ? (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 6,
            padding: '1.25rem',
          }}>
            <p style={{ fontSize: 14, color: '#166534', fontWeight: 500, marginBottom: 4 }}>
              Check your email
            </p>
            <p style={{ fontSize: 13, color: '#15803d' }}>
              We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 500,
              color: '#374151', marginBottom: 6, textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #d1d5db', borderRadius: 4,
                fontSize: 14, marginBottom: '1rem',
              }}
            />
            {error && (
              <p style={{ fontSize: 13, color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
            )}
            <button
              type="submit"
              className="portal-btn portal-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              Send Magic Link
            </button>
          </form>
        )}

        <p style={{
          fontSize: 11, color: '#9ca3af', marginTop: '2rem', textAlign: 'center',
        }}>
          This portal is for authorized FCG retainer clients only.<br />
          Contact info@fcgok.com to request access.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
