"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { User } from "@/types/users";
import { Store } from "@/types/stores";

// Add this at the top of the file after imports
declare global {
  interface Window {
    __fetchingStores?: boolean;
  }
}

interface UserContextProps {
  currentUser: User | null;
  userStores: Store[];
  updateUser: (userId: string, updates: Partial<User> | FormData) => Promise<User | null>;
  changeUserEmail: (userId: string, newEmail: string, currentPassword: string) => Promise<User | null>;
  isLoading: boolean;
  storesLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<User | null>;
  fetchUserProfile: (userId: string, forceRefresh?: boolean) => Promise<User | null>;
  verifyUser: (userId: string, verificationData: any) => Promise<boolean>;
  getVerificationStatus: () => "not_started" | "pending" | "verified" | "banned";
  signOut: () => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

// Create a promise cache to prevent duplicate requests
const requestCache: Record<string, Promise<any>> = {};

export function UserProvider({ children, initialUser = null }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [userStores, setUserStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const lastFetchTime = useRef<Record<string, number>>({});
  const { data: session } = useSession();
  const router = useRouter();

  // Cache time in milliseconds (5 minutes)
  const CACHE_TIME = 5 * 60 * 1000;

  // Fetch user profile from API with cache support
  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false): Promise<User | null> => {
    const cacheKey = `user_${userId}`;
    
    // If we already have the user and force refresh is not set, 
    // and we fetched less than CACHE_TIME ago, return the cached user
    if (
      !forceRefresh && 
      currentUser?.id === userId && 
      lastFetchTime.current[cacheKey] && 
      Date.now() - lastFetchTime.current[cacheKey] < CACHE_TIME
    ) {
      return currentUser;
    }
    
    // If there's already a request in progress for this user, return that promise
    if (!forceRefresh && cacheKey in requestCache) {
      return requestCache[cacheKey];
    }
    
    // Set loading state only if we're actually going to fetch
    setIsLoading(true);
    
    // Create the fetch promise
    const fetchPromise = (async () => {
      try {
        setIsFetchingProfile(true);
        setError(null);
        
        // Use the original API path
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
          // Update user data
          setCurrentUser(data.data);
          lastFetchTime.current[cacheKey] = Date.now();
          
          // After setting user data, fetch the user's stores separately
          // Only fetch stores if we're not in an infinite loop situation
          if (!window.__fetchingStores) {
            fetchUserStores(userId);
          }
          
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
        // Remove the request from cache once it's done
        delete requestCache[cacheKey];
      }
    })();
    
    // Store the promise in the cache
    requestCache[cacheKey] = fetchPromise;
    
    return fetchPromise;
  }, [session]);

  // Fetch current user when session changes
  useEffect(() => {
    if (session?.user?.id && !currentUser && !isFetchingProfile) {
      fetchUserProfile(session.user.id);
    }
  // Use stable reference check for fetchUserProfile
  }, [session, currentUser, isFetchingProfile, fetchUserProfile]);

  const updateUser = async (userId: string, updates: Partial<User> | FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(updates);
      
      // Check if updates is FormData or a regular object
      const isFormData = updates instanceof FormData;
      
      // Configure headers based on content type
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session?.user?.token}`,
      };
      
      // Only add Content-Type for JSON, browser will set it with boundary for FormData
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      
      // Use the API route which handles auth token extraction from the session
      const response = await fetch(`/api/user/profile/${userId}`, {
        method: 'PUT',
        headers,
        body: isFormData ? updates : JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Error updating user: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.statusCode === 200 && data.data) {
        // Update the current user in state
        setCurrentUser(prevUser => 
          prevUser && prevUser.id === userId ? { ...prevUser, ...data.data } : prevUser
        );
        
        // Update the last fetch time so we don't refetch immediately
        const cacheKey = `user_${userId}`;
        lastFetchTime.current[cacheKey] = Date.now();
        
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
        
        // Update the last fetch time
        const cacheKey = `user_${userId}`;
        lastFetchTime.current[cacheKey] = Date.now();
        
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
      // Force refresh by passing true
      const updatedUser = await fetchUserProfile(session.user.id, true);
      router.refresh(); // Refresh the current page to reflect new data
      return updatedUser;
    } catch (err) {
      console.error('Error refreshing user:', err);
      return currentUser;
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

  // Add a new function to fetch stores for a user
  const fetchUserStores = async (userId: string) => {
    try {
      // Use a global flag to prevent infinite loop
      if (window.__fetchingStores) return;
      window.__fetchingStores = true;
      
      // Set stores loading state to true
      setStoresLoading(true);
      
      const response = await fetch(`/api/user/store/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`Error fetching user stores: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      
      if (data.statusCode === 200 && data.data?.stores) {
        setUserStores(data.data.stores);
      }
    } catch (err) {
      console.error('Error fetching user stores:', err);
      // Don't throw the error to prevent breaking the main user profile flow
    } finally {
      // Reset the flag
      window.__fetchingStores = false;
      // Set stores loading state to false
      setStoresLoading(false);
    }
  };

  const changeUserEmail = async (userId: string, newEmail: string, currentPassword: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create data with email and password
      const data = {
        email: newEmail,
        currentPassword
      };
      
      // Use a specific API endpoint for email change that requires password verification
      const response = await fetch(`/api/user/email/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error updating email: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      if (responseData.statusCode === 200 && responseData.data) {
        // Update the current user in state
        setCurrentUser(prevUser => 
          prevUser && prevUser.id === userId ? { ...prevUser, ...responseData.data } : prevUser
        );
        
        // Update the last fetch time so we don't refetch immediately
        const cacheKey = `user_${userId}`;
        lastFetchTime.current[cacheKey] = Date.now();
        
        // Update last email change time in localStorage
        localStorage.setItem("lastEmailChange", new Date().toISOString());
        
        return responseData.data;
      } else {
        throw new Error(responseData.message || 'Failed to update email');
      }
    } catch (err) {
      console.error('Error updating email:', err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    // Reset user context data
    setCurrentUser(null);
    setUserStores([]);
      
    // Call NextAuth signOut
    await nextAuthSignOut({redirect: false});
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        userStores,
        updateUser,
        changeUserEmail,
        isLoading,
        storesLoading,
        error,
        refreshUser,
        fetchUserProfile,
        verifyUser,
        getVerificationStatus,
        signOut,
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

