"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { User } from "@/types/users";
import { NavItem } from "@/types/navbar";
import { 
  faHome, 
  faStore, 
  faExclamation,
  faChartBar,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from "@/contexts/UserContext";

export default function useNavigation() {
  const { data: session, status } = useSession();
  const { currentUser } = useUser();
  const isAuthenticated = !!currentUser || status === "authenticated";
  
  // Generate navigation items based on user role
  const navItems = useMemo(() => {
    const baseItems: NavItem[] = [
      { name: "หน้าแรก", href: "/", icon: faHome },
      { name: "ร้านค้า", href: "/stores", icon: faStore },
      { name: "แจ้งร้านโกง", href: "/report", icon: faExclamation },
    ];

    // Use currentUser from UserContext if available, otherwise fall back to session
    const user = currentUser || (session?.user as unknown as User);

    if (user) {
      const userItems: NavItem[] = [
        { name: "ยืนยันตัวตน", href: "/verify", icon: faCheck },
      ];

      if (user.role === "admin") {
        userItems.push({ name: "แดชบอร์ดแอดมิน", href: "/admin", icon: faChartBar });
      }

      return [...baseItems, ...userItems];
    }

    return baseItems;
  }, [currentUser, session]);

  return {
    status,
    isAuthenticated,
    navItems
  };
} 