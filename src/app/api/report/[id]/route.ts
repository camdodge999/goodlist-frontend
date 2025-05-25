import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { Report } from '@/types/report';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// PUT handler for /api/report/[id]
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse<BodyResponse<Report>>> {
  try {
    const { id } = await Promise.resolve(context.params);
    const reportId = await Promise.resolve(id);

    if (!reportId) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: 'Invalid report ID',
          data: undefined,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = await updateReportById(request, reportId, body);

    if (result.statusCode === 200) {
      return NextResponse.json({
        statusCode: 200,
        data: result.data,
        message: "Report updated successfully",
      }, { status: 200 });
    } else {
      return NextResponse.json(
        { 
          statusCode: 400, 
          message: result.message || "Failed to update report", 
          data: undefined 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Internal server error", data: undefined },
      { status: 500 }
    );
  }
}

async function updateReportById(
  request: NextRequest,
  id: string,
  updates: Partial<Report>
): Promise<BodyResponse<{reportDetail: Report}>> {
  const result = await fetchWithAuth<BodyResponse<{reportDetail: Report}>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/report/updateReport/${id}`,
    method: "PUT",
    body: updates
  });
  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result.message || "Failed to update report");
  }
} 