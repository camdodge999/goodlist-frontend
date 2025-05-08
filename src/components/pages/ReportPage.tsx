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

// Define types
type ContactInfo = {
  line?: string;
  facebook?: string;
  phone?: string;
  address?: string;
};

type Store = {
  id: number;
  userId: number;
  storeName: string;
  contactInfo: ContactInfo;
  imageUrl?: string;
  isVerified: boolean;
  isBanned: boolean;
};

type Report = {
  id: string;
  store_id: number;
  reason: string;
  evidence_url: string;
  created_at: string;
  status: "pending" | "valid" | "invalid";
};

export default function ReportPage() {
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<ReportFormSchema>>({});

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
    let isValid = true;
    const newErrors: Record<string, string> = {};

    // Validate store selection
    if (!selectedStore) {
      newErrors.storeId = "กรุณาเลือกร้านค้า";
      isValid = false;
    }

    // Validate reason
    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = "เหตุผลต้องมีความยาวอย่างน้อย 10 ตัวอักษร";
      isValid = false;
    }

    // Validate evidence
    if (!evidenceFile) {
      newErrors.evidence = "กรุณาอัพโหลดหลักฐาน";
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create new report
      const newReport: Report = {
        id: Date.now().toString(),
        store_id: selectedStore!.id,
        reason: formData.reason!,
        evidence_url: URL.createObjectURL(evidenceFile!),
        created_at: new Date().toISOString(),
        status: "pending",
      };

      // Add to mockReports (this would be an API call in a real app)
      console.log("Report submitted:", newReport);

      // Show success message
      alert("ส่งรายงานเรียบร้อยแล้ว");

      // Reset form
      setSelectedStore(null);
      setFormData({});
      setEvidenceFile(null);
      setValidationErrors({});

      // Redirect to home page
      router.push("/");
    } catch (err) {
      console.error("Error submitting report:", err);
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
    </div>
  );
} 