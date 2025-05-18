"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "@/types/users";

interface UserContextProps {
  currentUser: User | null;
  updateUser: (userId: string, updates: Partial<User>) => Promise<User | null>;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<User | null>;
  fetchUserProfile: (userId: string) => Promise<User | null>;
  verifyUser: (userId: string, verificationData: any) => Promise<boolean>;
  getVerificationStatus: () => "not_started" | "pending" | "verified" | "banned";
}

interface UserProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export function UserProvider({ children, initialUser = null }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  // Fetch user profile from API
  const fetchUserProfile = async (userId: string) => {
    // Prevent concurrent fetch requests
    if (isFetchingProfile) return null;
    
    try {
      setIsFetchingProfile(true);
      setIsLoading(true);
      setError(null);
      
      // Use the API route which handles auth token extraction from the session
      const response = await fetch(`/api/user/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Error fetching user profile: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.statusCode === 200 && data.data) {
        setCurrentUser(data.data);
        setRetryCount(0); // Reset retry count on success
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
      setIsFetchingProfile(false);
    }
  };

  // Automatic retry mechanism for failed profile fetches
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    if (error && session?.user?.id && retryCount < 3) {
      // Wait 5 seconds before retry
      retryTimeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Add null check for TypeScript
        if (session.user?.id) {
          fetchUserProfile(session.user.id);
        }
      }, 5000);
    }
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [error, session?.user?.id, retryCount]);

  // Fetch current user when session changes
  useEffect(() => {
    // Only fetch if we have a session, no current user, and not currently fetching
    if (session?.user?.id && !currentUser && !isFetchingProfile) {
      fetchUserProfile(session.user.id);
    }
  }, [session]);

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the API route which handles auth token extraction from the session
      const response = await fetch(`/api/user/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Error updating user: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.statusCode === 200 && data.data) {
        setCurrentUser(prevUser => 
          prevUser && prevUser.id === userId ? { ...prevUser, ...data.data } : prevUser
        );
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUser = async (userId: string, verificationData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create API endpoint for verification if it doesn't exist
      const apiUrl = `/api/user/verify/${userId}`;
      
      // For FormData, don't set Content-Type header - browser will set it with boundary
      const options: RequestInit = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: verificationData,
      };
      
      // Only set Content-Type for JSON data
      if (!(verificationData instanceof FormData)) {
        if (options.headers) {
          (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
        }
      }
      
      const response = await fetch(apiUrl, options);

      if (!response.ok) {
        throw new Error(`Error verifying user: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.statusCode === 200) {
        // Update user role to pending without a full refetch
        setCurrentUser(prev => prev ? {...prev, role: "pending"} : null);
        return true;
      } else {
        throw new Error(data.message || 'Failed to verify user');
      }
    } catch (err) {
      console.error('Error verifying user:', err);
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!session?.user?.id) return null;
    
    try {
      setIsLoading(true);
      const updatedUser = await fetchUserProfile(session.user.id);
      router.refresh(); // Refresh the current page to reflect new data
      return updatedUser;
    } catch (err) {
      console.error('Error refreshing user:', err);
      return currentUser;
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationStatus = () => {
    if (!currentUser) return "not_started";

    // In a real app, this would check verification status from the user object
    // For now, we'll use a simple mock implementation
    if (currentUser.role === "banned") {
      return "banned";
    } else if (currentUser.role === "verified") {
      return "verified";
    } else if (currentUser.role === "pending") {
      return "pending";
    } else {
      return "not_started";
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        updateUser,
        isLoading,
        error,
        refreshUser,
        fetchUserProfile,
        verifyUser,
        getVerificationStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

