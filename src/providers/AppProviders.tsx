"use client";

import { ReactNode } from 'react';
import { UserProvider } from '@/contexts/UserContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { ReportProvider } from '@/contexts/ReportContext';
import { EmotionCacheProvider } from './EmotionCacheProvider';
import { Session } from 'next-auth';

interface AppProvidersProps {
  children: ReactNode;
  session?: Session | null;
  nonce?: string | null;
}

export function AppProviders({ children, session, nonce }: AppProvidersProps) {
  return (
    <EmotionCacheProvider nonce={nonce}>
      <UserProvider initialSession={session}>
        <StoreProvider>
          <ReportProvider>
            {children}
          </ReportProvider>
        </StoreProvider>
      </UserProvider>
    </EmotionCacheProvider>
  );
} 