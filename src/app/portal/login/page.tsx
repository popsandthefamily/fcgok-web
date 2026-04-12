'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'password' | 'magic-link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('password');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/portal');
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #d1d5db', borderRadius: 4,
    fontSize: 14, marginBottom: '1rem',
  };

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
        ) : mode === 'password' ? (
          <form onSubmit={handlePasswordLogin}>
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
              style={inputStyle}
            />
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 500,
              color: '#374151', marginBottom: 6, textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={inputStyle}
            />
            {error && (
              <p style={{ fontSize: 13, color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="portal-btn portal-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink}>
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
              style={inputStyle}
            />
            {error && (
              <p style={{ fontSize: 13, color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="portal-btn portal-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        {!sent && (
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              onClick={() => { setMode(mode === 'password' ? 'magic-link' : 'password'); setError(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#1a3a2a', textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              {mode === 'password' ? 'Use magic link instead' : 'Use password instead'}
            </button>
          </div>
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
