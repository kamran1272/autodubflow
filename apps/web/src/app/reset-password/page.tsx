'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '../../components/auth/auth-provider';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const { resetPassword, error: authError, setError } = useAuth();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setError(null);

    if (!token) {
      setLocalError('The reset token is missing. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, password);
      router.push('/login');
    } catch {
      setLocalError(authError ?? 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07172d', color: '#edf5ff', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 440, padding: 28, borderRadius: 20, background: 'rgba(11,17,31,0.88)', border: '1px solid rgba(160,176,216,0.15)' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2rem' }}>Set new password</h1>
        <p style={{ margin: '0 0 20px', color: '#a2b7d7' }}>Choose a secure password for your account.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span>New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
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
            {isSubmitting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <div style={{ marginTop: 18 }}>
          <Link href="/login" style={{ color: '#66d7ff' }}>Return to login</Link>
        </div>
      </div>
    </main>
  );
}
