import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ReportReason } from "@/types/stores";

interface ReportDialogProps {
  isOpen: boolean;
  storeId: number;
  onOpenChange: (open: boolean) => void;
}

export default function ReportDialog({ isOpen, storeId, onOpenChange }: ReportDialogProps) {
  const [reportReason, setReportReason] = useState<ReportReason | "">("");
  const [reportDetails, setReportDetails] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 10MB");
        return;
      }
      // Check file type
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        alert("รองรับเฉพาะไฟล์ PNG, JPG และ PDF เท่านั้น");
        return;
      }
      setEvidenceFile(file);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason || !reportDetails || !evidenceFile) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call or call actual API in production
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a unique filename
      const fileExtension = evidenceFile.name.split(".").pop();
      const timestamp = Date.now();
      const fileName = `report_${storeId}_${timestamp}.${fileExtension}`;

      // In a real application, you would upload the file to a server or cloud storage
      const evidenceUrl = URL.createObjectURL(evidenceFile);

      // Create report object to send to API
      const reportData = {
        storeId,
        reason: reportReason as ReportReason,
        details: reportDetails,
        evidenceFilename: fileName,
      };

      console.log("Submitting report:", reportData);
      // Here you would make an API call to submit the report
      // await reportStoreAPI(reportData, evidenceFile);

      // Reset form and close dialog
      resetForm();
      onOpenChange(false);

      // Show success message
      alert("รายงานของคุณถูกส่งเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReportReason("");
    setReportDetails("");
    setEvidenceFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>รายงานร้านค้า</DialogTitle>
          <DialogDescription>
            กรุณาระบุเหตุผลและรายละเอียดในการรายงานร้านค้านี้
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>เหตุผลในการรายงาน</Label>
            <RadioGroup
              value={reportReason}
              onValueChange={(value) => setReportReason(value as ReportReason)}
              className="grid gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scam" id="scam" />
                <Label htmlFor="scam">หลอกลวง</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fake" id="fake" />
                <Label htmlFor="fake">สินค้าปลอม/ของเลียนแบบ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate" id="inappropriate" />
                <Label htmlFor="inappropriate">เนื้อหาไม่เหมาะสม</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">อื่นๆ</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">รายละเอียดเพิ่มเติม</Label>
            <Textarea
              id="details"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="กรุณาระบุรายละเอียดเพิ่มเติม..."
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>อัพโหลดหลักฐาน</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors duration-200">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>อัพโหลดไฟล์</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pl-1">หรือลากไฟล์มาวาง</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF ขนาดไม่เกิน 10MB
                </p>
                {evidenceFile && (
                  <p className="text-xs text-green-600 mt-2">
                    เลือกไฟล์: {evidenceFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleReportSubmit}
            disabled={
              !reportReason || !reportDetails || !evidenceFile || isSubmitting
            }
          >
            {isSubmitting ? "กำลังส่ง..." : "ส่งรายงาน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 