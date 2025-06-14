'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { Blog, BlogsResponse, BlogSearchParams } from '@/types/blog';
import { getBlogs, getBlogBySlug } from '@/lib/blog-service';

// Global cache to track if blogs have been fetched globally
let globalBlogsCache: Blog[] = [];
let globalPaginationCache: BlogsResponse['pagination'] | null = null;

// Types
interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBlogs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  searchQuery: string;
  filters: {
    status?: string;
    featured?: boolean;
  };
  // Add retry and initialization states
  fetchFailed: boolean;
  retryCount: number;
  isInitialized: boolean;
  refreshing: boolean;
}

type BlogAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BLOGS'; payload: BlogsResponse }
  | { type: 'SET_CURRENT_BLOG'; payload: Blog | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<BlogState['filters']> }
  | { type: 'SET_FETCH_FAILED'; payload: boolean }
  | { type: 'SET_RETRY_COUNT'; payload: number }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'RESET_STATE' };

interface BlogContextType extends BlogState {
  // Actions
  fetchBlogs: (params?: BlogSearchParams, force?: boolean) => Promise<BlogsResponse | null>;
  fetchBlogBySlug: (slug: string) => Promise<Blog | null>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<BlogState['filters']>) => void;
  resetState: () => void;
  refreshBlogs: () => Promise<BlogsResponse | null>;
  getFeaturedBlogs: (limit?: number) => Blog[];
}

// Constants
const MAX_RETRY_ATTEMPTS = 3;

// Initial state
const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  loading: true,
  error: null,
  pagination: null,
  searchQuery: '',
  filters: {},
  fetchFailed: false,
  retryCount: 0,
  isInitialized: false,
  refreshing: false,
};

