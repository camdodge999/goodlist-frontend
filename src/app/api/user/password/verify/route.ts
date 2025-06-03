import { NextRequest, NextResponse } from "next/server";
import { BodyResponse } from "@/types/response";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { UserResponse } from "@/types/users";

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<UserResponse>>> {
  try {
    const body = await request.json();
    // Validate request body
    if (!body.email || !body.otpCode || !body.userId || !body.oldPassword || !body.newPassword || !body.confirmPassword || !body.displayName) {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: "Email, OTP code, user id, old password, new password, confirm password and display name are required", 
          data: undefined
        },
        { status: 400 }
      );
    }


    const bodyData = {
      displayName: body.displayName,
      email: body.email,
      otpCode: body.otpCode,
      userId: body.userId,
      password: body.oldPassword,
      newPassword: body.newPassword,
      confirmPassword: body.confirmPassword,
    }

    // Send request to backend
    const result = await fetchWithAuth<BodyResponse<UserResponse>>({
      request,
      url: `${process.env.NEXTAUTH_URL }/api/profile/verify-password`,
      method: 'POST',
      body: bodyData,
    });


    if(result.statusCode === 200){
      return NextResponse.json({  
        statusCode: 201,
        message: "Password verified successfully",
        data: result?.data 
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: result.message || "Failed to verify password", 
          data: undefined   
        },
        { status: 400 }
      );
    }

  } catch {
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

