"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Store } from "@/types/stores";
import { useSession } from "next-auth/react";

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
  getFeaturedStores: (limit?: number) => Store[];
  getStoreById: (storeId: number | string) => Promise<Store | null>;
}

interface StoreProviderProps {
  children: ReactNode;
  initialStores?: Store[];
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export function StoreProvider({ children, initialStores = [] }: StoreProviderProps) {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [adminStores, setAdminStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(
    initialStores.length > 0 ? Date.now() : null
  );
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch stores from API
  const fetchStores = async (force = false) => {
    // If we have stores and they were fetched less than 1 minute ago, don't refetch
    // unless force is true
    if (
      !force && 
      stores.length > 0 && 
      lastFetched && 
      Date.now() - lastFetched < 60000
    ) {
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
        setStores(data.data);
        setLastFetched(Date.now());
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch stores');
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err instanceof Error ? err.message : String(err));
      return stores; // Return existing stores on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminStores = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL || ''}/api/stores`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
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
  }

  // Initialize with API data only if no initialStores were provided
  useEffect(() => {
    // Only fetch from client-side if we didn't get initialStores from server
    if (initialStores.length === 0) {
      fetchStores();
    }
  }, []);

  const updateStore = async (storeId: number, updates: Partial<Store>) => {
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
        setStores((prevStores) =>
          prevStores.map((store) =>
            store.id === storeId ? { ...store, ...data.data.storeDetail } : store
          )
        );
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update store');
      }
    } catch (err) {
      console.error('Error updating store:', err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStore = async (storeId: number) => {
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
        setStores((prevStores) =>
          prevStores.filter((store) => store.id !== storeId)
        );
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete store');
      }
    } catch (err) {
      console.error('Error deleting store:', err);
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addStore = async (newStore: FormData) => {
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
        setStores((prevStores) => [...prevStores, data.data]);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to add store');
      }
    } catch (err) {
      console.error('Error adding store:', err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStores = async () => {
    try {
      setIsLoading(true);
      const updatedStores = await fetchStores(true);
      router.refresh(); // Refresh the current page to reflect new data
      return updatedStores;
    } catch (err) {
      console.error('Error refreshing stores:', err);
      return stores;
    } finally {
      setIsLoading(false);
    }
  };

  // Get featured stores (verified stores)
  const getFeaturedStores = (limit = 3) => {
    return stores
      .filter(store => store.isVerified)
      .slice(0, limit);
  };

  // Add a method to get a store by ID
  const getStoreById = async (storeId: number | string): Promise<Store | null> => {
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
        throw new Error(`Error fetching store: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.statusCode === 200 && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch store');
      }
    } catch (err) {
      console.error('Error fetching store by ID:', err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

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