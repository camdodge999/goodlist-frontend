"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/contexts/StoreContext";
import type { Store } from "@/types/stores";
import StoreError from "@/components/stores/StoreError";
import StoreLoadingSkeleton from "@/components/stores/StoreLoadingSkeleton";
import StoreHeader from "@/components/stores/StoreHeader";
import StoreGrid from "@/components/stores/StoreGrid";
import StorePagination from "@/components/stores/StorePagination";

export default function StoresPage() {
  const { stores, isLoading, error, fetchStores } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize search query from URL parameter
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 6;
  const [refreshing, setRefreshing] = useState(false);

  // Initial data loading
  useEffect(() => {
    const loadStores = async () => {
      try {
        // Always attempt to fetch stores to ensure we have the latest data
        await fetchStores();
      } catch (err) {
        console.error("Error loading stores:", err);
      }
    };

    loadStores();
  }, []);

  // Sync search query with URL parameters when component mounts or URL changes
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || "";
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

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

  // Handler for search query changes with URL update
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    // Update URL without causing a page reload
    const newUrl = params.toString() ? `?${params.toString()}` : '/stores';
    router.replace(newUrl, { scroll: false });
  }, [router, searchParams]);

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


  // Show loading skeleton during initial load or when no stores are available yet
  if (isLoading) {
    return (
      <div className="stores-page-loading py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StoreHeader
          title="ร้านค้าที่ผ่านการตรวจสอบ"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isLoading={isLoading}
          isRefreshing={refreshing}
          onRefresh={handleRefresh}
        />
        <div className="loading-skeleton-container mt-4">
          <StoreLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="stores-page py-8">
      <div className="stores-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StoreHeader
          title="ร้านค้าที่ผ่านการตรวจสอบ"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isLoading={isLoading}
          isRefreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {error && (
          <div className="error-container mt-4">
            <StoreError
              message={error}
              onRetry={handleRefresh}
            />
          </div>
        )}

        {refreshing ? (
          <div className="refreshing-skeleton-container mt-4">
            <StoreLoadingSkeleton />
          </div>
        ) : (
          <>
            {filteredStores.length === 0 && !error ? (
              <div className="no-stores-message text-center py-12">
                <p className="empty-state-text text-gray-500">ไม่พบร้านค้าที่ตรงกับการค้นหา</p>
              </div>
            ) : (
              <>
                <StoreGrid stores={currentStores} error={error} />

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