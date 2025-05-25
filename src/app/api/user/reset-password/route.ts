import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: "อีเมลไม่ถูกต้อง", 
          data: undefined 
        },
        { status: 400 }
      );
    }

    // Forward the reset password request to the backend API
    const result = await fetchWithAuth<BodyResponse<any>>({
      request,
      url: `${process.env.NEXTAUTH_BACKEND_URL}/auth/reset-password`,
      method: 'POST',
      body: { email },
    });

    if (result.statusCode === 200) {
      return NextResponse.json(
        { 
          statusCode: 200,
          message: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว", 
          data: result.data 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: result.message || "ไม่พบบัญชีผู้ใช้", 
          data: undefined 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { 
        statusCode: 500,
        message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", 
        data: undefined 
      },
      { status: 500 }
    );
  }
} 