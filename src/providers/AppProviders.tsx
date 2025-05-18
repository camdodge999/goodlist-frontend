"use client";

import { ReactNode } from 'react';
import { UserProvider } from '@/contexts/UserContext';
import { StoreProvider } from '@/contexts/StoreContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UserProvider>
      <StoreProvider>
        {children}
      </StoreProvider>
    </UserProvider>
  );
} 