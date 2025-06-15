"use client";

import { SessionProvider, signOut } from "next-auth/react";   
import { ReactNode } from "react";
import { Session } from "next-auth";

interface NextAuthProviderProps {
  children: ReactNode;
  session?: Session;
}

export function NextAuthProvider({ children, session }: NextAuthProviderProps) {
  if (session?.user?.token) {
    try {
      // Decode JWT token to get expiration
      const tokenPayload = JSON.parse(atob(session.user.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is expired
      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        signOut({ callbackUrl: '/login' });
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      // If token is malformed, sign out for security
      signOut({ callbackUrl: '/login' });
    }
  }

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  );
} 