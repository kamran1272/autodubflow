'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '../../components/auth/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, error: authError, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setError(null);

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setLocalError('Enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      router.push('/dashboard');
    } catch {
      setLocalError(authError ?? 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07172d', color: '#edf5ff', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 440, padding: 28, borderRadius: 20, background: 'rgba(11,17,31,0.88)', border: '1px solid rgba(160,176,216,0.15)', boxShadow: '0 20px 50px rgba(0,0,0,0.22)' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2rem' }}>Welcome back</h1>
        <p style={{ margin: '0 0 20px', color: '#a2b7d7' }}>Sign in to AutoDubFlow.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={{ background: '#0f1a2c', border: '1px solid #2d405b', color: '#edf5ff', borderRadius: 10, padding: '12px 14px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              style={{ background: '#0f1a2c', border: '1px solid #2d405b', color: '#edf5ff', borderRadius: 10, padding: '12px 14px' }}
            />
          </label>

          {(localError ?? authError) && (
            <div style={{ borderRadius: 10, background: 'rgba(255,106,126,0.1)', border: '1px solid rgba(255,106,126,0.25)', color: '#ffc3ce', padding: '10px 12px' }}>
              {localError ?? authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ border: 0, borderRadius: 12, background: 'linear-gradient(135deg, #66d7ff, #b690ff)', color: '#08192f', padding: '12px 16px', fontWeight: 700, cursor: isSubmitting ? 'wait' : 'pointer' }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 18, color: '#b8c8e4', fontSize: '0.94rem' }}>
          <Link href="/forgot-password">Forgot password?</Link>
          <Link href="/register">Create account</Link>
        </div>
      </div>
    </main>
  );
}
