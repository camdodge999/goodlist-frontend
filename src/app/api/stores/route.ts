import { NextRequest, NextResponse } from 'next/server';
import { mockStores } from '@/data/mockData';
import { BodyResponse } from '@/types/response';
import { Store } from '@/types/stores';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

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
          data: result.data,
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

async function fetchAllStores(
  request: NextRequest
): Promise<BodyResponse<Store[]>> {
  // Accept token as a parameter
  const result = await fetchWithAuth<BodyResponse<Store[]>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/stores/`,
    method: "GET"
  });
  if (result.statusCode === 200) {
    return result; // Typecast the result when the status is success
  } else {
    throw new Error(result.message || "Failed to fetch stores"); // Throw an error if the status is not success
  }
}
