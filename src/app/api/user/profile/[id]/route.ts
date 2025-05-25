import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { User } from '@/types/users';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// GET handler for /api/user/profile/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: 'Invalid user ID',
          data: undefined,
        },
        { status: 400 }
      );
    }

    const profile = await fetchProfileById(request, userId.toString());

    if (!profile) {
      return NextResponse.json(
        {
          statusCode: 404,
          message: 'Profile not found',
          data: undefined,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      data: profile.data?.profileDetail,
      message: null,
    }, { status: 200 });
  } catch (error) {
    console.error("Internal server error", error);
    return NextResponse.json(
      { statusCode: 500, message: "Internal server error", data: undefined },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: 'Invalid user ID',
          data: undefined,
        },
        { status: 400 }
      );
    }
    // Check content type to determine if this is a FormData or JSON request
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('multipart/form-data');
    
    let body;
    
    if (isFormData) {
      // Handle FormData
      body = await request.formData();
    } else {
      // Handle JSON request
      body = await request.json();
    }

    // Forward the update request to the backend API
    const result = await updateUserProfile(request, userId.toString(), body);

    return NextResponse.json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data?.profileDetail,
    }, { status: result.statusCode });
    
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { 
        statusCode: 500, 
        message: error instanceof Error ? error.message : "Internal server error", 
        data: undefined 
      },
      { status: 500 }
    );
  }
}


async function fetchProfileById(  
  request: NextRequest,
  id: string
): Promise<BodyResponse<{profileDetail: User}>> {  
  // Use fetchWithAuth to handle token extraction and API call
  const result = await fetchWithAuth<BodyResponse<{profileDetail: User}>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/profile/profile/${id}`,
    method: "GET"
  });
  
  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result.message || "Failed to fetch profile");
  }
}

async function updateUserProfile(
  request: NextRequest,
  id: string,
  updateData: FormData | object
): Promise<BodyResponse<{profileDetail: User}>> {

  console.log(updateData);

  // Use fetchWithAuth to handle token extraction and API call
  const result = await fetchWithAuth<BodyResponse<{profileDetail: User}>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/profile/editProfile/${id}`,
    method: "PUT",
    body: updateData,
  });
  
  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result.message || "Failed to update profile");
  }
}