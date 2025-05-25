"use client";

import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavItems from "./NavItems";
import UserMenu from "./UserMenu";
import useNavigation from "@/hooks/useNavigation";
import { useUser } from "@/contexts/UserContext";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

export default function NavBar({ session }: { session: Session | null }) {
  const router = useRouter();
  const { navItems } = useNavigation();
  const { currentUser, isLoading, signOut } = useUser();
  
  // Use server session to determine initial authentication state
  const hasServerSession = !!session?.user;
  const hasClientUser = !!currentUser;
  
  // Determine authentication state - prefer client state when available, fallback to server state
  const isAuthenticated = hasClientUser || (hasServerSession && isLoading);

  // Function to reset user state
  const resetUserState = useCallback(async () => {
    router.push("/logout"); 
  }, [router]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white backdrop-blur-lg border-b border-gray-100">
      <nav
        className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        aria-label="Global"
      >
        {/* Logo */}
        <Logo />

        {/* Mobile menu button */}
        <MobileMenu 
          navItems={navItems} 
          user={currentUser || undefined} 
          isAuthenticated={isAuthenticated}
          resetUserState={resetUserState}
        />

        {/* Desktop navigation */}
        <NavItems items={navItems} />

        {/* Right section - user menu */}
        {isLoading && hasServerSession ? (
          // Show loading state only when we have server session but client is still loading
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
          </div>
        ) : (
          <UserMenu 
            user={currentUser || undefined} 
            isAuthenticated={isAuthenticated} 
            resetUserState={resetUserState}
          />
        )}
      </nav>
    </header>
  );
} 