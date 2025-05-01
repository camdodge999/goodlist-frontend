import React from 'react';
import Link from 'next/link';
import { ResetPasswordSuccessProps } from '@/types/auth';

const ResetPasswordSuccess: React.FC<ResetPasswordSuccessProps> = ({ onBackToLogin }) => {
  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน
      </p>
      <div className="mt-6">
        <Link
          href="/login"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={onBackToLogin}
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordSuccess; 