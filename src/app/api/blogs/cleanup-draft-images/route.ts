import { NextRequest, NextResponse } from "next/server";
import { unlink, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { checkAdminAuth } from "@/lib/auth";

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

    const body = await request.json();
    const { imagePaths, action } = body;

    if (!imagePaths || !Array.isArray(imagePaths)) {
      return NextResponse.json(
        { error: 'Invalid image paths provided' },
        { status: 400 }
      );
    }

    if (!action || !['cleanup', 'preserve'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "cleanup" or "preserve"' },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'blog');
    const cleanedFiles: string[] = [];
    const errors: string[] = [];

    if (action === 'cleanup') {
      // Remove draft images that are no longer needed
      for (const imagePath of imagePaths) {
        try {
          // Convert path format (remove leading slash if present)
          const cleanPath = imagePath.replace(/^\/uploads\/blog\//, '');
          const fullPath = join(uploadDir, cleanPath);
          
          if (existsSync(fullPath)) {
            await unlink(fullPath);
            cleanedFiles.push(cleanPath);
          }
        } catch (error) {
          console.error(`Failed to delete image: ${imagePath}`, error);
          errors.push(`Failed to delete ${imagePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      action,
      cleanedFiles,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 200 });

  } catch (error) {
    console.error('Error in cleanup-draft-images:', error);
    return NextResponse.json(
      { error: 'Failed to process image cleanup' },
      { status: 500 }
    );
  }
}

// GET endpoint to list all files in uploads/blog directory (for debugging)
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authCheck = await checkAdminAuth(request);
    if (!authCheck.isAuthenticated || !authCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'blog');
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({
        files: [],
        directory: uploadDir
      });
    }

    const files = await readdir(uploadDir);
    
    return NextResponse.json({
      files,
      directory: uploadDir,
      count: files.length
    });

  } catch (error) {
    console.error('Error listing draft images:', error);
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 }
    );
  }
} 