// Reducer
function blogReducer(state: BlogState, action: BlogAction): BlogState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_BLOGS':
      return {
        ...state,
        blogs: action.payload.blogs,
        pagination: action.payload.pagination,
        loading: true,
        error: null,
        fetchFailed: false,
        retryCount: 0,
      };
    case 'SET_CURRENT_BLOG':
      return { ...state, currentBlog: action.payload, loading: false, error: null };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_FETCH_FAILED':
      return { ...state, fetchFailed: action.payload };
    case 'SET_RETRY_COUNT':
      return { ...state, retryCount: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context
const BlogContext = createContext<BlogContextType | undefined>(undefined);

// Provider Props
interface BlogProviderProps {
  children: ReactNode;
  initialData?: BlogsResponse;
  initialSearchQuery?: string;
}

// Provider Component
export function BlogProvider({ 
  children, 
  initialData,
  initialSearchQuery = '' 
}: BlogProviderProps) {
  // Initialize blogs from global cache if available, otherwise use initialData
  const [state, dispatch] = useReducer(blogReducer, {
    ...initialState,
    blogs: globalBlogsCache.length > 0 ? globalBlogsCache : (initialData?.blogs || []),
    pagination: globalPaginationCache || initialData?.pagination || null,
    searchQuery: initialSearchQuery,
  });

  // Fetch blogs with parameters and retry logic
  const fetchBlogs = useCallback(async (params: BlogSearchParams = {}, force = false): Promise<BlogsResponse | null> => {
    // If we already have blogs and it's not a forced refresh, return existing blogs
    if (!force && (globalBlogsCache.length > 0 || state.blogs.length > 0) && !params.search && !params.page) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { blogs: state.blogs.length > 0 ? state.blogs : globalBlogsCache, pagination: state.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      } };  
    }

    // If we have reached max retry attempts and it's not a forced refresh, don't retry
    if (state.retryCount >= MAX_RETRY_ATTEMPTS && !force) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { blogs: state.blogs, pagination: state.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      } };    
    }

    // If we have a previous fetch failure and it's not a forced refresh, don't retry
    if (state.fetchFailed && !force) {
      return { blogs: state.blogs, pagination: state.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      } };    
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const searchParams = {
        page: params.page || 1,
        limit: params.limit || 6,
        search: params.search || state.searchQuery,
        status: params.status || state.filters.status || 'published',
        ...params,
      };

      const response = await getBlogs(searchParams);

      // Update both local state and global cache
      dispatch({ type: 'SET_BLOGS', payload: response });
      
      // Update global cache only if no search/filter is active (base data)
      if (!searchParams.search && searchParams.page === 1 && searchParams.status === 'published') {
        globalBlogsCache = response.blogs;
        globalPaginationCache = response.pagination;
      }

      // Mark as successfully initialized
      dispatch({ type: 'SET_INITIALIZED', payload: true });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch blogs';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });

      // Increment retry count and set fetch failed flag
      dispatch({ type: 'SET_RETRY_COUNT', payload: state.retryCount + 1 });
      dispatch({ type: 'SET_FETCH_FAILED', payload: true });

      return { blogs: state.blogs, pagination: state.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      } };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.searchQuery, state.filters.status, state.retryCount, state.fetchFailed, state.blogs]);

  // Fetch single blog by slug
  const fetchBlogBySlug = useCallback(async (slug: string): Promise<Blog | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const blog = await getBlogBySlug(slug);
      dispatch({ type: 'SET_CURRENT_BLOG', payload: blog });
      return blog;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch blog';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    }
  }, []);

  // Set search query
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  // Set filters
  const setFilters = useCallback((filters: Partial<BlogState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Refresh blogs with current parameters
  const refreshBlogs = useCallback(async (): Promise<BlogsResponse | null> => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
    try {
      const result = await fetchBlogs({
        search: state.searchQuery,
        status: state.filters.status,
        page: state.pagination?.currentPage || 1,
      }, true); // Force refresh
      return result;
    } catch {
      return { blogs: state.blogs, pagination: state.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      } };
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [fetchBlogs, state.searchQuery, state.filters.status, state.pagination?.currentPage, state.blogs]);

  // Get featured blogs
  const getFeaturedBlogs = useCallback((limit = 3): Blog[] => {
    return state.blogs
      .filter(blog => blog.featured || blog.status === 'published')
      .slice(0, limit);
  }, [state.blogs]);

  // Initialize with API data only if no initialData were provided and global cache is empty
  useEffect(() => {
    // Don't fetch if already successfully initialized
    if (state.isInitialized) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Don't fetch if we've reached max retry attempts
    if (state.retryCount >= MAX_RETRY_ATTEMPTS) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Don't fetch if blogs exist unless both caches are empty
    if (state.blogs.length > 0 && globalBlogsCache.length > 0) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      return;
    }

    if (globalBlogsCache.length === 0 && (!initialData || initialData.blogs.length === 0)) {
      fetchBlogs();
    } else if (initialData && initialData.blogs.length > 0 && globalBlogsCache.length === 0) {
      // If we have initialData but no global cache, update the global cache
      globalBlogsCache = initialData.blogs;
      globalPaginationCache = initialData.pagination;
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  }, [fetchBlogs, initialData, state.retryCount, state.blogs.length, state.isInitialized]);

  // Update local blogs when global cache changes
  useEffect(() => {
    if (globalBlogsCache.length > 0 && JSON.stringify(state.blogs) !== JSON.stringify(globalBlogsCache)) {
      dispatch({ type: 'SET_BLOGS', payload: { blogs: globalBlogsCache, pagination: globalPaginationCache ?? {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      } } });
    }
  }, []);

  const contextValue: BlogContextType = {
    ...state,
    fetchBlogs,
    fetchBlogBySlug,
    setSearchQuery,
    setFilters,
    resetState,
    refreshBlogs,
    getFeaturedBlogs,
  };

  return (
    <BlogContext.Provider value={contextValue}>
      {children}
    </BlogContext.Provider>
  );
}

// Hook to use the context
export function useBlogContext(): BlogContextType {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlogContext must be used within a BlogProvider');
  }
  return context;
}

// Safe hook that returns null instead of throwing when used outside provider
export function useBlogContextSafe(): BlogContextType | null {
  const context = useContext(BlogContext);
  return context || null;
}

// Export context for advanced usage
export { BlogContext };

// Export types for external use
export type { BlogContextType }; 