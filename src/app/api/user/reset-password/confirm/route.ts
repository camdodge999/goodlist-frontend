import { NextRequest, NextResponse } from 'next/server';
import { BodyResponse } from '@/types/response';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { passwordSchema } from '@/validators/user.schema';
import { ZodError } from 'zod';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { token, newPassword, confirmPassword } = await request.json();

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Token, new password, and confirm password are required",
          data: undefined
        },
        { status: 400 }
      );
    }

    // Validate password using Zod schema
    try {
      passwordSchema.parse(newPassword);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          {
            statusCode: 400,
            message: err.errors[0]?.message || "รหัสผ่านไม่ถูกต้อง",
            data: undefined
          },
          { status: 400 }
        );
      }
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "รหัสผ่านไม่ตรงกัน",
          data: undefined
        },
        { status: 400 }
      );
    }

    // Forward the password reset confirmation request to the backend API
    const result = await fetchWithAuth<BodyResponse<{ message: string }>>({
      request,
      url: `${process.env.NEXTAUTH_BACKEND_URL}/api/auth/reset-password/confirm`,
      method: 'POST',
      body: { 
        token,
        newPassword 
      },
    });

    if (result.statusCode === 200) {
      return NextResponse.json(
        {
          statusCode: 200,
          message: "รหัสผ่านได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว",
          data: result.data
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          statusCode: 400,
          message: result.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
          data: undefined
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error confirming password reset:", error);
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