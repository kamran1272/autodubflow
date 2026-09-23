'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  loadSession,
  requestPasswordReset,
  resetPassword,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updateUserProfile,
  type AuthUser,
} from '../../lib/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  refreshSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (values: { name?: string; email?: string; image?: string | null }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const nextUser = await loadSession();
      setUser(nextUser);
      setStatus(nextUser ? 'authenticated' : 'unauthenticated');
    } catch (loadError) {
      setUser(null);
      setStatus('unauthenticated');
      setError(loadError instanceof Error ? loadError.message : 'Unable to load session.');
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmail({ email, password });
      await refreshSession();
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to sign in.');
      throw signInError;
    }
  }, [refreshSession]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    try {
      await signUpWithEmail({ name, email, password });
      await refreshSession();
    } catch (signUpError) {
      setError(signUpError instanceof Error ? signUpError.message : 'Unable to create account.');
      throw signUpError;
    }
  }, [refreshSession]);

  const handleSignOut = useCallback(async () => {
    setError(null);
    try {
      await signOut();
      setUser(null);
      setStatus('unauthenticated');
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Unable to sign out.');
      throw signOutError;
    }
  }, []);

  const handleRequestPasswordReset = useCallback(async (email: string) => {
    setError(null);
    try {
      await requestPasswordReset(email);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to request password reset.');
      throw resetError;
    }
  }, []);

  const handleResetPassword = useCallback(async (token: string, password: string) => {
    setError(null);
    try {
      await resetPassword({ token, password });
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to reset password.');
      throw resetError;
    }
  }, []);

  const updateProfile = useCallback(async (values: { name?: string; email?: string; image?: string | null }) => {
    setError(null);
    try {
      const response = await updateUserProfile(values);
      if (response?.user) {
        setUser(response.user);
      }
      await refreshSession();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update profile.');
      throw updateError;
    }
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && Boolean(user),
    error,
    setError,
    refreshSession,
    signIn,
    signUp,
    signOut: handleSignOut,
    requestPasswordReset: handleRequestPasswordReset,
    resetPassword: handleResetPassword,
    updateProfile,
  }), [error, handleResetPassword, handleRequestPasswordReset, handleSignOut, refreshSession, signIn, signUp, status, updateProfile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
