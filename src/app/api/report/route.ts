import { NextRequest, NextResponse } from "next/server";
import { BodyResponse } from "@/types/response";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { Report } from "@/types/report";

export async function GET(request: NextRequest): Promise<NextResponse<BodyResponse<Report[]>>> {
  try {
    const result = await fetchAllReports(request);
    
    if (result.statusCode === 200) {
      if (!result.data) {
        return NextResponse.json(
          { statusCode: 404, message: "ไม่พบข้อมูลรายงาน", data: undefined },
          { status: 404 }
        );
      }
      return NextResponse.json({
        statusCode: 200,
        data: result?.data?.reportDetail || [],
        message: "Reports fetched successfully"
      }, { status: 200 });
    }

    return NextResponse.json(
      {
        statusCode: 404,
        message: "No reports found",
        data: undefined
      },
      { status: 404 }
    );

  } catch (error) {
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

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<Report>>> {
  try {
    const body = await request.formData();
    // Validate request body
    if (!body.get('storeId') || !body.get('reason') || !body.get('evidence')) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Store ID, reason, and evidence are required",
          data: undefined
        },
        { status: 400 }
      );
    }

    const submitBody = new FormData();
    submitBody.append('storeId', body.get('storeId') as string);
    submitBody.append('reason', body.get('reason') as string);
    submitBody.append('evidenceUrl', body.get('evidence') as File);

    const result = await createReport(request, submitBody);

    if (result.statusCode === 200) {
      return NextResponse.json({
        statusCode: 201,
        message: "Report created successfully",
        data: result?.data?.reportDetail
      }, { status: 201 });
    } else {
      return NextResponse.json(
        {
          statusCode: 400,
          message: result.message || "Failed to create report",
          data: undefined
        },
        { status: 400 }
      );
    }

  } catch (error) {
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

async function fetchAllReports(request: NextRequest): Promise<BodyResponse<{ reportDetail: Report[] }>> {
  const result = await fetchWithAuth<BodyResponse<{ reportDetail: Report[] }>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/report/`,
    method: 'GET'
  });
  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result.message || "Failed to fetch all reports");
  }
}

async function createReport(request: NextRequest, body: FormData): Promise<BodyResponse<{ reportDetail: Report }>> {
  // For FormData, we use it directly - fetchWithAuth handles it correctly
  const result = await fetchWithAuth<BodyResponse<{ reportDetail: Report }>>({
    request,
    url: `${process.env.NEXTAUTH_BACKEND_URL!}/api/report/createReport`,
    method: 'POST',
    body: body
  });

  if (result.statusCode === 200) {
    return result;
  } else {
    throw new Error(result.message || "Failed to create store");
  }
}
