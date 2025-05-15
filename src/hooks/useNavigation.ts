"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { User } from "@/types/users";
import { NavItem } from "@/types/navbar";
import { 
  faHome, 
  faStore, 
  faExclamation, 
  faSpellCheck, 
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';

export default function useNavigation() {
  const { data: session, status } = useSession();
  const user = session?.user as unknown as User;
  const isAuthenticated = status === "authenticated";
  
  // Generate navigation items based on user role
  const navItems = useMemo(() => {
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
  }, [user]);

  return {
    user,
    status,
    isAuthenticated,
    navItems
  };
} 