"use client";

import { ReactNode } from 'react';
import { UserProvider } from '@/contexts/UserContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { ReportProvider } from '@/contexts/ReportContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UserProvider>
      <StoreProvider>
        <ReportProvider>
          {children}
        </ReportProvider>
      </StoreProvider>
    </UserProvider>
  );
} 