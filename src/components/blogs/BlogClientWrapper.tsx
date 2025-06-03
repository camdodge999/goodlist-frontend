"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Blog, BlogsResponse } from "@/types/blog";
import BlogHeader from "./BlogHeader";
import BlogGrid from "./BlogGrid";
import BlogPagination from "./BlogPagination";
import BlogLoadingSkeleton from "./BlogLoadingSkeleton";

interface BlogClientWrapperProps {
  initialData: BlogsResponse;
  initialSearchQuery?: string;
  nonce?: string | null;
}

export default function BlogClientWrapper({ 
  initialData, 
  initialSearchQuery = "",
  nonce
}: BlogClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [blogs, setBlogs] = useState<Blog[]>(initialData?.blogs || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData?.pagination?.currentPage);
  const [totalPages, setTotalPages] = useState(initialData?.pagination?.totalPages);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Sync search query with URL parameters when component mounts or URL changes
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || "";
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Client-side data fetching for search and pagination
  const fetchBlogs = useCallback(async (page: number = 1, search: string = "", forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "6",
        ...(search && { search })
      });

      const response = await fetch(`/api/blogs?${params}`);
      const data: BlogsResponse = await response.json();

      setBlogs(data.blogs);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
      
      // Update URL without page reload
      const newParams = new URLSearchParams(searchParams.toString());
      if (search) {
        newParams.set('search', search);
      } else {
        newParams.delete('search');
      }
      if (page > 1) {
        newParams.set('page', page.toString());
      } else {
        newParams.delete('page');
      }
      
      const newUrl = newParams.toString() ? `?${newParams.toString()}` : '/blogs';
      router.replace(newUrl, { scroll: false });
      
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router, searchParams]);

  // Handler for manual refresh
  const handleRefresh = useCallback(async () => {
    try {
      await fetchBlogs(currentPage, searchQuery, true); // Force refresh
    } catch {
      // Error handling is done in fetchBlogs
    }
  }, [fetchBlogs, currentPage, searchQuery]);

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
    const newUrl = params.toString() ? `?${params.toString()}` : '/blogs';
    router.replace(newUrl, { scroll: false });

    // Fetch blogs with new search query
    fetchBlogs(1, query);
  }, [router, searchParams, fetchBlogs]);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    fetchBlogs(page, searchQuery);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchQuery, fetchBlogs]);

  // Show loading skeleton during initial load
  if (loading && !refreshing) {
    return (
      <div className="blogs-page-loading">
        <BlogHeader
          title="บล็อกของเรา"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          isRefreshing={refreshing}
          onRefresh={handleRefresh}
        />
        <div className="loading-skeleton-container mt-4">
          <BlogLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <div className="blogs-container">
        <BlogHeader
          title="บล็อกของเรา"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          isRefreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {refreshing ? (
          <div className="refreshing-skeleton-container mt-4">
            <BlogLoadingSkeleton />
          </div>
        ) : (
          <>
            <BlogGrid 
              blogs={blogs} 
              searchQuery={searchQuery}
              isLoading={loading}
            />

            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
} 