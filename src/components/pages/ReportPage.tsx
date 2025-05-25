"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { reportFormSchema, ReportFormSchema } from "@/validators/report.schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

// Custom components
import StoreSearch from "@/components/report/StoreSearch";
import ReasonTextarea from "@/components/report/ReasonTextarea";
import FileUpload from "@/components/report/FileUpload";
import FormSection from "@/components/report/FormSection";
import StatusDialog from "@/components/common/StatusDialog";
import useShowDialog from "@/hooks/useShowDialog";

// Contexts
import { useStore } from "@/contexts/StoreContext";
import { useReport } from "@/contexts/ReportContext";
import { Store } from "@/types/stores";
import Spinner from "../ui/Spinner";
import { useSession } from "next-auth/react";

export default function ReportPage() {
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<ReportFormSchema>>({});
  
  // Use contexts
  const { stores, fetchStores } = useStore(); 
  const { submitReport, isLoading: reportSubmitting, error: reportError } = useReport();
  const { data: session } = useSession();
  
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

  // Fetch stores when component mounts
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Show error dialog if report submission fails
  useEffect(() => {
    if (reportError) {
      displayErrorDialog({
        title: "เกิดข้อผิดพลาด",
        message: reportError,
        buttonText: "ลองใหม่"
      });
    }
  }, [reportError, displayErrorDialog]);

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
    
    try {
      // Submit report using the context
      const result = await submitReport(formData as ReportFormSchema);
      
      if (result.success) {
        // Show success dialog
        displaySuccessDialog({
          title: "ส่งรายงานสำเร็จ",
          message: "ขอบคุณสำหรับรายงาน เราจะตรวจสอบข้อมูลของคุณโดยเร็วที่สุด",
          buttonText: "กลับสู่หน้าหลัก",
          onButtonClick: () => {
            // Reset form
            setSelectedStore(null);
            setFormData({});
            setValidationErrors({});
            
            // Redirect to home page
            router.push("/");
          }
        });
      } else {
        // If authentication is required but user is not logged in
        if (result.message === "กรุณาเข้าสู่ระบบก่อนทำรายการ" && !session) {
          router.push('/auth/signin?callbackUrl=/report');
          return;
        }
        
        // Show error in form
        setValidationErrors(prev => ({
          ...prev,
          form: result.message
        }));
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      
      // Show error in form
      setValidationErrors(prev => ({
        ...prev,
        form: "เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง"
      }));
    }
  };

  return (
    <div className="report-page py-8">
      <div className="report-container sm:min-w-xl lg:min-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="report-card">
          <CardHeader className="report-header">
            <div className="report-title-section flex items-center gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="report-icon w-8 h-8 text-red-500" />
              <CardTitle className="report-title text-2xl">
                รายงานร้านค้า
              </CardTitle>
            </div>
            <CardDescription className="report-description">
              กรอกข้อมูลเพื่อรายงานร้านค้าที่มีพฤติกรรมไม่เหมาะสม
            </CardDescription>
          </CardHeader>

          <CardContent className="report-content">
            <form
              className="report-form"
              onSubmit={handleSubmit}
            >
            {validationErrors.form && (
              <div className="form-error-message mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="error-text text-sm text-red-600">{validationErrors.form}</p>
              </div>
            )}

            <div className="form-sections space-y-6">
              <FormSection 
                number={1} 
                label="เลือกร้านค้า" 
                description="ค้นหาและเลือกร้านค้าที่ต้องการรายงาน"
              >
                <StoreSearch 
                  stores={stores} 
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
                label="หลักฐาน" 
                description="อัพโหลดภาพหรือเอกสารเพื่อเป็นหลักฐานประกอบการรายงาน"
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
            </div>

            <div className="form-actions mt-8 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={reportSubmitting}
                className="cancel-button"
              >
                ยกเลิก
              </Button>
              <Button 
                type="submit"
                disabled={reportSubmitting || Object.keys(validationErrors).length > 0}
                className="submit-button"
                variant="primary"
              >
                {reportSubmitting ? (
                  <>
                    <Spinner className="loading-spinner mr-2 h-4 w-4" />
                    กำลังส่งรายงาน...
                  </>
                ) : (
                  'ส่งรายงาน'
                )}
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <StatusDialog
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        type="success"
        message={successMessage}
        title={successTitle}
        buttonText={successButtonText}
        onButtonClick={handleSuccessClose}
      />

      {/* Error Dialog */}
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