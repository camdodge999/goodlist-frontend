"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Store } from "@/types/stores";
import { useSession } from "next-auth/react";

// Static cache to track if stores have been fetched globally
let globalStoresCache: Store[] = [];

interface StoreContextProps {
  stores: Store[];
  adminStores: Store[];
  updateStore: (storeId: number, updates: Partial<Store>) => Promise<Store | null>;
  deleteStore: (storeId: number) => Promise<boolean>;
  addStore: (newStore: FormData) => Promise<Store | null>;
  isLoading: boolean;
  error: string | null;
  refreshStores: () => Promise<Store[]>;
  fetchStores: (force?: boolean) => Promise<Store[]>;
  fetchAdminStores: () => Promise<Store[]>;
  verifyStore: (storeId: number, isVerified: boolean, isBanned?: boolean) => Promise<Store | null>;
  getFeaturedStores: (limit?: number) => Store[];
  getStoreById: (storeId: number | string) => Promise<Store | null>;
}

interface StoreProviderProps {
  children: ReactNode;
  initialStores?: Store[];
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export function StoreProvider({ children, initialStores = [] }: StoreProviderProps) {
  // Initialize stores from global cache if available, otherwise use initialStores
  const [stores, setStores] = useState<Store[]>(
    globalStoresCache.length > 0 ? globalStoresCache : initialStores
  );
  const [adminStores, setAdminStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add a state to track fetch failures
  const [fetchFailed, setFetchFailed] = useState(false);
  // Add retry counter for failed attempts
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRY_ATTEMPTS = 3;
  // Add state to track successful initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch stores from API - only fetch once unless forced
  const fetchStores = useCallback(async (force = false) => {
    // If we already have stores and it's not a forced refresh, return existing stores
    if (!force && (globalStoresCache.length > 0 || stores.length > 0)) {
      setIsLoading(false);
      return stores.length > 0 ? stores : globalStoresCache;
    }

    // If we have reached max retry attempts and it's not a forced refresh, don't retry
    if (retryCount >= MAX_RETRY_ATTEMPTS && !force) {
      setIsLoading(false);
      return stores;
    }

    // If we have a previous fetch failure and it's not a forced refresh, don't retry
    if (fetchFailed && !force) {
      return stores;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ''}/api/stores`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // Don't cache this request at the network level
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching stores: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        // Update both local state and global cache
        setStores(data.data);
        globalStoresCache = data.data;

        // Reset fetch failure flag and retry count on success
        setFetchFailed(false);
        setRetryCount(0);
        // Mark as successfully initialized
        setIsInitialized(true);

        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch stores');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));

      // Increment retry count and set fetch failed flag
      setRetryCount(prev => prev + 1);
      setFetchFailed(true);

      return stores; // Return existing stores on error
    } finally {
      setIsLoading(false);
    }
  }, [fetchFailed, retryCount, MAX_RETRY_ATTEMPTS, stores]);

  const fetchAdminStores = useCallback(async () => {
    if (!session?.user?.token) return adminStores;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ''}/api/stores`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching admin stores: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        setAdminStores(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch admin stores');
      }
    } catch {
      return adminStores;
    }
  }, [session?.user?.token, adminStores]);

  // Initialize with API data only if no initialStores were provided and global cache is empty
  useEffect(() => {
    // Don't fetch if already successfully initialized
    if (isInitialized) {
      setIsLoading(false);
      return;
    }

    // Don't fetch if we've reached max retry attempts
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setIsLoading(false);
      return;
    }

    // Don't fetch if stores exist (length > 0) unless both caches are empty
    if (stores.length > 0 && globalStoresCache.length > 0) {
      setIsLoading(false);
      setIsInitialized(true); // Mark as initialized if we already have data
      return;
    }

    if (globalStoresCache.length === 0 && initialStores.length === 0) {
      fetchStores();
    } else if (initialStores.length > 0 && globalStoresCache.length === 0) {
      // If we have initialStores but no global cache, update the global cache
      globalStoresCache = initialStores;
      setIsLoading(false);
      setIsInitialized(true); // Mark as initialized with initial stores
    }
  }, [fetchStores, initialStores, retryCount, MAX_RETRY_ATTEMPTS, stores.length, isInitialized]);

