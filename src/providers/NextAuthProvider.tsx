"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth";

interface NextAuthProviderProps {
  children: ReactNode;
  session?: Session;
}

export function NextAuthProvider({ children, session }: NextAuthProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  );
} 