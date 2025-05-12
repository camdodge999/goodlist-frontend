import React, { useRef, useState, FormEvent, ChangeEvent } from "react";

// Components
import FileInput from "./FileInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormLabel } from "@/components/ui/form-label";
import { FormMessage } from "@/components/ui/form-message";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";

// Types and validation
import { verificationFormSchema, fileValidationSchema, type VerificationFormSchema } from "@/validators/store.schema";

interface VerificationFormProps {
  initialData?: Partial<VerificationFormSchema>;
  onSubmit: (
    formData: VerificationFormSchema, 
    files: { 
      storeImage: File | null; 
      registrationDoc: File | null; 
      idCard: File | null 
    }
  ) => Promise<void>;
}

export default function VerificationForm({ 
  initialData,
  onSubmit 
}: VerificationFormProps) {
  // Form state using useState for each field
  const [formData, setFormData] = useState<VerificationFormSchema>({
    storeName: initialData?.storeName || "",
    email: initialData?.email || "",
    bankAccount: initialData?.bankAccount || "",
    taxId: initialData?.taxId || "",
    contactInfo: {
      line: initialData?.contactInfo?.line || "",
      facebook: initialData?.contactInfo?.facebook || "",
      phone: initialData?.contactInfo?.phone || "",
      address: initialData?.contactInfo?.address || "",
    }
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // File state
  const [storeImage, setStoreImage] = useState<File | null>(null);
  const [registrationDoc, setRegistrationDoc] = useState<File | null>(null);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  
  // File refs
  const storeImageRef = useRef<HTMLInputElement | null>(null);
  const registrationDocRef = useRef<HTMLInputElement | null>(null);
  const idCardRef = useRef<HTMLInputElement | null>(null);

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like contactInfo.line
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }));
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear the error for this field when it's changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // File handlers
  const handleStoreImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Clear previous errors
    setFileErrors(prev => ({...prev, storeImage: ""}));
    
    if (!file) {
      setStoreImage(null);
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors(prev => ({...prev, storeImage: "ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB"}));
      return;
    }
    
    // Check file type
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFileErrors(prev => ({...prev, storeImage: "รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น"}));
      return;
    }
    
    setStoreImage(file);
  };

  const handleRegistrationDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Clear previous errors
    setFileErrors(prev => ({...prev, registrationDoc: ""}));
    
    if (!file) {
      setRegistrationDoc(null);
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors(prev => ({...prev, registrationDoc: "ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB"}));
      return;
    }
    
    // Check file type
    if (file.type !== "application/pdf") {
      setFileErrors(prev => ({...prev, registrationDoc: "รองรับเฉพาะไฟล์ PDF เท่านั้น"}));
      return;
    }
    
    setRegistrationDoc(file);
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Clear previous errors
    setFileErrors(prev => ({...prev, idCard: ""}));
    
    if (!file) {
      setIdCard(null);
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors(prev => ({...prev, idCard: "ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB"}));
      return;
    }
    
    // Check file type
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFileErrors(prev => ({...prev, idCard: "รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น"}));
      return;
    }
    
    setIdCard(file);
  };
  
  // Validate form using Zod schema
  const validateForm = (): boolean => {
    // Use Zod schema to validate form data
    const result = verificationFormSchema.safeParse(formData);
    
    if (!result.success) {
      // Format Zod validation errors
      const formattedErrors: Record<string, string> = {};
      
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        formattedErrors[path] = err.message;
      });
      
      setErrors(formattedErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  // Form submit handler
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFileErrors({});

    // Validate form fields using Zod
    if (!validateForm()) {
      return;
    }

    // Validate required files
    const newFileErrors: Record<string, string> = {};
    let hasFileErrors = false;

    if (!storeImage) {
      newFileErrors.storeImage = "กรุณาอัพโหลดรูปร้านค้า";
      hasFileErrors = true;
    }

    if (!idCard) {
      newFileErrors.idCard = "กรุณาอัพโหลดบัตรประชาชน";
      hasFileErrors = true;
    }

    if (hasFileErrors) {
      setFileErrors(newFileErrors);
      setError("กรุณาอัพโหลดไฟล์ที่จำเป็นทั้งหมด");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData, {
        storeImage,
        registrationDoc,
        idCard
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการส่งเอกสาร กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error getter helper
  const getErrorMessage = (field: string) => {
    return errors[field] || "";
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="storeName" required>
            ชื่อร้านค้า
          </FormLabel>
          <Input
            id="storeName"
            name="storeName"
            value={formData.storeName}
            onChange={handleInputChange}
            className={`mt-1 ${getErrorMessage('storeName') ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!getErrorMessage('storeName')}
          />
          {getErrorMessage('storeName') && (
            <FormMessage variant="error">{getErrorMessage('storeName')}</FormMessage>
          )}
        </div>

        <div>
          <FormLabel htmlFor="email" required>
            อีเมล
          </FormLabel>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`mt-1 ${getErrorMessage('email') ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!getErrorMessage('email')}
          />
          {getErrorMessage('email') && (
            <FormMessage variant="error">{getErrorMessage('email')}</FormMessage>
          )}
        </div>

        <div>
          <FormLabel htmlFor="bankAccount" required>
            เลขบัญชีธนาคาร
          </FormLabel>
          <Input
            type="text"
            id="bankAccount"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleInputChange}
            className={`mt-1 ${getErrorMessage('bankAccount') ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!getErrorMessage('bankAccount')}
          />
          {getErrorMessage('bankAccount') && (
            <FormMessage variant="error">{getErrorMessage('bankAccount')}</FormMessage>
          )}
        </div>

        <div>
          <FormLabel htmlFor="taxId">
            เลขประจำตัวผู้เสียภาษี (ถ้ามี)
          </FormLabel>
          <Input
            type="text"
            id="taxId"
            name="taxId"
            value={formData.taxId}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <FormLabel htmlFor="line" required>
            Line ID
          </FormLabel>
          <Input
            type="text"
            id="line"
            name="contactInfo.line"
            value={formData.contactInfo.line}
            onChange={handleInputChange}
            className={`mt-1 ${getErrorMessage('contactInfo.line') ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!getErrorMessage('contactInfo.line')}
          />
          {getErrorMessage('contactInfo.line') && (
            <FormMessage variant="error">{getErrorMessage('contactInfo.line')}</FormMessage>
          )}
        </div>

        <div>
          <FormLabel htmlFor="facebook" required>
            Facebook Page
          </FormLabel>
          <Input
            type="text"
            id="facebook"
            name="contactInfo.facebook"
            value={formData.contactInfo.facebook}
            onChange={handleInputChange}
            className={`mt-1 ${getErrorMessage('contactInfo.facebook') ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!getErrorMessage('contactInfo.facebook')}
          />
          {getErrorMessage('contactInfo.facebook') && (
            <FormMessage variant="error">{getErrorMessage('contactInfo.facebook')}</FormMessage>
          )}
        </div>

        <div>
          <FormLabel htmlFor="phone" required>
            เบอร์โทรศัพท์
          </FormLabel>
          <Input
            type="tel"
            id="phone"
            name="contactInfo.phone"
            value={formData.contactInfo.phone}
            onChange={handleInputChange}
            className={`mt-1 ${getErrorMessage('contactInfo.phone') ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!getErrorMessage('contactInfo.phone')}
          />
          {getErrorMessage('contactInfo.phone') && (
            <FormMessage variant="error">{getErrorMessage('contactInfo.phone')}</FormMessage>
          )}
        </div>

        <div className="sm:col-span-2">
          <FormLabel htmlFor="address" required>
            ที่อยู่
          </FormLabel>
          <Textarea
            id="address"
            name="contactInfo.address"
            rows={3}
            value={formData.contactInfo.address}
            onChange={handleInputChange}
            className={`mt-1 ${getErrorMessage('contactInfo.address') ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!getErrorMessage('contactInfo.address')}
          />
          {getErrorMessage('contactInfo.address') && (
            <FormMessage variant="error">{getErrorMessage('contactInfo.address')}</FormMessage>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          อัพโหลดเอกสาร
        </h2>

        {/* Store Image */}
        <FileInput
          id="store-image"
          label="รูปร้านค้า (จำเป็น)"
          description="PNG, JPG ขนาดไม่เกิน 5MB"
          acceptTypes="image/jpeg, image/png"
          onChange={handleStoreImageChange}
          fileRef={storeImageRef as unknown as React.RefObject<HTMLInputElement>}
          selectedFile={storeImage}
          error={fileErrors.storeImage}
        />

        {/* Business Registration Document */}
        <FileInput
          id="registration-doc"
          label="เอกสารจดทะเบียนธุรกิจ (ถ้ามี)"
          description="PDF ขนาดไม่เกิน 5MB"
          acceptTypes="application/pdf"
          onChange={handleRegistrationDocChange}
          fileRef={registrationDocRef as unknown as React.RefObject<HTMLInputElement>}
          selectedFile={registrationDoc}
          error={fileErrors.registrationDoc}
        />

        {/* ID Card */}
        <FileInput
          id="id-card"
          label="บัตรประชาชน (จำเป็น)"
          description="PNG, JPG ขนาดไม่เกิน 5MB"
          acceptTypes="image/jpeg, image/png"
          onChange={handleIdCardChange}
          fileRef={idCardRef as unknown as React.RefObject<HTMLInputElement>}
          selectedFile={idCard}
          error={fileErrors.idCard}
        />
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="text-xs text-gray-500 mb-4">
          <p>
            หมายเหตุ: การยืนยันตัวตนจะช่วยเพิ่มความน่าเชื่อถือให้กับร้านค้าของคุณ
            และช่วยให้ลูกค้ามั่นใจในการตัดสินใจซื้อสินค้า
          </p>
          <p className="mt-1">
            ข้อมูลส่วนตัวของคุณจะถูกเก็บเป็นความลับตามนโยบายความเป็นส่วนตัวของเรา
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังส่งเอกสาร..." : "ส่งเอกสารยืนยันตัวตน"}
          </Button>
        </div>
      </div>
    </form>
  );
} 