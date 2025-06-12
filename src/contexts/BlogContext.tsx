'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Blog, BlogsResponse, BlogSearchParams } from '@/types/blog';
import { getBlogs, getBlogBySlug } from '@/lib/blog-service';

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
}

type BlogAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BLOGS'; payload: BlogsResponse }
  | { type: 'SET_CURRENT_BLOG'; payload: Blog | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<BlogState['filters']> }
  | { type: 'RESET_STATE' };

interface BlogContextType extends BlogState {
  // Actions
  fetchBlogs: (params?: BlogSearchParams) => Promise<void>;
  fetchBlogBySlug: (slug: string) => Promise<Blog | null>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<BlogState['filters']>) => void;
  resetState: () => void;
  refreshBlogs: () => Promise<void>;
}

// Initial state
const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
  pagination: null,
  searchQuery: '',
  filters: {},
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
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_BLOG':
      return { ...state, currentBlog: action.payload, loading: false, error: null };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
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
  const [state, dispatch] = useReducer(blogReducer, {
    ...initialState,
    blogs: initialData?.blogs || [],
    pagination: initialData?.pagination || null,
    searchQuery: initialSearchQuery,
  });

  // Fetch blogs with parameters
  const fetchBlogs = useCallback(async (params: BlogSearchParams = {}) => {
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
      dispatch({ type: 'SET_BLOGS', payload: response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch blogs';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [state.searchQuery, state.filters.status]);

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
  const refreshBlogs = useCallback(async () => {
    await fetchBlogs({
      search: state.searchQuery,
      status: state.filters.status,
      page: state.pagination?.currentPage || 1,
    });
  }, [fetchBlogs, state.searchQuery, state.filters.status, state.pagination?.currentPage]);

  const contextValue: BlogContextType = {
    ...state,
    fetchBlogs,
    fetchBlogBySlug,
    setSearchQuery,
    setFilters,
    resetState,
    refreshBlogs,
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