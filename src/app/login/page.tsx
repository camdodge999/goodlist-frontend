import LoginForm from "@/components/auth/LoginForm";
import { JSX } from "react";

export const metadata = {
  title: "เข้าสู่ระบบ | Goodlistseller",
  description: "เข้าสู่ระบบเพื่อใช้งาน Goodlistseller ค้นหาร้านค้าออนไลน์ที่น่าเชื่อถือ",
};

export default function LoginPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
} 