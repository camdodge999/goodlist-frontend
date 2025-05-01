"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockUsers } from "@/data/mockData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Verify user still exists in mock data
      const existingUser = mockUsers.find((u) => u.id === parsedUser.id);
      if (existingUser) {
        setUser(parsedUser);
      } else {
        // Clear invalid session
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    // Find the user in mock data
    const existingUser = mockUsers.find((u) => u.email === email);

    // For demo purposes, all passwords are "password123"
    if (existingUser && password === "password123") {
      setUser(existingUser);
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(existingUser));
      return true;
    }
    return false;
  };

  const register = async (email, password) => {
    // Check if email already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return false;
    }

    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      email,
      role: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to mock data
    mockUsers.push(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    // Only clear user data from localStorage
    localStorage.removeItem("user");
    // Redirect to login page using Next.js router
    router.push("/login");
  };

  const checkAuth = () => {
    return !!user;
  };

  // Don't render children until we've checked localStorage
  if (isLoading) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, checkAuth }}>
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
