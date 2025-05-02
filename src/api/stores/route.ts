import { NextResponse } from 'next/server';
import { mockStores } from '@/data/mockData';
import { BodyResponse } from '@/types/response';
import { Store } from '@/types/stores';

// GET handler for /api/stores
export async function GET() {
  try {
    // Simulate a database fetch (in a real app, this would be a database query)
    // Later this can be replaced with actual database access
    const stores: Store[] = mockStores;
    
    // Create the response in the expected format
    const response: BodyResponse<Store[]> = {
      status: 'success',
      data: stores,
      message: null,
    };
    
    // Return the response with proper status code
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching stores:', error);
    
    // Create error response
    const errorResponse: BodyResponse<null> = {
      status: 'error',
      message: 'Failed to fetch stores',
      details: { error: error instanceof Error ? error.message : String(error) },
    };
    
    // Return error response with 500 status code
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 