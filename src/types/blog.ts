export interface Blog {
  // Primary Key
  id: string;

  // Content Fields
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  linkPath?: string;
  fileMarkdownPath?: string;

  // Metadata
  status: 'draft' | 'published' | 'archived' | 'deleted';
  publishedAt?: string;

  // User Relationships
  userId: number;
  createdById: number;
  updatedById: number;

  // Timestamp Fields
  createdAt: string;
  updatedAt: string;

  // Engagement Metrics
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;

  // SEO and Discovery
  tags?: string | string[];
  metaDescription?: string;
  featured: boolean;

  // Author information (populated from User relation)
  author: {
    id: number;
    name: string;
    email: string;
  };

  // Legacy fields for backward compatibility (can be computed)
  readTime?: number; // Can be calculated from content length
}

export interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  linkPath: string;
  fileMarkdownPath: string;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  tags: string;
  metaDescription: string;
  featured: boolean;
  uploadedImages?: string[]; // Array of image file paths
}

export interface BlogsResponse {
  blogs: Blog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBlogs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BlogSearchParams {
  page?: number;
  limit?: number;
  search?: string;
} 