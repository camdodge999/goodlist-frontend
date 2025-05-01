import SignupForm from "@/components/auth/SignupForm";
import { JSX } from "react";
export const metadata = {
  title: "สมัครสมาชิก | Goodlistseller",
  description: "สมัครสมาชิกเพื่อใช้งาน Goodlistseller ค้นหาร้านค้าออนไลน์ที่น่าเชื่อถือและแชร์ประสบการณ์การซื้อสินค้า",
};

export default function SignupPage(): JSX.Element {
  return <SignupForm />;
} 