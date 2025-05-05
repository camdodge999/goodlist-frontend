import { NextResponse } from 'next/server';
import { mockStores } from '@/data/mockData';
import { BodyResponse } from '@/types/response';
import { Store } from '@/types/stores';

// GET handler for /api/stores/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = parseInt(params.id);
    
    if (isNaN(storeId)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid store ID',
          details: { id: params.id },
        } as BodyResponse<null>,
        { status: 400 }
      );
    }
    
    // Find the store with the matching ID (in a real app, this would be a database query)
    const store = mockStores.find((s) => s.id === storeId);
    
    if (!store) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Store not found',
          details: { id: storeId },
        } as BodyResponse<null>,
        { status: 404 }
      );
    }
    
    // Create the response in the expected format
    const response: BodyResponse<Store> = {
      status: 'success',
      data: store,
      message: null,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching store:', error);
    
    // Create error response
    const errorResponse: BodyResponse<null> = {
      status: 'error',
      message: 'Failed to fetch store',
      details: { error: error instanceof Error ? error.message : String(error) },
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 