import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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

    // Fetch the image with authentication
    const imageResponse = await fetch(`${process.env.NEXTAUTH_BACKEND_URL!}/${path}`, {
      headers: {
        Authorization: `Bearer ${headerToken}`,
      },
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
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch image' }, { status: 500 });
  }
} 