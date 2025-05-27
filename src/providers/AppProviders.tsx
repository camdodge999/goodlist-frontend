"use client";

import { ReactNode } from 'react';
import { UserProvider } from '@/contexts/UserContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { ReportProvider } from '@/contexts/ReportContext';
import { Session } from 'next-auth';

interface AppProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

export function AppProviders({ children, session }: AppProvidersProps) {
  return (
    <UserProvider initialSession={session}>
      <StoreProvider>
        <ReportProvider>
          {children}
        </ReportProvider>
      </StoreProvider>
    </UserProvider>
  );
} 