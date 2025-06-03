"use client";

import { useState, useEffect } from "react";
import { Blog, BlogsResponse } from "@/types/blog";
import { useBlog } from "@/hooks/useBlog";
import BlogHeader from "./BlogHeader";
import BlogGrid from "./BlogGrid";
import BlogPagination from "./BlogPagination";
import BlogLoadingSkeleton from "./BlogLoadingSkeleton";

interface BlogClientWrapperProps {
  initialData: BlogsResponse;
  initialSearchQuery: string;
  nonce?: string | null;
}

export default function BlogClientWrapper({ 
  initialData, 
  initialSearchQuery 
}: BlogClientWrapperProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    blogs,
    loading,
    error,
    pagination,
    fetchBlogs
  } = useBlog();

  // Initialize with server-side data
  useEffect(() => {
    // Only fetch if we don't have initial data or if search query changed
    if (!initialData.blogs.length || searchQuery !== initialSearchQuery) {
      fetchBlogs({
        page: currentPage,
        limit: 6,
        search: searchQuery
      });
    }
  }, [searchQuery, currentPage, fetchBlogs, initialData.blogs.length, initialSearchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Use initial data if available and no search is active
  const displayBlogs = (searchQuery === initialSearchQuery && currentPage === 1) 
    ? initialData.blogs 
    : blogs;
  
  const displayPagination = (searchQuery === initialSearchQuery && currentPage === 1)
    ? initialData.pagination
    : pagination;

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blogs</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchBlogs({ page: currentPage, limit: 6, search: searchQuery })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <div className="blogs-container">
        <BlogHeader
          title="บทความของเรา"
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          isLoading={loading}
          isRefreshing={false}
          onRefresh={() => fetchBlogs({ page: currentPage, limit: 6, search: searchQuery })}
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
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
                  Previous
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
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 