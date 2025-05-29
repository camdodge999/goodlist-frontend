"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { Session } from "next-auth";
import { User } from "@/types/users";
import { Store } from "@/types/stores";

// Add this at the top of the file after imports
declare global {
  interface Window {
    __fetchingStores?: boolean;
    __isLoggingOut?: boolean;
  }
}


interface BaseUserPasswordProps {
  userId: string;
  email: string;
  oldPassword: string;  
  newPassword: string;
  confirmPassword: string;
  displayName: string;
}

interface VerifyUserPasswordProps extends BaseUserPasswordProps {
  otpCode: string;
  otpToken?: string;
}

interface BaseUserEmailProps{
  userId: string;
  email: string;
  newEmail: string;
  password: string;
}

interface VerifyUserEmailProps extends BaseUserEmailProps {
  otpCode: string;
  otpToken?: string;
}


interface UserContextProps {
  currentUser: User | null;
  userStores: Store[];
  updateUser: (userId: string, updates: Partial<User> | FormData) => Promise<User | null>;
  changeUserEmail: (props: BaseUserEmailProps) => Promise<User | null>;
  changeUserPassword: (props: BaseUserPasswordProps) => Promise<any>;
  isLoading: boolean;
  storesLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<User | null>;
  fetchUserProfile: (userId: string, forceRefresh?: boolean) => Promise<User | null>;
  verifyUserPassword: (props: VerifyUserPasswordProps) => Promise<any>;
  verifyUserEmail: (props: VerifyUserEmailProps) => Promise<any>;
  verifyUser: (userId: string, verificationData: FormData | object) => Promise<boolean>;
  getVerificationStatus: () => "not_started" | "pending" | "verified" | "banned";
  getLastFetchError: () => string | null;
  clearConnectionRefused: (userId: string) => void;
  isConnectionRefused: (userId: string) => boolean;
  signOut: () => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialSession?: Session | null;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export function UserProvider({ children, initialUser = null, initialSession = null }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [userStores, setUserStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(!!initialSession?.user && !initialUser);
  const [storesLoading, setStoresLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track state without causing re-renders
  const isFetchingProfile = useRef(false);
  const lastFetchError = useRef<string | null>(null);
  const connectionRefusedUsers = useRef<Set<string>>(new Set());
  const isLoggingOut = useRef(false);
  const currentUserRef = useRef<User | null>(initialUser);
  const hasInitialFetch = useRef(false);
  
  const { data: session } = useSession();
  const router = useRouter();

  // Update ref when currentUser changes
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Sign out function - defined early to be used in other functions
  const signOut = async () => {
    // Set logout flag to prevent infinite loops
    isLoggingOut.current = true;
    
    // Reset user context data
    setCurrentUser(null);
    setUserStores([]);
    currentUserRef.current = null;
    hasInitialFetch.current = false;

    // Call NextAuth signOut
    await nextAuthSignOut({ redirect: false });
    
    // Reset the flag after a delay to allow NextAuth to complete
    setTimeout(() => {
      isLoggingOut.current = false;
    }, 1000);
  };

  // Helper function to handle 401 errors consistently
  const handle401Error = async (data: any, response: Response) => {
    if (data.statusCode === 401 || response.status === 401) {
      setError('Session expired. Please log in again.');
      
      // Only logout if we're not already in the process of logging out
      if (!isLoggingOut.current) {
        await signOut();
      }
      return true; // Indicates 401 was handled
    }
    return false; // No 401 error
  };

  // Fetch user profile from API with cache support
  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false): Promise<User | null> => {
    // Prevent fetching if we're in the process of logging out
    if (isLoggingOut.current) {
      return null;
    }

    // Prevent concurrent fetches
    if (isFetchingProfile.current && !forceRefresh) {
      return currentUserRef.current;
    }

    // If we already have the user and it's not a forced refresh, return the cached user
    if (!forceRefresh && currentUserRef.current?.id === userId) {
      return currentUserRef.current;
    }

    // Check if this user has experienced ECONNREFUSED and prevent further attempts unless forced
    if (!forceRefresh && connectionRefusedUsers.current.has(userId)) {
      return null;
    }

    // Check if we have a valid session token
    if (!session?.user?.token) {
      return null;
    }

    // Set loading and fetching state
    setIsLoading(true);
    isFetchingProfile.current = true;

    try {
      setError(null);

      // Fetch user profile from API
      const response = await fetch(`/api/user/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      // Always try to parse JSON response, even for error status codes
      const data = await response.json();

      // Check for 401 status code and logout user
      if (await handle401Error(data, response)) {
        return null;
      }

      // Handle successful response
      if (data.statusCode === 200 && data.data) {
        // Clear any previous fetch errors on successful fetch
        lastFetchError.current = null;
        // Remove user from connection refused list on successful fetch
        connectionRefusedUsers.current.delete(userId);
        
        // Update user data
        setCurrentUser(data.data);
        currentUserRef.current = data.data;

        // After setting user data, fetch the user's stores separately
        // Only fetch stores if we're not in an infinite loop situation
        if (!window.__fetchingStores) {
          fetchUserStores(userId);
        }

        return data.data;
      } else {
        // Handle error responses (400, 404, 500, etc.) with detailed message from API
        const errorMessage = data.message || `Error: ${response.statusText}`;
        lastFetchError.current = errorMessage;
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Check for ECONNREFUSED error and mark user to prevent future attempts
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
        connectionRefusedUsers.current.add(userId);
      }
      
      lastFetchError.current = errorMessage;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
      isFetchingProfile.current = false;
    }
  }, [session?.user?.token]); // Keep session token dependency to handle token changes

  // Fetch current user when session changes or on initial load with server session
  useEffect(() => {
    // Don't fetch if we're in the process of logging out
    if (isLoggingOut.current) {
      return;
    }
    
    const activeSession = session || initialSession;
    
    // Only fetch if we have a session, user ID, and haven't done initial fetch
    if (activeSession?.user?.id && !hasInitialFetch.current && !isFetchingProfile.current) {
      hasInitialFetch.current = true;
      fetchUserProfile(activeSession.user.id);
    }
  }, [session?.user?.id, fetchUserProfile]); // Added proper dependencies

  // Cleanup effect to reset logout flag on unmount
  useEffect(() => {
    return () => {
      isLoggingOut.current = false;
      isFetchingProfile.current = false;
    };
  }, []);

  const updateUser = async (userId: string, updates: Partial<User> | FormData) => {
    try {
      setIsLoading(true);
      setError(null);

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

      const data = await response.json();

      // Check for 401 status code and logout user
      if (await handle401Error(data, response)) {
        return null;
      }

      if (!response.ok) {
        throw new Error(data.message || `Error updating user: ${response.statusText}`);
      }

      if (data.statusCode === 200 && data.data) {
        // Update the current user in state
        setCurrentUser(prevUser =>
          prevUser && prevUser.id === userId ? { ...prevUser, ...data.data } : prevUser
        );
        // Also update the ref
        currentUserRef.current = currentUserRef.current && currentUserRef.current.id === userId 
          ? { ...currentUserRef.current, ...data.data } 
          : currentUserRef.current;

        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUser = async (userId: string, verificationData: FormData | object) => {
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
        body: verificationData as unknown as BodyInit,
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
        setCurrentUser(prev => prev ? { ...prev, role: "pending" } : null);
        if (currentUserRef.current) {
          currentUserRef.current = { ...currentUserRef.current, role: "pending" };
        }

        return true;
      } else {
        throw new Error(data.message || 'Failed to verify user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    if (!session?.user?.id) return null;

    try {
      // Clear connection refused status before attempting refresh
      clearConnectionRefused(session.user.id);
      
      // Force refresh by passing true
      const updatedUser = await fetchUserProfile(session.user.id, true);
      router.refresh(); // Refresh the current page to reflect new data
      return updatedUser;
    } catch {
      return currentUserRef.current;
    }
  }, [session?.user?.id, fetchUserProfile]); // Removed currentUser and isFetchingProfile from dependencies
  

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

      const data = await response.json();

      // Check for 401 status code and logout user
      if (await handle401Error(data, response)) {
        return;
      }

      if (!response.ok) {
        return;
      }

      if (data.statusCode === 200 && data.data?.stores) {
        setUserStores(data.data.stores);
      }
    } catch {
      // Don't throw the error to prevent breaking the main user profile flow
    } finally {
      // Reset the flag
      window.__fetchingStores = false;
      // Set stores loading state to false
      setStoresLoading(false);
    }
  };

  const changeUserEmail = async ({
    userId,
    email,
    newEmail,
    password
  }: BaseUserEmailProps) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create data with email and password
      const data = {
        email: email,
        newEmail: newEmail,
        password: password
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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error updating email: ${response.statusText}`);
      }

      if (responseData.statusCode === 200 && responseData.data) {
        // Update the current user in state
        setCurrentUser(prevUser =>
          prevUser && prevUser.id === userId ? { ...prevUser } : prevUser
        );
        // Also update the ref
        if (currentUserRef.current && currentUserRef.current.id === userId) {
          currentUserRef.current = { ...currentUserRef.current, ...responseData.data };
        }

        // Update last email change time in localStorage
        localStorage.setItem("lastEmailChange", new Date().toISOString());

        return responseData.data;
      } else {
        throw new Error(responseData.message || 'Failed to update email');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err; // Re-throw the error so it can be caught by the calling component
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUserEmail = async ({
    userId,
    email,
    newEmail,
    password,
    otpCode,
    otpToken
  }: VerifyUserEmailProps): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/user/email/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email, newEmail, password, otpCode, otpToken }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error verifying user email: ${response.statusText}`);
      }

      return responseData;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err; // Re-throw the error so it can be caught by the calling component
    } finally {
      setIsLoading(false);
    }
  }

  const changeUserPassword = async ({
    userId,
    oldPassword,
    newPassword,
    confirmPassword,
    email,
    displayName
  }: BaseUserPasswordProps): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);

      // Create data with passwords
      const data = {
        oldPassword,
        newPassword,
        confirmPassword,
        email,
        displayName
      };

      // Use a specific API endpoint for password change
      const response = await fetch(`/api/user/password/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error updating password: ${response.statusText}`);
      }

      if (responseData.statusCode === 200) {
        return responseData;
      } else {
        throw new Error(responseData.message || 'Failed to update password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err; // Re-throw the error so it can be caught by the calling component
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUserPassword = async ({
    userId,
    email,
    otpCode,
    otpToken,
    oldPassword,
    newPassword,
    confirmPassword,
    displayName
  }: VerifyUserPasswordProps): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/user/password/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email, otpCode, otpToken, oldPassword, newPassword, confirmPassword, displayName }),
      }); 

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error verifying password: ${response.statusText}`);
      }

      return responseData;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err; // Re-throw the error so it can be caught by the calling component
    } finally {
      setIsLoading(false);
    }
  };

  const getLastFetchError = () => {
    return lastFetchError.current;
  };

  const clearConnectionRefused = (userId: string) => {
    connectionRefusedUsers.current.delete(userId);
  };

  const isConnectionRefused = (userId: string) => {
    return connectionRefusedUsers.current.has(userId);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        userStores,
        updateUser,
        changeUserEmail,
        verifyUserEmail,
        changeUserPassword,
        verifyUserPassword,
        isLoading,
        storesLoading,
        error,
        refreshUser,
        fetchUserProfile,
        verifyUser,
        getVerificationStatus,
        getLastFetchError,
        signOut,
        clearConnectionRefused,
        isConnectionRefused,
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