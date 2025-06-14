import { NextRequest, NextResponse } from "next/server";
import { Blog } from "@/types/blog";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { BodyResponse } from "@/types/response";
import { blogFormSchema } from "@/validators/blog.schema";

export async function GET(request: NextRequest) {
  try {
    const result = await fetchAllBlogs(request);

    if (result.statusCode === 200) {
      if (!result.data) {
        return NextResponse.json(
          { statusCode: 404, message: "ไม่พบข้อมูลบทความ", data: undefined },
          { status: 404 }
        );
      }
      
      // Return the data in the same format expected by the frontend
      return NextResponse.json({
        blogs: result.data.blogDetail || []
      }, { status: 200 });
    }

    return NextResponse.json(
      { statusCode: 400, message: result.message, data: undefined },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Internal server error", data: undefined },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<Blog>>> {
  try {
    const body = await request.formData();
    
    // Handle markdown file if provided
    const markdownFile = body.get('markdownFile') as File | null;
    let fileMarkdownPath = '';
    
    if (markdownFile) {
      // Save the markdown file to the content/blogs directory
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const contentDir = path.join(process.cwd(), 'content', 'blogs');
      
      // Ensure directory exists
      try {
        await fs.access(contentDir);
      } catch {
        await fs.mkdir(contentDir, { recursive: true });
      }
      
      // Save the file
      const fileName = markdownFile.name;
      const filePath = path.join(contentDir, fileName);
      const buffer = Buffer.from(await markdownFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      
      fileMarkdownPath = `/content/blogs/${fileName}`;
    }
    
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
    
    // Append the actual markdown file if it exists, otherwise append empty string
    if (markdownFile) {
      submitBody.append('markdownFile', markdownFile);
    } else {
      submitBody.append('markdownFile', '');
    } 


    const result = await createBlog(request, submitBody);

    if (result.statusCode === 200) {
      return NextResponse.json({
        statusCode: 201,
        message: "Blog created successfully",
        data: result?.data?.blogDetail
      }, { status: 201 });
    } else {
      return NextResponse.json(
        {
          statusCode: 400,
          message: result?.message ?? "Failed to create blog",
          data: undefined
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error creating blog", error);
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

async function createBlog(request: NextRequest, body: FormData): Promise<BodyResponse<{ blogDetail: Blog }>> {
  // For FormData, we use it directly - fetchWithAuth handles it correctly
  const result = await fetchWithAuth<BodyResponse<{ blogDetail: Blog }>>({
    request,
    url: `${process.env.NEXTAUTH_URL !}/api/blogs`,
    method: 'POST',
    body: body
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result?.message ?? "Failed to create blog");
  }
}


async function fetchAllBlogs(request: NextRequest): Promise<BodyResponse<{ blogDetail: Blog []}>> {
  // Extract query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  
  // Build the API URL with query parameters
  const apiUrl = `${process.env.NEXTAUTH_URL!}/api/blogs${queryString ? `?${queryString}` : ''}`;
  
  const result = await fetchWithAuth<BodyResponse<{ blogDetail: Blog []}>>({
    request,
    url: apiUrl,
    method: 'GET'
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result?.message ?? "Failed to fetch blogs");
  }
}