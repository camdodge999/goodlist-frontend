"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Store } from "@/types/stores";

interface StoreContextProps {
  stores: Store[];
  updateStore: (storeId: number, updates: Partial<Store>) => void;
  deleteStore: (storeId: number) => void;
  addStore: (newStore: Store) => void;
  isLoading: boolean;
  error: string | null;
  refreshStores: () => void;
  fetchStores: (force?: boolean) => Promise<Store[]>;
  getFeaturedStores: (limit?: number) => Store[];
}

interface StoreProviderProps {
  children: ReactNode;
  initialStores?: Store[];
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export function StoreProvider({ children, initialStores = [] }: StoreProviderProps) {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [isLoading, setIsLoading] = useState(initialStores.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const router = useRouter();

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

  // Initialize with API data
  useEffect(() => {
    if (initialStores.length === 0) {
      fetchStores();
    } else {
      setLastFetched(Date.now());
    }
  }, []);

  const updateStore = (storeId: number, updates: Partial<Store>) => {
    setStores((prevStores) =>
      prevStores.map((store) =>
        store.id === storeId ? { ...store, ...updates } : store
      )
    );
  };

  const deleteStore = (storeId: number) => {
    setStores((prevStores) =>
      prevStores.filter((store) => store.id !== storeId)
    );
  };

  const addStore = (newStore: Store) => {
    setStores((prevStores) => [...prevStores, newStore]);
  };

  const refreshStores = () => {
    fetchStores(true);
    router.refresh(); // Refresh the current page to reflect new data
  };

  // Get featured stores (verified stores)
  const getFeaturedStores = (limit = 3) => {
    return stores
      .filter(store => store.isVerified)
      .slice(0, limit);
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        updateStore,
        deleteStore,
        addStore,
        isLoading,
        error,
        refreshStores,
        fetchStores,
        getFeaturedStores,
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