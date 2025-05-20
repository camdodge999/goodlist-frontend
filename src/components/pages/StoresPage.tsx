"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/contexts/StoreContext";
import type { Store } from "@/types/stores";
import StoreError from "@/components/stores/StoreError";
import StoreLoadingSkeleton from "@/components/stores/StoreLoadingSkeleton";
import StoreHeader from "@/components/stores/StoreHeader";
import StoreGrid from "@/components/stores/StoreGrid";
import StorePagination from "@/components/stores/StorePagination";

export default function StoresPage() {
  const { stores, isLoading, error, fetchStores } = useStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 6;
  const [refreshing, setRefreshing] = useState(false);

  // Initial data loading
  useEffect(() => {
    const loadStores = async () => {
      try {
        await fetchStores();
      } catch (err) {
        console.error("Error loading stores:", err);
      }
    };
    
    loadStores();
  }, [fetchStores]);

  // Handler for manual refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchStores(true); // Force refresh
    } catch (err) {
      console.error("Error refreshing stores:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchStores]);

  // Filter stores based on search query and verification status
  const filteredStores = Array.isArray(stores) 
    ? stores.filter((store: Store) => {
        const matchesSearch =
          store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (store.description && store.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const isVerified = store.isVerified;
        return matchesSearch && isVerified;
      })
    : [];

  // Reset to first page when search query changes or stores are refreshed
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stores]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredStores.length / storesPerPage);
  const startIndex = (currentPage - 1) * storesPerPage;
  const endIndex = startIndex + storesPerPage;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show loading skeleton only on initial load, not during refreshes
  if (isLoading && !refreshing && filteredStores.length === 0) {
    return <StoreLoadingSkeleton />;
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StoreHeader 
          title="ร้านค้าที่ผ่านการตรวจสอบ"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          isRefreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {error && (
          <div className="mt-4">
            <StoreError 
              message={error}
              onRetry={handleRefresh}
            />
          </div>
        )}

        {refreshing ? (
          <div className="mt-4">
            <StoreLoadingSkeleton />
          </div>
        ) : (
          <>
            {filteredStores.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">ไม่พบร้านค้าที่ตรงกับการค้นหา</p>
              </div>
            ) : (
              <>
                <StoreGrid stores={currentStores} />

                <StorePagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 