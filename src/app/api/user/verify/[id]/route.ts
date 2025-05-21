import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { User } from '@/types/users';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// POST handler for /api/user/verify/[id]
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } =  params;
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

    // Get the form data from the request
    let formData;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      formData = await request.formData();
      
      // Log the keys in the FormData to help debug
      console.log('FormData keys:', Array.from(formData.keys()));
    } else {
      // Handle JSON data
      const jsonData = await request.json();
      formData = jsonData;
    }

    // Forward the verification request to the backend API
    const result = await verifyUser(request, userId.toString(), formData);

    return NextResponse.json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    }, { status: result.statusCode });
    
  } catch (error) {
    console.error("Error in user verification:", error);
    return NextResponse.json(
      { 
        statusCode: 500, 
        message: error instanceof Error ? error.message : "Internal server error", 
        data: undefined 
      },
      { status: 500 }
    );
  }
}

async function verifyUser(
  request: NextRequest,
  id: string,
  formData: FormData | any
): Promise<BodyResponse<any>> {
  try {
    // Use fetchWithAuth to handle token extraction and API call
    const result = await fetchWithAuth<BodyResponse<any>>({
      request,
      url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/user/verify/${id}`,
      method: "POST",
      body: formData,
    });
    
    if (result.statusCode === 200) {
      return result;
    } else {
      throw new Error(result.message || "Failed to verify user");
    }
  } catch (error) {
    console.error("Error calling verify API:", error);
    throw error;
  }
} 