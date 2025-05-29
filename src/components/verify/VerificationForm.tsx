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
import { verificationFormSchema, type VerificationFormSchema } from "@/validators/verify.schema";
import Spinner from "../ui/Spinner";

interface VerificationFormProps {
  initialData?: Partial<VerificationFormSchema>;
  savedFiles?: {
    imageStore: File | null;
    certIncrop: File | null;
    imageIdCard: File | null;
  } | null;
  isSubmitting?: boolean;
  onSubmit: (
    formData: VerificationFormSchema, 
    files: { 
      imageStore: File | null; 
      certIncrop: File | null; 
      imageIdCard: File | null 
    }
  ) => Promise<void>;
}

export default function VerificationForm({ 
  initialData,
  savedFiles,
  isSubmitting = false,
  onSubmit 
}: VerificationFormProps) {
  // Form state using useState for each field
  const [formData, setFormData] = useState<VerificationFormSchema>({
    storeName: initialData?.storeName || "",
    email: initialData?.email || "",
    bankAccount: initialData?.bankAccount || "",
    taxPayerId: initialData?.taxPayerId || "",
    description: initialData?.description || "",
    contactInfo: {
      line: initialData?.contactInfo?.line || "",
      facebook: initialData?.contactInfo?.facebook || "",
      phone: initialData?.contactInfo?.phone || "",
      address: initialData?.contactInfo?.address || "",
      other: initialData?.contactInfo?.other || "",
    }
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // File state
  const [imageStore, setImageStore] = useState<File | null>(savedFiles?.imageStore || null);
  const [certIncrop, setCertIncrop] = useState<File | null>(savedFiles?.certIncrop || null);
  const [imageIdCard, setImageIdCard] = useState<File | null>(savedFiles?.imageIdCard || null);
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  
  // File refs
  const imageStoreRef = useRef<HTMLInputElement | null>(null);
  const certIncropRef = useRef<HTMLInputElement | null>(null);
  const imageIdCardRef = useRef<HTMLInputElement | null>(null);

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
  const handleImageStoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Clear previous errors
    setFileErrors(prev => ({...prev, imageStore: ""}));
    
    if (!file) {
      setImageStore(null);
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors(prev => ({...prev, imageStore: "ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB"}));
      return;
    }
    
    // Check file type
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFileErrors(prev => ({...prev, imageStore: "รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น"}));
      return;
    }
    
    setImageStore(file);
  };

  const handlecertIncropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Clear previous errors
    setFileErrors(prev => ({...prev, certIncrop: ""}));
    
    if (!file) {
      setCertIncrop(null);
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors(prev => ({...prev, certIncrop: "ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB"}));
      return;
    }
    
    // Check file type
    if (file.type !== "application/pdf") {
      setFileErrors(prev => ({...prev, certIncrop: "รองรับเฉพาะไฟล์ PDF เท่านั้น"}));
      return;
    }
    
    setCertIncrop(file);
  };

  const handleImageIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Clear previous errors
    setFileErrors(prev => ({...prev, imageIdCard: ""}));
    
    if (!file) {
      setImageIdCard(null);
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors(prev => ({...prev, imageIdCard: "ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB"}));
      return;
    }
    
    // Check file type
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFileErrors(prev => ({...prev, imageIdCard: "รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น"}));
      return;
    }
    
    setImageIdCard(file);
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

    if (!imageStore) {
      newFileErrors.imageStore = "กรุณาอัพโหลดรูปร้านค้า";
      hasFileErrors = true;
    }

    if (!imageIdCard) {
      newFileErrors.imageIdCard = "กรุณาอัพโหลดบัตรประชาชน";
      hasFileErrors = true;
    }

    if (hasFileErrors) {
      setFileErrors(newFileErrors);
      setError("กรุณาอัพโหลดไฟล์ที่จำเป็นทั้งหมด");
      return;
    }

    setLocalIsSubmitting(true);

    try {
      await onSubmit(formData, {
        imageStore,
        certIncrop,
        imageIdCard
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการส่งเอกสาร กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  // Error getter helper
  const getErrorMessage = (field: string) => {
    return errors[field] || "";
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8 mt-4">
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
        <div className="sm:col-span-2 border-b border-gray-200 pb-6">
          <FormLabel htmlFor="description" required>
            รายละเอียด
          </FormLabel>
          <Textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className={`mt-1 ${getErrorMessage('description') ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!getErrorMessage('description')}
          />
          {getErrorMessage('description') && (
            <FormMessage variant="error">{getErrorMessage('description')}</FormMessage>
          )}
        </div>

        <div>
          <FormLabel htmlFor="bankAccount" required>
            เลขบัญชีธนาคาร (ไม่ต้องมี -)
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
          <FormLabel htmlFor="taxPayerId">
            เลขประจำตัวผู้เสียภาษี
          </FormLabel>
          <Input
            type="text"
            id="taxPayerId"
            name="taxPayerId"
            value={formData.taxPayerId}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <FormLabel htmlFor="line" required>
            Line ID (ไม่ต้องมี @)
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
        <div>
          <FormLabel htmlFor="other">
            อื่นๆ
          </FormLabel>
          <Input
            type="text"
            id="other"
            name="contactInfo.other"
            value={formData.contactInfo.other}
            onChange={handleInputChange}
            className={`mt-1 ${getErrorMessage('contactInfo.other') ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!getErrorMessage('contactInfo.other')}
          />
          {getErrorMessage('contactInfo.other') && (
            <FormMessage variant="error">{getErrorMessage('contactInfo.other')}</FormMessage>
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
          required={true}
          id="image-store"
          label="รูปร้านค้า (จำเป็น)"
          description="PNG, JPG ขนาดไม่เกิน 5MB"
          acceptTypes="image/jpeg, image/png"
          onChange={handleImageStoreChange}
          fileRef={imageStoreRef as unknown as React.RefObject<HTMLInputElement>}
          selectedFile={imageStore}
          error={fileErrors.imageStore}
        />

        {/* Business Registration Document */}
        <FileInput
          required={false}
          id="cert-incorp"
          label="เอกสารจดทะเบียนธุรกิจ (ถ้ามี)"
          description="PDF ขนาดไม่เกิน 5MB"
          acceptTypes="application/pdf"
          onChange={handlecertIncropChange}
          fileRef={certIncropRef as unknown as React.RefObject<HTMLInputElement>}
          selectedFile={certIncrop}
          error={fileErrors.certIncrop}
        />

        {/* ID Card */}
        <FileInput
          required={true}
          id="image-id-card"
          label="บัตรประชาชน (จำเป็น)"
          description="PNG, JPG ขนาดไม่เกิน 5MB"
          acceptTypes="image/jpeg, image/png"
          onChange={handleImageIdCardChange}
          fileRef={imageIdCardRef as unknown as React.RefObject<HTMLInputElement>}
          selectedFile={imageIdCard}
          error={fileErrors.imageIdCard}
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

        {/* Submit button */}
        <div className="mt-8">
          <Button 
            type="submit" 
            variant="primary"
            className="w-full py-6 text-lg"
            disabled={isSubmitting || localIsSubmitting}
          >
            {(isSubmitting || localIsSubmitting) 
              ? <><Spinner size="sm" className="mr-2" /> กำลังส่งข้อมูล...</> 
              : "ส่งเอกสารยืนยันตัวตน"}
          </Button>
        </div>
      </div>
    </form>
  );
} 