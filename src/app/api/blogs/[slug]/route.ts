import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { getToken } from "next-auth/jwt";
import { Blog } from "@/types/blog";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { BodyResponse } from "@/types/response";
import { blogFormSchema } from "@/validators/blog.schema";

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

// API helper functions
async function fetchBlogBySlug(request: NextRequest, slug: string): Promise<BodyResponse<{ blogDetail: Blog }>> {
  const result = await fetchWithAuth<BodyResponse<{ blogDetail: Blog }>>({
    request,
    url: `${process.env.NEXTAUTH_URL!}/api/blogs/slug/${slug}`,
    method: 'GET'
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result?.message ?? "Failed to fetch blog");
  }
}

async function updateBlogBySlug(request: NextRequest, slug: string, body: FormData): Promise<BodyResponse<{ blogDetail: Blog }>> {
  const result = await fetchWithAuth<BodyResponse<{ blogDetail: Blog }>>({
    request,
    url: `${process.env.NEXTAUTH_URL!}/api/blogs/slug/${slug}`,
    method: 'PUT',
    body: body
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result?.message ?? "Failed to update blog");
  }
}

async function deleteBlogBySlug(request: NextRequest, slug: string): Promise<BodyResponse<any>> {
  const result = await fetchWithAuth<BodyResponse<any>>({
    request,
    url: `${process.env.NEXTAUTH_URL!}/api/blogs/slug/${slug}`,
    method: 'DELETE'
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result?.message ?? "Failed to delete blog");
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const result = await fetchBlogBySlug(request, slug);

    if (result.statusCode === 200) {
      if (!result.data?.blogDetail) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }

      // Return blog with tags as array for consistency
      const blog = result.data.blogDetail;
      const blogWithArrayTags = {
        ...blog,
        tags: typeof blog.tags === 'string' ? blog.tags.split(',').map(tag => tag.trim()) : blog.tags || []
      };

      return NextResponse.json(blogWithArrayTags);
    }

    return NextResponse.json(
      { error: result.message || "Blog post not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
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

    // Handle both JSON and FormData
    let submitBody: FormData;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData directly
      submitBody = await request.formData();
    } else {
      // Handle JSON - convert to FormData
      const updateData = await request.json();
      submitBody = new FormData();
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              submitBody.append(`${key}[${index}]`, String(item));
            });
          } else {
            submitBody.append(key, String(value));
          }
        }
      });
    }

    // Validate the data
    const data = {
      title: submitBody.get('title'),
      slug: submitBody.get('slug'),
      content: submitBody.get('content'),
      excerpt: submitBody.get('excerpt') || '',
      linkPath: submitBody.get('linkPath') || '',
      status: submitBody.get('status') || 'draft',
      tags: submitBody.get('tags') || '',
      metaDescription: submitBody.get('metaDescription') || '',
      featured: submitBody.get('featured') === 'true',
      uploadedImages: []
    };

    const resultZod = blogFormSchema.safeParse(data);
    if (!resultZod.success) {
      return NextResponse.json(
        {
          error: resultZod.error.errors[0]?.message || "Invalid data"
        },
        { status: 400 }
      );
    }

    const result = await updateBlogBySlug(request, slug, submitBody);

    if (result.statusCode === 200) {
      const blog = result.data?.blogDetail;
      const responseBlog = {
        ...blog,
        tags: typeof blog?.tags === 'string' ? blog.tags.split(',').map(tag => tag.trim()) : blog?.tags || []
      };

      return NextResponse.json(responseBlog);
    }

    return NextResponse.json(
      { error: result.message || 'Failed to update blog' },
      { status: 400 }
    );
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

    const result = await deleteBlogBySlug(request, slug);

    if (result.statusCode === 200) {
      return NextResponse.json(
        { message: 'Blog post deleted successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: result.message || 'Failed to delete blog' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
} 