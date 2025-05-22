import { NextRequest, NextResponse } from "next/server";
import { BodyResponse } from "@/types/response";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { UserResponse } from "@/types/users";
import { Report } from "@/types/report";

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<UserResponse>>> {
  try {
    const body = await request.json();
    // Validate request body
    if (!body.storeId || !body.reason || !body.evidenceUrl) {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: "Store ID, reason, and evidence URL are required", 
          data: undefined
        },
        { status: 400 }
      );
    }

    // Send request to backend
    const result = await fetchWithAuth<BodyResponse<UserResponse>>({
      request,
      url: `${process.env.NEXTAUTH_BACKEND_URL}/report`,
      method: 'POST',
      body: body,
    });


    if(result.statusCode === 200){
      return NextResponse.json({  
        statusCode: 201,
        message: "Report created successfully",
        data: result?.data 
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: result.message || "Failed to create report", 
          data: undefined   
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error creating user:", error);
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

async function createReport(request: NextRequest, body: any): Promise<BodyResponse<Report>> {
  // For FormData, we use it directly - fetchWithAuth handles it correctly
  const result = await fetchWithAuth<BodyResponse<Report>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL}/api/report/createReport`,
    method: 'POST',
    body: body
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result.message || "Failed to create store");
  }
}
