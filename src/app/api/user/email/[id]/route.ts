import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { UserResponse } from '@/types/users';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

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

    // Get the email and password data from the request
    const { email, newEmail, password } = await request.json();

    if (!email || !password) {
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
    const result = await updateUserEmail({
      request,
      id: userId.toString(),
      email: email, 
      newEmail: newEmail,
      password: password
    });

    if (result.statusCode === 404) {
      return NextResponse.json({
        statusCode: result.statusCode,
        message: result.message,
        data: result.data,
      }, { status: result.statusCode });
    } else if (result.statusCode === 409) {
      return NextResponse.json({
        statusCode: result.statusCode,
        message: result.message,
        data: result.data,
      }, { status: result.statusCode });
    }

    return NextResponse.json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    }, { status: result.statusCode });

  } catch (error) {
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

async function updateUserEmail({
  request,
  id,
  email,
  newEmail,
  password
}: {
  request: NextRequest;
  id: string;
  email: string;
  newEmail: string;
  password: string;
}): Promise<BodyResponse<UserResponse>> {
  // Use fetchWithAuth to handle token extraction and API call
  const result = await fetchWithAuth<BodyResponse<UserResponse>>({
    request,
    url: `${process.env.NEXTAUTH_URL !}/api/profile/edit-email/${id}`,
    method: "PUT",
    body: {
      email: email,
      newEmail: newEmail,
      password: password
    },
    extendHeaders: {
      'Content-Type': 'application/json'
    }
  });

  if (result.statusCode === 200) {
    return result;
  } else if (result.statusCode === 404) {
    return {
      statusCode: 404,
      message: "ไม่พบผู้ใช้งาน",
      data: undefined
    };
  } else if (result.statusCode === 409) {
    return {
      statusCode: 409,
      message: "อีเมลใหม่ถูกใช้งานแล้ว",
      data: undefined
    };
  } else {
    throw new Error(result.message || "Failed to update email");
  }
} 