import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { Store } from '@/types/stores';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// GET handler for /api/user/store/[id]
export async function GET(
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

    // Fetch stores owned by the user
    const storesResponse = await fetchUserStores(request, userId.toString());

    // Return stores data
    return NextResponse.json({
      statusCode: 200,
      data: {
        stores: storesResponse.data?.storeDetail || []
      },
      message: null,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user stores:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Internal server error", data: undefined },
      { status: 500 }
    );
  }
}

async function fetchUserStores(
  request: NextRequest,
  userId: string
): Promise<BodyResponse<{storeDetail: Store[]}>> {
  // Use fetchWithAuth to handle token extraction and API call
  const result = await fetchWithAuth<BodyResponse<{storeDetail: Store[]}>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/store/userStore/${userId}`,
    method: "GET"
  });
  
  if (result.statusCode === 200) {
    return result;
  } else {
    // Don't throw an error if stores fetch fails, just return empty array
    return {
      statusCode: 200,
      message: null,
      data: { storeDetail: [] }
    };
  }
}