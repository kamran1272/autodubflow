'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from './auth-provider';

export function ProtectedRoute({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return fallback ?? <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#eaf0ff' }}>Loading your account…</div>;
  }

  if (!isAuthenticated) {
    return fallback ?? <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#eaf0ff' }}>Redirecting to login…</div>;
  }

  return <>{children}</>;
}
