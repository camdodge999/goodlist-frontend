import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { Store } from '@/types/stores';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// GET handler for /api/stores/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const storeId = parseInt(id);

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
          message: 'ไม่พบร้านค้า',
          data: undefined,
        },
        { status: 404 }
      );
    }

    if(store.statusCode === 404) {
      return NextResponse.json(
        { statusCode: 404, message: "ไม่พบร้านค้า", data: undefined },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      data: store.data?.storeDetail,
      message: null,
    }, { status: 200 });
  } catch {
    return NextResponse.json(
      { statusCode: 500, message: "Internal server error", data: undefined },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<BodyResponse<Store>>> {
  try {
    const { id } = await context.params;
    const storeId = parseInt(id);

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

    const body = await request.json();
    const result = await updateStoreById(request, storeId.toString(), body);
    if (result.statusCode === 200) {
      return NextResponse.json({
        statusCode: 200,
        data: result?.data?.storeDetail,
        message: "Store updated successfully",
      }, { status: 200 });
    } else if (result.statusCode === 404) {
      return NextResponse.json(
        { statusCode: 404, message: "ไม่พบร้านค้า", data: undefined },
        { status: 404 }
      );
    } else {
      return NextResponse.json(
        {
          statusCode: 400,
          message: result.message || "Failed to update store",
          data: undefined
        },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { statusCode: 500, message: "Internal server error", data: undefined },
      { status: 500 }
    );
  }
}


async function fetchStoreById(
  request: NextRequest,
  id: string
): Promise<BodyResponse<{ storeDetail: Store }>> {
  // Accept token as a parameter
  const result = await fetchWithAuth<BodyResponse<{ storeDetail: Store }>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/store/storeDetail/${id}`,
    method: "GET"
  });


  if (result.statusCode === 200) {
    return result; // Typecast the result when the status is success
  } else if (result.statusCode === 404) {
    return {
      statusCode: 404,
      message: "ไม่พบร้านค้า",
      data: undefined,
    };
  } else {
    throw new Error(result.message || "Failed to fetch stores"); // Throw an error if the status is not success
  }
}

async function updateStoreById(
  request: NextRequest,
  id: string,
  updates: Partial<Store>
): Promise<BodyResponse<{ storeDetail: Store }>> {
  const result = await fetchWithAuth<BodyResponse<{ storeDetail: Store }>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/store/updateStore/${id}`,
    method: "PUT",
    body: updates
  });
  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result.message || "Failed to update store");
  }
}