"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navbar";


interface NavItemsProps {
  items: NavItem[];
  isMobile?: boolean;
}

export default function NavItems({ items, isMobile = false }: NavItemsProps) {
  const pathname = usePathname();
  
  // Check if a nav item is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Different styling for mobile vs desktop
  if (isMobile) {
    return (
      <div className="space-y-1 py-4">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "block rounded-lg px-4 py-3 text-base font-semibold text-gray-900 transition-colors",
                active 
                  ? "bg-blue-50 text-blue-600" 
                  : "hover:bg-blue-50 active:bg-blue-100"
              )}
            >
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={cn(
                    "h-5 w-5 mr-3",
                    active ? "text-blue-600 hover" : "text-blue-500"
                  )} 
                />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="hidden lg:flex lg:gap-x-12">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "text-sm font-semibold leading-6 transition-colors flex items-center gap-2 duration-200 relative py-4 group",
              active 
                ? "text-blue-600" 
                : "text-gray-900 group-hover:text-blue-600"
            )}
          >
            <FontAwesomeIcon 
              icon={item.icon} 
              className={cn(
                "h-5 w-5 inline-block mr-1",
                active ? "text-blue-600" : "text-gray-700 group-hover:text-blue-600"
              )} 
            />
            <span className="group-hover:text-blue-600">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
} 