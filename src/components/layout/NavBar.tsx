"use client";

import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavItems from "./NavItems";
import UserMenu from "./UserMenu";
import useNavigation from "@/hooks/useNavigation";

export default function NavBar() {
  const { user, isAuthenticated, navItems } = useNavigation();

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
          user={user} 
          isAuthenticated={isAuthenticated} 
        />

        {/* Desktop navigation */}
        <NavItems items={navItems} />

        {/* Right section - user menu */}
        <UserMenu user={user} isAuthenticated={isAuthenticated} />
      </nav>
    </header>
  );
} 