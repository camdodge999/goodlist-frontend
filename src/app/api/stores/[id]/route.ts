import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { Store } from '@/types/stores';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// GET handler for /api/stores/[id]
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(context.params);
    const storeId = await Promise.resolve(parseInt(id));

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
      data: store.data?.storeDetail,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const storeId = parseInt(params.id);
  
}


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const storeId = parseInt(params.id);
  
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const storeId = parseInt(params.id);
  
}

async function fetchStoreById(
  request: NextRequest,
  id: string
): Promise<BodyResponse<{storeDetail: Store}>> {
  // Accept token as a parameter
  const result = await fetchWithAuth<BodyResponse<{storeDetail: Store}>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/store/storeDetail/${id}`,
    method: "GET"
  });
  if (result.statusCode === 200) {
    return result; // Typecast the result when the status is success
  } else {
    throw new Error(result.message || "Failed to fetch stores"); // Throw an error if the status is not success
  }
}