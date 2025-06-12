import { NextRequest, NextResponse } from "next/server";
import { BodyResponse } from "@/types/response";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { UserResponse } from "@/types/users";

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<UserResponse>>> {
  try {
    const body = await request.json();
    // Validate request body
    if (!body.displayName || !body.email || !body.password) {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: "Display name, email, and password are required", 
          data: undefined
        },
        { status: 400 }
      );
    }

    // Send request to backend
    const result = await fetchWithAuth<BodyResponse<UserResponse>>({
      request,
      url: `${process.env.NEXTAUTH_URL }/api/auth/register`,
      method: 'POST',
      body: body,
    });


    if(result.statusCode === 200){
      return NextResponse.json({  
        statusCode: 201,
        message: "User created successfully",
        data: result?.data 
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: result.message || "Failed to create user", 
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

