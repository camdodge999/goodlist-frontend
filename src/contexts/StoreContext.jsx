"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { mockStores } from "@/data/mockData";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with mock data only once
  useEffect(() => {
    setStores(mockStores);
    setIsLoading(false);
  }, []);

  const updateStore = (storeId, updates) => {
    setStores((prevStores) =>
      prevStores.map((store) =>
        store.id === storeId ? { ...store, ...updates } : store
      )
    );
  };

  const deleteStore = (storeId) => {
    setStores((prevStores) =>
      prevStores.filter((store) => store.id !== storeId)
    );
  };

  const addStore = (newStore) => {
    setStores((prevStores) => [...prevStores, newStore]);
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        updateStore,
        deleteStore,
        addStore,
        isLoading,
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
