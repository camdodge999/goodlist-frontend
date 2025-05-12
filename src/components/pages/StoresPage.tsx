"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/contexts/StoreContext";
import type { Store } from "@/types/stores";
import StoreError from "@/components/stores/StoreError";
import StoreLoadingSkeleton from "@/components/stores/StoreLoadingSkeleton";
import StoreHeader from "@/components/stores/StoreHeader";
import StoreGrid from "@/components/stores/StoreGrid";
import StorePagination from "@/components/stores/StorePagination";

export default function StoresPage() {
  const { stores, isLoading, error, refreshStores } = useStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 6;

  // Filter stores based on search query and verification status
  const filteredStores = stores.filter((store: Store) => {
    const matchesSearch =
      store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.description && store.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const isVerified = store.isVerified;
    return matchesSearch && isVerified;
  });

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  if (isLoading) {
    return <StoreLoadingSkeleton />;
  }

  if (error) {
    return (
      <StoreError 
        message={error}
        onRetry={refreshStores}
      />
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StoreHeader 
          title="ร้านค้าที่ผ่านการตรวจสอบ"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <StoreGrid stores={currentStores} />

        <StorePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
} 