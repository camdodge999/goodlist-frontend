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
const mockBlogs: BlogData[] = [
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const blog = mockBlogs.find(blog => blog.slug === slug);

  if (!blog) {
    return NextResponse.json(
      { error: "Blog post not found" },
      { status: 404 }
    );
  }

  // Return blog with tags as array for consistency
  const blogWithArrayTags = {
    ...blog,
    tags: blog.tags ? blog.tags.split(',').map(tag => tag.trim()) : []
  };

  return NextResponse.json(blogWithArrayTags);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    // Check admin authentication
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.isAuthenticated || !authCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const updateData: Partial<BlogFormData> = await request.json();

    // Find blog by slug
    const blogIndex = mockBlogs.findIndex(blog => blog.slug === slug);
    if (blogIndex === -1) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const existingBlog = mockBlogs[blogIndex];
    const now = new Date().toISOString();

    // Update blog object
    const updatedBlog: BlogData = {
      ...existingBlog,
      ...updateData,
      updatedAt: now,
      updatedById: 1, // Mock admin user ID
      publishedAt: updateData.status === 'published' && !existingBlog.publishedAt ? now : existingBlog.publishedAt,
      readTime: updateData.content ? Math.ceil(updateData.content.length / 200) : existingBlog.readTime
    };

    // Update in mock blogs array
    mockBlogs[blogIndex] = updatedBlog;

    // Return the updated blog with tags as array
    const responseBlog = {
      ...updatedBlog,
      tags: updatedBlog.tags ? updatedBlog.tags.split(',').map(tag => tag.trim()) : []
    };

    return NextResponse.json(responseBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    // Check admin authentication
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.isAuthenticated || !authCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    // Find blog by slug
    const blogIndex = mockBlogs.findIndex(blog => blog.slug === slug);
    if (blogIndex === -1) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Remove from mock blogs array
    mockBlogs.splice(blogIndex, 1);

    return NextResponse.json(
      { message: 'Blog post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
} 