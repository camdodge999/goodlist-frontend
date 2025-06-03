import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { getToken } from "next-auth/jwt";
import { BlogFormData } from "@/types/blog";

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

// Helper function to check admin authentication
async function checkAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthenticated: false, isAdmin: false, error: 'No authorization header' };
  }

  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return { isAuthenticated: false, isAdmin: false, error: 'Invalid token' };
    }

    const isAdmin = token.role === 'admin';
    return { isAuthenticated: true, isAdmin, error: null };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAuthenticated: false, isAdmin: false, error: 'Auth verification failed' };
  }
}

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
let mockBlogs: BlogData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "How to Verify Amazon Stores: Complete Safety Guide",
    slug: "amazon-store-verification",
    excerpt: "Learn how to identify legitimate Amazon sellers and avoid scams with our comprehensive verification guide.",
    content: getMarkdownContent('amazon-store-verification.md'),
    linkPath: "/blogs/amazon-store-verification",
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
    linkPath: "/blogs/ebay-seller-verification",
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
    linkPath: "/blogs/shopify-store-safety",
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
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status');
  const featured = searchParams.get('featured');

  // Filter blogs based on query parameters
  let filteredBlogs = mockBlogs.filter(blog => {
    if (status && blog.status !== status) return false;
    if (featured === 'true' && !blog.featured) return false;
    if (featured === 'false' && blog.featured) return false;
    
    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        blog.title.toLowerCase().includes(searchLower) ||
        blog.excerpt?.toLowerCase().includes(searchLower) ||
        blog.tags?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Apply pagination
  const totalBlogs = filteredBlogs.length;
  const totalPages = Math.ceil(totalBlogs / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Convert tags string to array for consistency
  const blogsWithArrayTags = paginatedBlogs.map(blog => ({
    ...blog,
    tags: blog.tags ? blog.tags.split(',').map(tag => tag.trim()) : []
  }));

  return NextResponse.json({
    blogs: blogsWithArrayTags,
    pagination: {
      currentPage: page,
      totalPages,
      totalBlogs,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.isAuthenticated || !authCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const blogData: BlogFormData = await request.json();

    // Generate new blog ID
    const newId = `550e8400-e29b-41d4-a716-${Date.now().toString().slice(-12)}`;
    const now = new Date().toISOString();

    // Create new blog object
    const newBlog: BlogData = {
      id: newId,
      title: blogData.title,
      slug: blogData.slug,
      content: blogData.content,
      excerpt: blogData.excerpt,
      linkPath: blogData.linkPath || `/blogs/${blogData.slug}`,
      fileMarkdownPath: blogData.fileMarkdownPath,
      status: blogData.status,
      publishedAt: blogData.status === 'published' ? now : undefined,
      userId: 1, // Mock admin user ID
      createdById: 1,
      updatedById: 1,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      commentCount: 0,
      tags: blogData.tags,
      metaDescription: blogData.metaDescription,
      featured: blogData.featured,
      author: {
        id: 1,
        name: "Admin User",
        email: "admin@goodlist.com"
      },
      readTime: Math.ceil(blogData.content.length / 200) // Rough estimate
    };

    // Add to mock blogs array
    mockBlogs.unshift(newBlog);

    // Return the created blog with tags as array
    const responseBlogs = {
      ...newBlog,
      tags: newBlog.tags ? newBlog.tags.split(',').map(tag => tag.trim()) : []
    };

    return NextResponse.json(responseBlogs, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}

