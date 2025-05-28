import { NextRequest, NextResponse } from "next/server";
import { BodyResponse } from "@/types/response";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { UserResponse } from "@/types/users";

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<UserResponse>>> {
  try {
    const body = await request.json();
    // Validate request body for email verification
    if (!body.email || !body.newEmail || !body.password || !body.otpCode || !body.userId) {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: "Email, new email, password, OTP code, and user ID are required", 
          data: undefined
        },
        { status: 400 }
      );
    }

    const bodyData = {
      userId: body.userId,
      email: body.email,
      newEmail: body.newEmail,
      password: body.password,
      otpCode: body.otpCode,
      otpToken: body.otpToken || ""
    }

    // Send request to backend for email verification
    const result = await fetchWithAuth<BodyResponse<UserResponse>>({
      request,
      url: `${process.env.NEXTAUTH_BACKEND_URL}/api/profile/verify-email`,
      method: 'POST',
      body: bodyData,
    });

    if(result.statusCode === 200){
      return NextResponse.json({  
        statusCode: 200,
        message: "Email verified and changed successfully",
        data: result?.data 
      }, { status: 200 });
    } else {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: result.message || "Failed to verify email", 
          data: undefined   
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error verifying email:", error);
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

