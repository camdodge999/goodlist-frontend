import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";

// Custom components following ReportPage pattern
import ReasonTextarea from "@/components/report/ReasonTextarea";
import FileUpload from "@/components/report/FileUpload";
import FormSection from "@/components/report/FormSection";
import StatusDialog from "@/components/common/StatusDialog";
import useShowDialog from "@/hooks/useShowDialog";
import Spinner from "@/components/ui/Spinner";

// Validation and types
import { reportFormSchema, ReportFormSchema } from "@/validators/report.schema";

// Contexts
import { useReport } from "@/contexts/ReportContext";

interface ReportDialogProps {
  isOpen: boolean;
  storeId: number;
  onOpenChange: (open: boolean) => void;
}

export default function ReportDialog({ isOpen, storeId, onOpenChange }: ReportDialogProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<ReportFormSchema>>({
    storeId: storeId
  });
  
  // Use report context
  const { submitReport, isLoading: reportSubmitting, error: reportError } = useReport();
  
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

  // Update storeId when prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      storeId: storeId
    }));
  }, [storeId]);

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
  const updateFormData = (field: keyof ReportFormSchema, value: number | string | File | null) => {
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
          buttonText: "ปิด",
          onButtonClick: () => {
            // Reset form and close dialog
            resetForm();
            onOpenChange(false);
          }
        });
      } else {
        // Show error in form
        setValidationErrors(prev => ({
          ...prev,
          form: result.message
        }));
      }
    } catch {
      
      // Show error in form
      setValidationErrors(prev => ({
        ...prev,
        form: "เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง"
      }));
    }
  };

  const resetForm = () => {
    setFormData({ storeId: storeId });
    setValidationErrors({});
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายงานร้านค้า</DialogTitle>
            <DialogDescription>
              กรุณาระบุเหตุผลและรายละเอียดในการรายงานร้านค้านี้
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationErrors.form && (
              <div className="form-error-message p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="error-text text-sm text-red-600">{validationErrors.form}</p>
              </div>
            )}

            <div className="form-sections space-y-4">
              <FormSection 
                number={1} 
                label="เหตุผล" 
                description="ระบุเหตุผลที่คุณต้องการรายงานร้านค้านี้"
              >
                <ReasonTextarea 
                  value={formData.reason || ''} 
                  onChange={handleReasonChange}
                  validationError={validationErrors.reason}
                  schema={reportFormSchema.shape.reason}
                  placeholder="อธิบายรายละเอียดของปัญหาที่คุณพบ..."
                  rows={3}
                />
              </FormSection>

              <FormSection 
                number={2} 
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

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
                disabled={reportSubmitting}
              >
                ยกเลิก
              </Button>
              <Button 
                type="submit"
                disabled={reportSubmitting || Object.keys(validationErrors).length > 0}
                variant="primary"
              >
                {reportSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    กำลังส่งรายงาน...
                  </>
                ) : (
                  'ส่งรายงาน'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
    </>
  );
} 