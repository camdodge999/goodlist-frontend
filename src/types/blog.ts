// Asset interface for blog assets
export interface BlogAsset {
  originalName: string;
  fileName: string;
  filePath: string;
  blogId: string;
  altText?: string;
  caption?: string;
}

// User interface for createdBy relationship
export interface BlogCreatedBy {
  displayName: string;
}

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
  createdAt?: string;

  // User Relationships
  userId: number;
  createdById: number;
  updatedById: number;

  // Timestamp Fields
  updatedAt: string;

  // Engagement Metrics
  viewCount: number;
  likeCount?: number;
  shareCount?: number;
  commentCount?: number;

  // SEO and Discovery
  tags?: string | string[];
  metaDescription?: string;
  featured: boolean;

  // Relationships
  assets?: BlogAsset[];
  createdBy?: BlogCreatedBy;

  // Author information (populated from User relation) - keeping for backward compatibility
  author?: {
    displayName: string;
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
  status?: string;
  featured?: boolean;
} 