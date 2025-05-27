import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { User } from '@/types/users';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { passwordFormSchema } from '@/validators/profile.schema';

// PUT handler for /api/user/password/[id]
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

    // Get the password data from the request
    const body = await request.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    // Validate the request body using Zod
    const validationResult = passwordFormSchema.safeParse({
      oldPassword,
      newPassword,
      confirmPassword
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: validationResult.error.errors[0].message,
          data: undefined,
        },
        { status: 400 }
      );
    }

    // Forward the password change request to the backend API
    const result = await updateUserPassword(request, userId.toString(), oldPassword, newPassword);

    return NextResponse.json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data?.profileDetail,
    }, { status: result.statusCode });

  } catch (error) {
    console.error("Error updating user password:", error);
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

async function updateUserPassword(
  request: NextRequest,
  id: string,
  oldPassword: string,
  newPassword: string
): Promise<BodyResponse<{ profileDetail: User }>> {
  // Use fetchWithAuth to handle token extraction and API call
  const result = await fetchWithAuth<BodyResponse<{ profileDetail: User }>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/profile/editProfile/${id}`,
    method: "PUT",
    body: {
      oldPassword: oldPassword,
      newPassword: newPassword
    },
    extendHeaders: {
      'Content-Type': 'application/json'
    }
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result.message || "Failed to update password");
  }
}