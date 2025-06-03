import ReportPage from "@/components/pages/ReportPage";
import { Metadata } from "next";
import { metadataPages } from "@/consts/metadata";

export const metadata: Metadata = {
  title: metadataPages.report.title,
  description: metadataPages.report.description,
};

export default function Page() {
  return (
    <div className="h-[calc(100vh-100px)] bg-gray-50 flex items-center justify-center">
      <ReportPage />
    </div>
  );
} 