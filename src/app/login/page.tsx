import { Metadata } from "next";
import LoginClientPage from "./client";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | Goodlistseller",
  description: "เข้าสู่ระบบเพื่อใช้งาน Goodlistseller ค้นหาร้านค้าออนไลน์ที่น่าเชื่อถือ",
};

export default function LoginPage() {
  return <LoginClientPage />;
} 