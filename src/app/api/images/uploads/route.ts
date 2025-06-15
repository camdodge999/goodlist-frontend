import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { validatePath, SSRFProtectionError } from "@/lib/ssrf-protection";

export async function GET(request: NextRequest) {
  try {
    // Get authentication token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const headerToken = token ? token.token : null;

    const fallbackToken = request.headers.get('Authorization')?.split(' ')[1];

    const path = request.nextUrl.searchParams.get('path');

    if (!path) {
      return NextResponse.json({ status: 'error', message: 'Image path not provided' }, { status: 400 });
    }
    const pathAfterEncoded = decodeURIComponent(path || '');

    const pathQuery = pathAfterEncoded.split('?')[0];

    // Extract just the upload path pattern (upload\folder\filename) from the full path
    // Remove any frontend URL components and normalize the path
    let cleanPath = pathQuery;
    
    // Remove protocol and domain if present (e.g., https://localhost:4200/api/images/uploads?path=...)
    if (cleanPath.includes('://')) {
      const urlParts = cleanPath.split('/api/images/uploads');
      if (urlParts.length > 1) {
        const queryPart = urlParts[1];
        const pathParam = new URLSearchParams(queryPart.startsWith('?') ? queryPart : `?path=${queryPart}`).get('path');
        cleanPath = pathParam || cleanPath;
      }
    }
    
    // Normalize path separators and remove leading slashes
    cleanPath = cleanPath.replace(/\//g, '\\').replace(/^\\+/, '');
    
    // Validate and sanitize the cleaned path parameter
    const pathValidation = validatePath(cleanPath);

    console.log("Path validation result:", pathValidation);
    if (!pathValidation.isValid) {
      console.warn(`🚨 SSRF attempt blocked: ${pathValidation.error} - Path: ${cleanPath}`);
      return NextResponse.json({
        status: 'error',
        message: 'Invalid path parameter'
      }, { status: 400 });
    }

    // Construct the full URL with the backend base URL using the cleaned path
    const backendUrl = process.env.NEXTAUTH_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json({
        status: 'error',
        message: 'Backend URL not configured'
      }, { status: 500 });
    }

    const fullUrl = `${backendUrl}/${pathValidation.sanitizedPath}`;

    console.log("Final backend URL:", fullUrl);

    // Use secure fetch with SSRF protection
    const imageResponse = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${headerToken || fallbackToken || ''}`,
      },
    });

    console.log(imageResponse);

    if (!imageResponse.ok) {
      return NextResponse.json({ status: 'error', message: 'Image not found' }, { status: 404 });
    }

    // Process and return the image
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    return new NextResponse(Buffer.from(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        'X-Content-Type-Options': 'nosniff', // Security header
      },
    });
  } catch (error) {
    if (error instanceof SSRFProtectionError) {
      console.error(`🚨 SSRF Protection triggered: ${error.message} - Reason: ${error.reason}`);
      return NextResponse.json({
        status: 'error',
        message: 'Request blocked for security reasons'
      }, { status: 403 });
    }

    console.error('Image fetch error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch image' }, { status: 500 });
  }
} 