  // Update local stores when global cache changes - only run once on mount
  useEffect(() => {
    if (globalStoresCache.length > 0 && JSON.stringify(stores) !== JSON.stringify(globalStoresCache)) {
      setStores(globalStoresCache);
    }
  }, []);

  const updateStore = useCallback(async (storeId: number, updates: Partial<Store>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure storeId is properly converted to string for the URL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ''}/api/stores/${storeId.toString()}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session?.user?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating store: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        // Update both local state and global cache
        const updatedStores = stores.map((store) =>
          store.id === storeId ? { ...store, ...data.data.storeDetail } : store
        );

        setStores(updatedStores);
        globalStoresCache = updatedStores;

        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update store');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, stores]);

  const verifyStore = useCallback(async (storeId: number, isVerified: boolean, isBanned?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ''}/api/stores/verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.user?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: storeId,
            isVerified: isVerified,
            isBanned: isBanned,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error verifying store: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.statusCode === 201 && data.data) {
        // Update both local state and global cache
        const updatedStores = stores.map((store) =>
          store.id === storeId ? { ...store, ...data.data } : store
        );
        const updatedAdminStores = adminStores.map((store) =>
          store.id === storeId ? { ...store, ...data.data } : store
        );

        setStores(updatedStores);
        setAdminStores(updatedAdminStores);
        globalStoresCache = updatedStores;

        return data.data;
      } else {
        throw new Error(data.message || 'Failed to verify store');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, stores, adminStores]);


  const deleteStore = useCallback(async (storeId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure storeId is properly converted to string for the URL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ''}/api/stores/${storeId.toString()}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.user?.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error deleting store: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.statusCode === 200) {
        // Update both local state and global cache
        const filteredStores = stores.filter((store) => store.id !== storeId);

        setStores(filteredStores);
        globalStoresCache = filteredStores;

        return true;
      } else {
        throw new Error(data.message || 'Failed to delete store');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, stores]);

  const addStore = useCallback(async (newStore: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ''}/api/stores`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.user?.token}`,
          },
          body: newStore,
        }
      );

      if (!response.ok) {
        throw new Error(`Error adding store: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.statusCode === 201 && data.data) {
        // Update both local state and global cache
        const updatedStores = [...stores, data.data];

        setStores(updatedStores);
        globalStoresCache = updatedStores;

        return data.data;
      } else {
        throw new Error(data.message || 'Failed to add store');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, stores]);

  const refreshStores = useCallback(async () => {
    try {
      setIsLoading(true);
      // Reset initialization flag for forced refresh
      setIsInitialized(false);
      // Force refresh ignores the fetchFailed flag
      const updatedStores = await fetchStores(true);
      router.refresh(); // Refresh the current page to reflect new data
      return updatedStores;
    } catch {
      return stores;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStores, router, stores]);

  // Get featured stores (verified stores)
  const getFeaturedStores = useMemo(() => {
    return (limit = 3) => {
      return stores
        .filter(store => store.isVerified)
        .slice(0, limit);
    };
  }, [stores]);

  // Add a method to get a store by ID
  const getStoreById = useCallback(async (storeId: number | string): Promise<Store | null> => {
    try {
      // First check if we have it in our local state
      const role = session?.user?.role;
      const localStore = role === "admin" ? adminStores.find(store => store.id === Number(storeId)) : stores.find(store => store.id === Number(storeId));
      if (localStore) {
        return localStore;
      }

      // If not in local state, fetch from API
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ''}/api/stores/${storeId.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(`มีข้อผิดพลาดในการดึงข้อมูลร้านค้า: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        return data.data;
      } else if (data.statusCode === 404) {
        return null;
      } else {
        throw new Error(data.message || 'มีข้อผิดพลาดในการดึงข้อมูลร้านค้า');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminStores, session?.user?.role, stores]);

  return (
    <StoreContext.Provider
      value={{
        stores,
        adminStores,
        updateStore,
        deleteStore,
        addStore,
        isLoading,
        error,
        refreshStores,
        fetchStores,
        fetchAdminStores,
        verifyStore,
        getFeaturedStores,
        getStoreById,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
} 