"use client";

import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faSignOutAlt,
  faUserPlus,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/users";
import { getAuthenticatedImageUrl } from "@/lib/utils";

interface UserMenuProps {
  user?: User;
  isAuthenticated: boolean;
  isMobile?: boolean;
  resetUserState?: () => Promise<void>;
}

export default function UserMenu({ 
  user, 
  isAuthenticated, 
  isMobile = false, 
  resetUserState 
}: UserMenuProps) {
  // Mobile version
  if (isMobile) {
    return (
      <div className="py-4 space-y-1">
        {isAuthenticated && user ? (
          <>
            <Link
              href="/profile"
              className="block rounded-lg px-4 py-3 text-base font-semibold text-gray-900 hover:bg-blue-50 active:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-blue-600 mr-3" />
                <span>โปรไฟล์</span>
              </div>
            </Link>
            <button
              onClick={resetUserState}
              className="w-full block rounded-lg px-4 py-3 text-base font-semibold text-gray-900 hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5 text-red-500 mr-3" />
                <span>ออกจากระบบ</span>
              </div>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="block rounded-lg px-4 py-3 text-base font-semibold text-gray-900 hover:bg-blue-50 active:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faSignInAlt} className="h-5 w-5 text-blue-600 mr-3" />
                <span>เข้าสู่ระบบ</span>
              </div>
            </Link>
            <Link
              href="/signup"
              className="mt-2 block rounded-lg px-4 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
            >
              <div className="flex items-center justify-center">
                <FontAwesomeIcon icon={faUserPlus} className="h-5 w-5 mr-3" />
                <span>สมัครสมาชิก</span>
              </div>
            </Link>
          </>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
      {isAuthenticated && user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full transition-all duration-300 hover:bg-accent/50 hover:scale-105 focus:ring-2 focus:ring-blue-500/20"
            >
              <Avatar className="h-9 w-9 transition-transform duration-300 group-hover:scale-110 cursor-pointer">
                <AvatarImage
                  src={getAuthenticatedImageUrl(user.logo_url) || undefined}
                  alt={user.displayName || "User"}
                  className="transition-opacity duration-300"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-medium">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 p-2 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border border-gray-100 shadow-lg bg-white"
            align="end"
            forceMount
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal p-3 flex items-center gap-3">
              <Avatar className="h-9 w-9 transition-transform duration-300 group-hover:scale-110 cursor-pointer">
                <AvatarImage
                  src={getAuthenticatedImageUrl(user.logo_url) || undefined}  
                  alt={user.displayName || "User"}
                  className="transition-opacity duration-300"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-medium">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.displayName || "ผู้ใช้"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email || ""}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user.role === "admin" ? "แอดมิน" : "ผู้ใช้"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-gray-300" />
            <DropdownMenuItem
              asChild
              className="cursor-pointer transition-all duration-200 rounded-md hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
            >
              <Link href="/profile" className="flex items-center p-2">
                <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <span>โปรไฟล์</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer transition-all duration-200 rounded-md hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={resetUserState}
            >
              <div className="flex items-center p-2">
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <span>ออกจากระบบ</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button
            variant="ghost"
            asChild
            className="transition-all duration-200 hover:bg-accent/50"
          >
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
          <Button
            variant="primary"
            asChild
            className="transition-all duration-200 hover:shadow-md"
          >
            <Link href="/signup">
              <FontAwesomeIcon icon={faUserPlus} className="h-5 w-5 mr-3" />
              <span>สมัครสมาชิก</span>
            </Link>
          </Button>
        </>
      )}
    </div>
  );
} 