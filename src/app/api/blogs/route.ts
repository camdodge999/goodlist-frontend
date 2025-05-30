import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Helper function to read markdown content
const getMarkdownContent = (filename: string): string => {
  try {
    const filePath = join(process.cwd(), 'content', 'blogs', filename);
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading markdown file ${filename}:`, error);
    return `# ${filename}\n\nContent not available.`;
  }
};

// Updated Blog interface to match the schema
interface BlogData {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  linkPath?: string;
  fileMarkdownPath?: string;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  publishedAt?: string;
  userId: number;
  createdById: number;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  tags?: string;
  metaDescription?: string;
  featured: boolean;
  author: {
    id: number;
    name: string;
    email: string;
  };
  readTime?: number; // Computed field
}

// Updated mock blogs with store verification content
const mockBlogs: BlogData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "How to Verify Amazon Stores: Complete Safety Guide",
    slug: "amazon-store-verification",
    excerpt: "Learn how to identify legitimate Amazon sellers and avoid scams with our comprehensive verification guide.",
    content: getMarkdownContent('amazon-store-verification.md'),
    linkPath: "/blog/amazon-store-verification",
    fileMarkdownPath: "/content/blogs/amazon-store-verification.md",
    status: "published",
    publishedAt: "2024-01-15T10:00:00Z",
    userId: 1,
    createdById: 1,
    updatedById: 1,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    viewCount: 2150,
    likeCount: 189,
    shareCount: 45,
    commentCount: 28,
    tags: "amazon,verification,safety,online-shopping",
    metaDescription: "Complete guide to verifying Amazon stores and avoiding scams while shopping online",
    featured: true,
    author: {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@goodlist.com"
    },
    readTime: 8
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "eBay Seller Verification: Your Complete Safety Guide",
    slug: "ebay-seller-verification",
    excerpt: "Master the art of identifying trustworthy eBay sellers with our detailed verification checklist and safety tips.",
    content: getMarkdownContent('ebay-seller-verification.md'),
    linkPath: "/blog/ebay-seller-verification",
    fileMarkdownPath: "/content/blogs/ebay-seller-verification.md",
    status: "published",
    publishedAt: "2024-01-10T14:30:00Z",
    userId: 2,
    createdById: 2,
    updatedById: 2,
    createdAt: "2024-01-10T13:00:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
    viewCount: 1890,
    likeCount: 156,
    shareCount: 32,
    commentCount: 19,
    tags: "ebay,seller-verification,marketplace,safety",
    metaDescription: "Learn how to verify eBay sellers and shop safely on the marketplace",
    featured: false,
    author: {
      id: 2,
      name: "Mike Chen",
      email: "mike@goodlist.com"
    },
    readTime: 10
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Shopify Store Safety: How to Verify Independent Online Stores",
    slug: "shopify-store-safety",
    excerpt: "Discover how to identify legitimate Shopify stores and protect yourself from scams when shopping at independent retailers.",
    content: getMarkdownContent('shopify-store-safety.md'),
    linkPath: "/blog/shopify-store-safety",
    fileMarkdownPath: "/content/blogs/shopify-store-safety.md",
    status: "published",
    publishedAt: "2024-01-05T09:15:00Z",
    userId: 3,
    createdById: 3,
    updatedById: 3,
    createdAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-05T09:15:00Z",
    viewCount: 1456,
    likeCount: 134,
    shareCount: 28,
    commentCount: 15,
    tags: "shopify,store-verification,independent-stores,safety",
    metaDescription: "Complete guide to verifying Shopify stores and shopping safely at independent retailers",
    featured: false,
    author: {
      id: 3,
      name: "Emma Rodriguez",
      email: "emma@goodlist.com"
    },
    readTime: 12
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const featured = searchParams.get('featured');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  // Filter blogs based on query parameters
  const filteredBlogs = mockBlogs.filter(blog => {
    if (status && blog.status !== status) return false;
    if (featured === 'true' && !blog.featured) return false;
    if (featured === 'false' && blog.featured) return false;
    return true;
  });

  // Apply pagination
  const startIndex = offset ? parseInt(offset) : 0;
  const endIndex = limit ? startIndex + parseInt(limit) : filteredBlogs.length;
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Convert tags string to array for backward compatibility
  const blogsWithArrayTags = paginatedBlogs.map(blog => ({
    ...blog,
    tags: blog.tags ? blog.tags.split(',').map(tag => tag.trim()) : []
  }));

  return NextResponse.json({
    blogs: blogsWithArrayTags,
    total: filteredBlogs.length,
    offset: startIndex,
    limit: endIndex - startIndex
  });
}

