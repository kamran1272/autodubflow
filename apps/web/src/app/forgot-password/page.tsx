'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useAuth } from '../../components/auth/auth-provider';

export default function ForgotPasswordPage() {
  const { requestPasswordReset, error: authError, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setError(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setLocalError('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch {
      setLocalError(authError ?? 'Unable to send password reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07172d', color: '#edf5ff', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 440, padding: 28, borderRadius: 20, background: 'rgba(11,17,31,0.88)', border: '1px solid rgba(160,176,216,0.15)' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2rem' }}>Reset password</h1>
        <p style={{ margin: '0 0 20px', color: '#a2b7d7' }}>We will send a reset link to your email.</p>

        {sent ? (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ borderRadius: 10, background: 'rgba(90,241,182,0.08)', border: '1px solid rgba(90,241,182,0.3)', color: '#c9ffe7', padding: '12px' }}>
              Password reset instructions were sent to {email}.
            </div>
            <Link href="/login" style={{ color: '#66d7ff' }}>Back to sign in</Link>
          </div>
        ) : (
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
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
