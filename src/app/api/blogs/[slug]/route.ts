import { NextRequest, NextResponse } from "next/server";
import { Blog } from "@/types/blog";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { BodyResponse } from "@/types/response";

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