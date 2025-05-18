"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavItems from "./NavItems";
import type { NavItem } from "@/types/navbar";
import UserMenu from "./UserMenu";
import { User } from "@/types/users";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  navItems: NavItem[];
  user?: User;
  isAuthenticated: boolean;
}

export default function MobileMenu({ navItems, user, isAuthenticated }: MobileMenuProps) {
  
  return (
    <div className="flex lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <span className="sr-only">Open main menu</span>
            <FontAwesomeIcon icon={faStore} className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[350px] px-4 py-4">
          <SheetHeader className="mb-2">
            <SheetTitle className="text-xl">เมนู</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flow-root">
            <div className="-my-4 divide-y divide-gray-200">
              <NavItems items={navItems} isMobile={true} />
              <UserMenu user={user} isAuthenticated={isAuthenticated} isMobile={true} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 