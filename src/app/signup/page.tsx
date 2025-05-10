import SignupForm from "@/components/auth/SignupForm";
import { JSX } from "react";
export const metadata = {
  title: "สมัครสมาชิก | Goodlistseller",
  description: "สมัครสมาชิกเพื่อใช้งาน Goodlistseller ค้นหาร้านค้าออนไลน์ที่น่าเชื่อถือและแชร์ประสบการณ์การซื้อสินค้า",
};

export default function SignupPage(): JSX.Element {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-cover bg-center z-0"></div>
      <div className="absolute inset-0 bg-blue-900 opacity-40 z-10"></div>
      <SignupForm />  
    </div>
  );
} 