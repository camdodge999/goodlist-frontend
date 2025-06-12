"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlogsResponse } from "@/types/blog";   
import { useBlogContext } from "@/contexts/BlogContext";
import BlogHeader from "./BlogHeader";
import BlogGrid from "./BlogGrid";
import { BlogPageSkeleton } from "./BlogPageSkeleton";

interface BlogClientWrapperProps {
  readonly initialData: BlogsResponse; 
  readonly initialSearchQuery: string;
}

export default function BlogClientWrapper({ 
  initialData, 
  initialSearchQuery,
}: BlogClientWrapperProps) {
  const { 
    blogs, 
    loading, 
    error, 
    pagination, 
    fetchBlogs, 
    setSearchQuery,
    refreshBlogs,
    refreshing,
  } = useBlogContext();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local state for UI management
  const [searchQuery, setSearchQueryLocal] = useState(searchParams.get('search') || initialSearchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const blogsPerPage = 6;

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync search query with URL parameters when component mounts or URL changes
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || "";
    if (urlSearchQuery !== searchQuery) {
      setSearchQueryLocal(urlSearchQuery);
    }
  }, [searchParams]);

  // Handler for search query changes with URL update
  const handleSearchChange = useCallback((query: string) => {
    setSearchQueryLocal(query);
    setSearchQuery(query); // Update context
    
    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    // Update URL without causing a page reload
    const newUrl = params.toString() ? `?${params.toString()}` : '/blogs';
    router.replace(newUrl, { scroll: false });
  }, [router, searchParams, setSearchQuery]);

  // Handler for manual refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshBlogs();
    } catch {
      // Error handling is managed by context
    }
  }, [refreshBlogs]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch blogs when search or page changes
  useEffect(() => {
    if (isHydrated && (searchQuery !== initialSearchQuery || currentPage !== 1)) {
      fetchBlogs({
        page: currentPage,
        limit: blogsPerPage,
        search: searchQuery,
        status: 'published'
      });
    }
  }, [searchQuery, currentPage, fetchBlogs, initialSearchQuery, isHydrated]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show loading skeleton during initial load or when not hydrated
  if (!isHydrated || loading) {
    return (
      <div className="blogs-page min-h-[calc(100vh-521px)]">
        <BlogHeader
          title="บทความของเรา"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          isRefreshing={refreshing}
          onRefresh={handleRefresh}
        />
        <div className="loading-skeleton-container mt-4">
          <BlogPageSkeleton />
        </div>
      </div>
    );
  }

  // Calculate pagination for display
  const displayBlogs = blogs || [];
  const displayPagination = pagination || initialData.pagination;

  return (
    <div className="blogs-page min-h-[calc(100vh-521px)]">
      <div className="blogs-container">
        <BlogHeader
          title="บทความของเรา"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          isRefreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {error && (
          <div className="error-container mt-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blogs</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        )}

        {refreshing ? (
          <div className="refreshing-skeleton-container mt-4">
            <BlogPageSkeleton />
          </div>
        ) : (
          <>
            {displayBlogs.length === 0 && !error ? (
              <div className="no-blogs-message text-center py-12">
                <p className="empty-state-text text-gray-500">ไม่พบบทความที่ตรงกับการค้นหา</p>
              </div>
            ) : (
              <>
                <BlogGrid 
                  blogs={displayBlogs} 
                  searchQuery={searchQuery}
                  isLoading={loading}
                />

                {displayPagination && displayPagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!displayPagination.hasPrevPage}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ก่อนหน้า
                    </button>
                    
                    {Array.from({ length: displayPagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium ${
                          page === displayPagination.currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!displayPagination.hasNextPage}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ถัดไป
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 