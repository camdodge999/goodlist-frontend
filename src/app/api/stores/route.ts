import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { Store } from '@/types/stores';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { UserResponse } from '@/types/users';

export async function GET(
  request: NextRequest
): Promise<NextResponse<BodyResponse<Store[]>>> {
  try {
    const result = await fetchAllStores(request); // Pass the token to the fetch function  

    if (result.statusCode === 200) {
      if (!result.data) {
        return NextResponse.json(
          { statusCode: 404, message: "ไม่พบข้อมูลร้านค้า", data: undefined },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          statusCode: 200,
          data: result.data?.storeDetail,
          message: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { statusCode: 400, message: result.message, data: undefined },
      { status: 400 }
    );
  } catch (error) {
    console.error("Internal server error", error);
    return NextResponse.json(
      { statusCode: 500, message: "Internal server error", data: undefined },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<Store>>> {
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

    const result = await createStore(request,body);

    if(result.statusCode === 200){
      return NextResponse.json({  
        statusCode: 201,
        message: "Store created successfully",
        data: result?.data 
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: result.message || "Failed to create store", 
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

async function createStore(request: NextRequest,body: any): Promise<BodyResponse<Store>> {
  const result = await fetchWithAuth<BodyResponse<Store>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL}/store`,
    method: 'POST',
    body: body,
  });

  if (result.statusCode === 200) {
    return result; // Typecast the result when the status is success
  } else {
    throw new Error(result.message || "Failed to create store"); // Throw an error if the status is not success
  }
}

async function fetchAllStores(
  request: NextRequest
): Promise<BodyResponse<{storeDetail: Store[]}>> {
  // Accept token as a parameter
  console.log(`${process.env.NEXTAUTH_BACKEND_URL}/store/`);
  const result = await fetchWithAuth<BodyResponse<{storeDetail: Store[]}>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/store/`,
    method: "GET"
  });
  if (result.statusCode === 200) {
    return result; // Typecast the result when the status is success
  } else {
    throw new Error(result.message || "Failed to fetch stores"); // Throw an error if the status is not success
  }
}
