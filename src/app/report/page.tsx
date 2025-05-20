import ReportPage from "@/components/pages/ReportPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'รายงาน - Goodlistseller',
  description: 'รายงานร้านค้าที่มีการโกงหรือการละเมิดสิทธิของผู้บริโภค',
};

export default function Page() {
  return <ReportPage />;
} 