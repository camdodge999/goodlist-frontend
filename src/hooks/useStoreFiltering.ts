"use client";

import { useState, useEffect, useMemo } from "react";
import { Store } from "@/types/stores";

interface UseStoreFilteringOptions {
  itemsPerPage?: number;
}

export default function useStoreFiltering(stores: Store[], options: UseStoreFilteringOptions = {}) {
  const { itemsPerPage = 6 } = options;
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter stores based on search query and verification status
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (store.description && store.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const isVerified = store.isVerified;
      return matchesSearch && isVerified;
    });
  }, [stores, searchQuery]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paginatedStores = useMemo(() => {
    return filteredStores.slice(startIndex, endIndex);
  }, [filteredStores, startIndex, endIndex]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    filteredStores,
    paginatedStores,
    handlePageChange,
  };
} 