import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { Store } from '@/types/stores';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// GET handler for /api/stores/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = parseInt(params.id);

    if (isNaN(storeId)) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: 'Invalid store ID',
          data: undefined,
        },
        { status: 400 }
      );
    }

    const store = await fetchStoreById(request, storeId.toString());

    if (!store) {
      return NextResponse.json(
        {
          statusCode: 404,
          message: 'Store not found',
          data: undefined,
        },
        { status: 404 }
      );
    }


    return NextResponse.json({
      statusCode: 200,
      data: store.data,
      message: null,
    }, { status: 200 });
  } catch (error) {
    console.error("Internal server error", error);
    return NextResponse.json(
      { statusCode: 500, message: "Internal server error", data: undefined },
      { status: 500 }
    );
  }
}

async function fetchStoreById(
  request: NextRequest,
  id: string
): Promise<BodyResponse<Store>> {
  // Accept token as a parameter
  const result = await fetchWithAuth<BodyResponse<Store>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/stores/${id}`,
    method: "GET"
  });
  if (result.statusCode === 200) {
    return result; // Typecast the result when the status is success
  } else {
    throw new Error(result.message || "Failed to fetch stores"); // Throw an error if the status is not success
  }
}