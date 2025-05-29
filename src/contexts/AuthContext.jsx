"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Update loading state based on NextAuth session status
  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  const login = async (email, password) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      
      return !result?.error;
    } catch  {
      return false;
    }
  };

  const register = async (userData) => {
    try {
      // Make a POST request to your registration API endpoint
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      return true;
    } catch { 
      return false;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const checkAuth = () => {
    return !!session?.user;
  };

  // Don't render children until we've checked session status
  if (isLoading) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user: session?.user || null, 
        login, 
        register, 
        logout, 
        checkAuth,
        isAuthenticated: !!session?.user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
