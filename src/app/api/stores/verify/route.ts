import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { Store } from '@/types/stores';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<Store>>> {
  try {
    // Check if the request is FormData
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('multipart/form-data');

    let body;

    if (isFormData) {
      // Handle FormData
      body = await request.formData();
    } else {
      // Handle JSON
      body = await request.json();

      // Validate request body for JSON requests
      if (!body.id) {
        return NextResponse.json(
          {
            statusCode: 400,
            message: "Store id is required",
            data: undefined
          },
          { status: 400 }
        );
      }
    }

    const result = await verifyStore(request, body);

    if (result.statusCode === 200) {
      return NextResponse.json({
        statusCode: 201,
        message: "Store verified successfully",
        data: result?.data?.verifyStore
      }, { status: 201 });
    } else {
      return NextResponse.json(
        {
          statusCode: 400,
          message: result.message || "Failed to verify store",
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

async function verifyStore(request: NextRequest, body: any): Promise<BodyResponse<{verifyStore: Store}>> {
  try {
    // For FormData, we use it directly - fetchWithAuth handles it correctly
    const result = await fetchWithAuth<BodyResponse<{verifyStore: Store}>>({
      request,
      url: `${process.env.NEXTAUTH_BACKEND_URL}/api/store/VerifyStore/${body.id}`,
      method: 'POST',
      body: body
    });

    if (result.statusCode === 200) {
      return result;
    } else {
      throw new Error(result.message || "Failed to verify store");
    }
  } catch (error) {
    throw error;
  }
}
