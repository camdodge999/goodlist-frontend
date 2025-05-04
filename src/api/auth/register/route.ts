import { NextRequest, NextResponse } from "next/server";
import { BodyResponse } from "@/types/response";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<any>>> {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.name) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "User name is required", 
          details: {} 
        },
        { status: 400 }
      );
    }

    // Send request to backend
    const result = await fetchWithAuth<BodyResponse<any>>({
      request,
      url: `${process.env.NEXTAUTH_BACKEND_URL}/auth/register`,
      method: 'POST',
      body: body,
    });

    if(result.status === "success"){
      return NextResponse.json({
        status: "success",
        data: result.data,
        message: null,
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { 
          status: "error", 
          message: result.message || "Failed to create permission", 
          details: {} 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Internal server error", 
        details: {} 
      },
      { status: 500 }
    );
  }
}

