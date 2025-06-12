import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { validatePath, secureFetch, SSRFProtectionError } from "@/lib/ssrf-protection";

export async function GET(request: NextRequest) {
  try {
    // Get authentication token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const headerToken = token ? token.token : null;
    
    // Get the full path from searchParams
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ status: 'error', message: 'Image path not provided' }, { status: 400 });
    }

    // Validate and sanitize the path parameter
    const pathValidation = validatePath(path);
    if (!pathValidation.isValid) {
      console.warn(`🚨 SSRF attempt blocked: ${pathValidation.error} - Path: ${path}`);
      return NextResponse.json({ 
        status: 'error', 
        message: 'Invalid path parameter' 
      }, { status: 400 });
    }

    // Construct the full URL with the backend base URL
    const backendUrl = process.env.NEXTAUTH_URL ;
    if (!backendUrl) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Backend URL not configured' 
      }, { status: 500 });
    }

    const fullUrl = `${backendUrl}/${pathValidation.sanitizedPath}`;

    // Use secure fetch with SSRF protection
    const imageResponse = await secureFetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${headerToken}`,
      },
      allowLocalhost: process.env.NODE_ENV === 'development', // Only allow localhost in development
      timeout: 30000, // 30 second timeout
      maxRedirects: 0, // No redirects for security
    });

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