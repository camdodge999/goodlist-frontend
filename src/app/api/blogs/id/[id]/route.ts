import { NextRequest, NextResponse } from "next/server";
import { Blog } from "@/types/blog";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { BodyResponse } from "@/types/response";
import { blogFormSchema } from "@/validators/blog.schema";


// API helper functions
async function fetchBlogById(request: NextRequest, id: string): Promise<BodyResponse<{ blogDetail: Blog }>> {
  const result = await fetchWithAuth<BodyResponse<{ blogDetail: Blog }>>({
    request,
    url: `${process.env.NEXTAUTH_URL!}/api/blogs/${id}`,
    method: 'GET'
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result?.message ?? "Failed to fetch blog");
  }
}

async function updateBlogById(request: NextRequest, id: string, body: FormData): Promise<BodyResponse<{ blogDetail: Blog }>> {
  const result = await fetchWithAuth<BodyResponse<{ blogDetail: Blog }>>({
    request,
    url: `${process.env.NEXTAUTH_URL!}/api/blogs/${id}`,
    method: 'PUT',
    body: body
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result?.message ?? "Failed to update blog");
  }
}

async function deleteBlogById(request: NextRequest, id: string): Promise<BodyResponse<unknown>> {
  const result = await fetchWithAuth<BodyResponse<unknown>>({
    request,
    url: `${process.env.NEXTAUTH_URL!}/api/blogs/${id}`,
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await fetchBlogById(request, id);

    if (result.statusCode === 200) {
      if (!result.data?.blogDetail) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }

      // Return blog with complete structure including assets and createdBy
      const blog = result.data.blogDetail;
      const blogWithCompleteStructure = {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        linkPath: blog.linkPath,
        fileMarkdownPath: blog.fileMarkdownPath,
        status: blog.status,
        createdAt: blog.createdAt,
        userId: blog.userId,
        createdById: blog.createdById,
        updatedById: blog.updatedById,
        updatedAt: blog.updatedAt,
        viewCount: blog.viewCount,
        tags: typeof blog.tags === 'string' ? blog.tags.split(',').map(tag => tag.trim()) : blog.tags || [],
        metaDescription: blog.metaDescription,
        featured: blog.featured,
        assets: blog.assets || [],
        createdBy: blog.createdBy || { displayName: blog.author?.displayName || 'Unknown Author' },
        // Keep author for backward compatibility
        author: blog.author,
        // Include optional fields if they exist
        ...(blog.createdAt && { createdAt: blog.createdAt }),
        ...(blog.likeCount !== undefined && { likeCount: blog.likeCount }),
        ...(blog.shareCount !== undefined && { shareCount: blog.shareCount }),
        ...(blog.commentCount !== undefined && { commentCount: blog.commentCount }),
        ...(blog.readTime !== undefined && { readTime: blog.readTime })
      };

      return NextResponse.json(blogWithCompleteStructure);
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
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<BodyResponse<Blog>>> {
  try {
    const { id } = await context.params;
    const body = await request.formData();
    
    // Convert FormData to plain object for validation
    const data = {
      title: body.get('title'),
      slug: body.get('slug'),
      content: body.get('content'),
      excerpt: body.get('excerpt') || '',
      linkPath: body.get('linkPath') || '',
      status: body.get('status') || 'draft',
      tags: body.get('tags') || '',
      metaDescription: body.get('metaDescription') || '',
      featured: body.get('featured') === 'true',
      uploadedImages: []
    };

    // Zod validation
    const resultZod = blogFormSchema.safeParse(data);
    if (!resultZod.success) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: resultZod.error.errors[0]?.message || "Invalid data",
          data: undefined
        },
        { status: 400 }
      );
    }

    const submitBody = new FormData();
    submitBody.append('userId', body.get('userId') as string || '');
    submitBody.append('title', body.get('title') as string);
    submitBody.append('slug', body.get('slug') as string);
    submitBody.append('content', body.get('content') as string);
    submitBody.append('excerpt', body.get('excerpt') as string || '');
    submitBody.append('linkPath', body.get('linkPath') as string || '');
    submitBody.append('status', body.get('status') as string || 'draft');
    submitBody.append('tags', body.get('tags') as string || '');
    submitBody.append('metaDescription', body.get('metaDescription') as string || '');
    submitBody.append('featured', body.get('featured') === 'true' ? 'true' : 'false');
    submitBody.append('uploadedImages', body.get('uploadedImages') as string || '');
    
    // Handle markdown file if provided
    const markdownFile = body.get('markdownFile') as File | null;
    if (markdownFile) {
      submitBody.append('markdownFile', markdownFile);
    } else {
      submitBody.append('markdownFile', '');
    }

    const result = await updateBlogById(request, id, submitBody);

    if (result.statusCode === 200) {
      return NextResponse.json({
        statusCode: 200,
        message: "Blog updated successfully",
        data: result?.data?.blogDetail
      }, { status: 200 });
    } else {
      return NextResponse.json(
        {
          statusCode: 400,
          message: result?.message ?? "Failed to update blog",
          data: undefined
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error updating blog", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Internal server error",
        data: undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await deleteBlogById(request, id);

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