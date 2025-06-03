'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Blog, BlogFormData, BlogsResponse, BlogSearchParams } from '@/types/blog';

interface UseBlogOptions {
  requireAuth?: boolean;
  adminOnly?: boolean;
}

interface UseBlogReturn {
  // Data
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBlogs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  
  // Actions
  fetchBlogs: (params?: BlogSearchParams) => Promise<void>;
  fetchBlogBySlug: (slug: string) => Promise<Blog | null>;
  getBlogById: (id: string) => Promise<Blog | null>;
  createBlog: (blogData: BlogFormData) => Promise<Blog | null>;
  updateBlog: (id: string, blogData: Partial<BlogFormData>) => Promise<Blog | null>;
  deleteBlog: (id: string) => Promise<boolean>;
  
  // Auth helpers
  isAuthenticated: boolean;
  isAdmin: boolean;
  canManageBlogs: boolean;
}

export function useBlog(options: UseBlogOptions = {}): UseBlogReturn {
  const { data: session, status } = useSession();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseBlogReturn['pagination']>(null);

  const { requireAuth = false, adminOnly = false } = options;

  // Auth state
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === 'admin';
  const canManageBlogs = isAuthenticated && isAdmin;

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.user?.token) {
      headers.Authorization = `Bearer ${session.user.token}`;
    }

    return headers;
  }, [session]);

  // Check auth requirements
  const checkAuthRequirements = useCallback(() => {
    if (requireAuth && !isAuthenticated) {
      throw new Error('Authentication required');
    }
    if (adminOnly && !isAdmin) {
      throw new Error('Admin access required');
    }
  }, [requireAuth, adminOnly, isAuthenticated, isAdmin]);

  // Fetch blogs with optional search parameters
  const fetchBlogs = useCallback(async (params: BlogSearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);

      const url = `/api/blogs?${searchParams.toString()}`;
      const headers = requireAuth || adminOnly ? getAuthHeaders() : {};

      const response = await fetch(url, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }

      const data: BlogsResponse = await response.json();
      setBlogs(data.blogs);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blogs';
      setError(errorMessage);
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  }, [requireAuth, adminOnly, getAuthHeaders]);

  // Fetch single blog by slug
  const fetchBlogBySlug = useCallback(async (slug: string): Promise<Blog | null> => {
    try {
      setLoading(true);
      setError(null);

      const headers = requireAuth || adminOnly ? getAuthHeaders() : {};
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch blog: ${response.status}`);
      }

      const blog: Blog = await response.json();
      setCurrentBlog(blog);
      return blog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog';
      setError(errorMessage);
      console.error('Error fetching blog:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [requireAuth, adminOnly, getAuthHeaders]);

  // Fetch single blog by ID
  const getBlogById = useCallback(async (id: string): Promise<Blog | null> => {
    try {
      setLoading(true);
      setError(null);

      const headers = requireAuth || adminOnly ? getAuthHeaders() : {};
      const response = await fetch(`/api/blogs/id/${id}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch blog: ${response.status}`);
      }

      const blog: Blog = await response.json();
      setCurrentBlog(blog);
      return blog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog';
      setError(errorMessage);
      console.error('Error fetching blog:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [requireAuth, adminOnly, getAuthHeaders]);

  // Create new blog (admin only)
  const createBlog = useCallback(async (blogData: BlogFormData): Promise<Blog | null> => {
    try {
      checkAuthRequirements();
      if (!canManageBlogs) {
        throw new Error('Admin access required to create blogs');
      }

      setLoading(true);
      setError(null);

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create blog: ${response.status}`);
      }

      const newBlog: Blog = await response.json();
      setBlogs(prev => [newBlog, ...prev]);
      return newBlog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog';
      setError(errorMessage);
      console.error('Error creating blog:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkAuthRequirements, canManageBlogs, getAuthHeaders]);

  // Update existing blog (admin only)
  const updateBlog = useCallback(async (id: string, blogData: Partial<BlogFormData>): Promise<Blog | null> => {
    try {
      checkAuthRequirements();
      if (!canManageBlogs) {
        throw new Error('Admin access required to update blogs');
      }

      setLoading(true);
      setError(null);

      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update blog: ${response.status}`);
      }

      const updatedBlog: Blog = await response.json();
      setBlogs(prev => prev.map(blog => blog.id === id ? updatedBlog : blog));
      if (currentBlog?.id === id) {
        setCurrentBlog(updatedBlog);
      }
      return updatedBlog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blog';
      setError(errorMessage);
      console.error('Error updating blog:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkAuthRequirements, canManageBlogs, getAuthHeaders, currentBlog]);

  // Delete blog (admin only)
  const deleteBlog = useCallback(async (id: string): Promise<boolean> => {
    try {
      checkAuthRequirements();
      if (!canManageBlogs) {
        throw new Error('Admin access required to delete blogs');
      }

      setLoading(true);
      setError(null);

      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete blog: ${response.status}`);
      }

      setBlogs(prev => prev.filter(blog => blog.id !== id));
      if (currentBlog?.id === id) {
        setCurrentBlog(null);
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog';
      setError(errorMessage);
      console.error('Error deleting blog:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkAuthRequirements, canManageBlogs, getAuthHeaders, currentBlog]);

  return {
    // Data
    blogs,
    currentBlog,
    loading,
    error,
    pagination,
    
    // Actions
    fetchBlogs,
    fetchBlogBySlug,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    
    // Auth helpers
    isAuthenticated,
    isAdmin,
    canManageBlogs,
  };
} 