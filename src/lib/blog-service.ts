import { Blog, BlogsResponse } from "@/types/blog";

const API_BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export async function getBlogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<BlogsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);

  const url = `${API_BASE_URL}/api/blogs?${searchParams.toString()}`;
  
  try {
    const response = await fetch(url, {
      cache: 'no-store', // Ensure fresh data on each request
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }

    const data = await response.json();
    
    // Ensure the response matches the expected BlogsResponse format
    return {
      blogs: data.blogs || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 0,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    // Return empty response on error
    return {
      blogs: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const url = `${API_BASE_URL}/api/blogs/${slug}`;
  
  try {
    const response = await fetch(url, {
      cache: 'no-store', // Ensure fresh data on each request
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch blog: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
} 