import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faHome, 
  faStore, 
  faExclamation, 
  faSpellCheck, 
  faChartBar,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import logo from "@images/logo.png";
import { User } from "@/types/users";

// Define types for NavItem and User
type NavItem = {
  name: string;
  href: string;
  icon: IconDefinition;
};


// Server-side function to get navigation items
function getNavItems(user?: User): NavItem[] {
  const baseItems: NavItem[] = [
    { name: "หน้าแรก", href: "/", icon: faHome },
    { name: "ร้านค้า", href: "/stores", icon: faStore },
    { name: "แจ้งร้านโกง", href: "/report", icon: faExclamation },
  ];

  if (user) {
    const userItems: NavItem[] = [
      { name: "ยืนยันตัวตน", href: "/verify", icon: faSpellCheck },
    ];

    if (user.role === "admin") {
      userItems.push({ name: "แดชบอร์ดแอดมิน", href: "/admin", icon: faChartBar });
    }

    return [...baseItems, ...userItems];
  }

  return baseItems;
}

export default async function NavBar() {
  const session = await getServerSession(authOptions);
  const user = session?.user as unknown as User;
  const navItems = getNavItems(user);

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white backdrop-blur-md border-b border-gray-100 z-50">
      <nav
        className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        aria-label="Global"
      >
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 pb-0">
            <Image
              src={logo}
              alt="Goodlistseller logo"
              width={72}
              height={72}
              className="h-10 sm:h-16 w-auto object-contain"
              priority
              quality={100}
              unoptimized
            />
          </Link>
        </div>

        {/* Mobile menu button */}
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
                  <div className="space-y-1 py-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block rounded-lg px-4 py-3 text-base font-semibold text-gray-900 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={item.icon} className="h-5 w-5 text-blue-600 mr-3" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="py-4 space-y-1">
                    {user ? (
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
                        <Link
                          href="/logout"
                          className="block rounded-lg px-4 py-3 text-base font-semibold text-gray-900 hover:bg-red-50 active:bg-red-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5 text-red-500 mr-3" />
                            <span>ออกจากระบบ</span>
                          </div>
                        </Link>
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
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2 duration-200"
            >
              <FontAwesomeIcon icon={item.icon} className="h-5 w-5 inline-block mr-1" />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full transition-all duration-300 hover:bg-accent/50 hover:scale-105 focus:ring-2 focus:ring-blue-500/20"
                >
                  <Avatar className="h-9 w-9 transition-transform duration-300 group-hover:scale-110 cursor-pointer">
                    <AvatarImage
                      src={user.image || undefined}
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
                className="w-64 p-2 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border border-gray-100 shadow-lg bg-gradient-to-b from-white to-blue-50/30"
                align="end"
                forceMount
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal p-3 flex items-center gap-3">
                  <Avatar className="h-9 w-9 transition-transform duration-300 group-hover:scale-110 cursor-pointer">
                    <AvatarImage
                      src={user.image || undefined}
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
                <DropdownMenuSeparator className="my-1 bg-gray-100" />
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
                >
                  <Link href="/logout" className="flex items-center p-2">
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>ออกจากระบบ</span>
                  </Link>
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
      </nav>
    </header>
  );
} 