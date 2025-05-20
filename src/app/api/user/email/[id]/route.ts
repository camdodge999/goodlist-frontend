import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { User } from '@/types/users';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const userId = await Promise.resolve(parseInt(id));

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

    // Get the email and password data from the request
    const { email, currentPassword } = await request.json();
    
    if (!email || !currentPassword) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: 'Email and current password are required',
          data: undefined,
        },
        { status: 400 }
      );
    }

    // Forward the email change request to the backend API
    const result = await updateUserEmail(request, userId.toString(), email, currentPassword);

    return NextResponse.json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data?.profileDetail,
    }, { status: result.statusCode });
    
  } catch (error) {
    console.error("Error updating user email:", error);
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

async function updateUserEmail(
  request: NextRequest,
  id: string,
  newEmail: string,
  currentPassword: string
): Promise<BodyResponse<{profileDetail: User}>> {
  // Use fetchWithAuth to handle token extraction and API call
  const result = await fetchWithAuth<BodyResponse<{profileDetail: User}>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/profile/changeEmail/${id}`,
    method: "PUT",
    body: {
      email: newEmail,
      currentPassword: currentPassword
    },
    extendHeaders: {
      'Content-Type': 'application/json'
    }
  });
  
  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result.message || "Failed to update email");
  }
} 