import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AuthProvider } from '../components/auth/auth-provider';

export const metadata: Metadata = {
  title: 'AutoDubFlow',
  description: 'Autonomous dubbing and localization workflow dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
