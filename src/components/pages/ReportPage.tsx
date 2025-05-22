"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { mockStores } from "@/data/mockData";
import { reportFormSchema, ReportFormSchema } from "@/validators/report.schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";

// Custom components
import StoreSearch from "@/components/report/StoreSearch";
import ReasonTextarea from "@/components/report/ReasonTextarea";
import FileUpload from "@/components/report/FileUpload";
import FormSection from "@/components/report/FormSection";
import StatusDialog from "@/components/common/StatusDialog";
import useShowDialog from "@/hooks/useShowDialog";

import { Store } from "@/types/stores";
import { Report } from "@/types/report";



export default function ReportPage() {
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<ReportFormSchema>>({});
  
  // Initialize dialog hooks
  const {
    showSuccessDialog,
    setShowSuccessDialog,
    successMessage,
    successTitle,
    successButtonText,
    displaySuccessDialog,
    handleSuccessClose,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage,
    errorTitle,
    errorButtonText,
    displayErrorDialog,
    handleErrorClose,
  } = useShowDialog();

  // Update formData and reset validation error
  const updateFormData = (field: keyof ReportFormSchema, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    resetValidationError(field);
  };

  // Reset specific validation error
  const resetValidationError = (field: keyof ReportFormSchema) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Handle store selection
  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    updateFormData('storeId', store.id);
  };

  // Handle reason change
  const handleReasonChange = (value: string) => {
    updateFormData('reason', value);
  };

  // Handle file change
  const handleFileChange = (file: File | null) => {
    setEvidenceFile(file);
    if (file) {
      updateFormData('evidence', file);
    } else {
      const newFormData = { ...formData };
      delete newFormData.evidence;
      setFormData(newFormData);
      setValidationErrors(prev => ({
        ...prev,
        evidence: "กรุณาอัพโหลดหลักฐาน"
      }));
    }
  };

  // Validate all fields before submission
  const validateForm = (): boolean => {
    try {
      // Use Zod schema to validate the form data
      reportFormSchema.parse(formData);
      
      // If validation passes, clear any existing errors
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path[0].toString();
            if (!formattedErrors[field]) {
              formattedErrors[field] = err.message;
            }
          }
        });
        setValidationErrors(formattedErrors);
      } else {
        // Handle unexpected errors
        setValidationErrors({
          form: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง"
        });
        console.error("Validation error:", error);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields using Zod
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create new report
      const newReport = {
        id: Date.now().toString(),
        storeId: selectedStore!.id.toString(),
        reason: formData.reason!,
        evidenceUrl: URL.createObjectURL(evidenceFile!),
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      // Add to mockReports (this would be an API call in a real app)
      console.log("Report submitted:", newReport);

      // Show success dialog instead of alert
      displaySuccessDialog({
        title: "ส่งรายงานสำเร็จ",
        message: "ขอบคุณสำหรับรายงาน เราจะตรวจสอบข้อมูลของคุณโดยเร็วที่สุด",
        buttonText: "กลับสู่หน้าหลัก",
        onButtonClick: () => {
          // Reset form
          setSelectedStore(null);
          setFormData({});
          setEvidenceFile(null);
          setValidationErrors({});
          
          // Redirect to home page
          router.push("/");
        }
      });
    } catch (err) {
      console.error("Error submitting report:", err);
      
      // Show error dialog instead of alert
      displayErrorDialog({
        title: "เกิดข้อผิดพลาด",
        message: "เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง",
        buttonText: "ลองใหม่"
      });
      
      setValidationErrors(prev => ({
        ...prev,
        form: "เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง"
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                รายงานร้านค้า
              </h1>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              กรอกข้อมูลเพื่อรายงานร้านค้าที่มีพฤติกรรมไม่เหมาะสม
            </p>
          </div>

          <form
            className="border-t border-gray-200 px-4 py-5 sm:px-6"
            onSubmit={handleSubmit}
          >
            {validationErrors.form && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{validationErrors.form}</p>
              </div>
            )}

            <div className="space-y-6">
              <FormSection 
                number={1} 
                label="เลือกร้านค้า" 
                description="ค้นหาและเลือกร้านค้าที่ต้องการรายงาน"
              >
                <StoreSearch 
                  stores={mockStores} 
                  selectedStore={selectedStore} 
                  onSelectStore={handleStoreSelect}
                  validationError={validationErrors.storeId}
                />
              </FormSection>

              <FormSection 
                number={2} 
                label="เหตุผล" 
                description="ระบุเหตุผลที่คุณต้องการรายงานร้านค้านี้"
              >
                <ReasonTextarea 
                  value={formData.reason || ''} 
                  onChange={handleReasonChange}
                  validationError={validationErrors.reason}
                  schema={reportFormSchema.shape.reason}
                  placeholder="อธิบายรายละเอียดของปัญหาที่คุณพบ..."
                />
              </FormSection>

              <FormSection 
                number={3} 
                label="แนบหลักฐาน" 
                description="อัพโหลดรูปภาพหรือเอกสารที่แสดงถึงการกระทำที่ไม่เหมาะสม"
              >
                <FileUpload 
                  onFileChange={handleFileChange}
                  validationError={validationErrors.evidence}
                  fileSchema={reportFormSchema.shape.evidence}
                  label="อัพโหลดไฟล์"
                  description="PNG, JPG, PDF ขนาดไม่เกิน 10MB"
                  accept="image/png,image/jpeg,application/pdf"
                />
              </FormSection>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="px-4 py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังส่งรายงาน..." : "ส่งรายงาน"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Status Dialogs */}
      <StatusDialog
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        type="success"
        message={successMessage}
        title={successTitle}
        buttonText={successButtonText}
        onButtonClick={handleSuccessClose}
      />
      
      <StatusDialog
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        type="error"
        message={errorMessage}
        title={errorTitle}
        buttonText={errorButtonText}
        onButtonClick={handleErrorClose}
      />
    </div>
  );
} 