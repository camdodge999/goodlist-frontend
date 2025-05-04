import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

// Components
import FileInput from "./FileInput";

// Schemas
import { 
  verificationFormSchema, 
  fileValidationSchema,
  VerificationFormSchema
} from "@/validators/store.schema";

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
  // Form state using react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<VerificationFormSchema>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: initialData || {
      storeName: "",
      email: "",
      bankAccount: "",
      taxId: "",
      contactInfo: {
        line: "",
        facebook: "",
        phone: "",
        address: "",
      },
    }
  });

  // File state
  const [storeImage, setStoreImage] = useState<File | null>(null);
  const [registrationDoc, setRegistrationDoc] = useState<File | null>(null);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // File refs
  const storeImageRef = useRef<HTMLInputElement | null>(null);
  const registrationDocRef = useRef<HTMLInputElement | null>(null);
  const idCardRef = useRef<HTMLInputElement | null>(null);

  // File handlers
  const handleStoreImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB");
        return;
      }
      // Check file type
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น");
        return;
      }
      setStoreImage(file);
    }
  };

  const handleRegistrationDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB");
        return;
      }
      // Check file type
      if (file.type !== "application/pdf") {
        alert("รองรับเฉพาะไฟล์ PDF เท่านั้น");
        return;
      }
      setRegistrationDoc(file);
    }
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB");
        return;
      }
      // Check file type
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น");
        return;
      }
      setIdCard(file);
    }
  };
  
  // Form submit handler
  const handleFormSubmit = async (formData: VerificationFormSchema) => {
    setError("");
    setIsSubmitting(true);

    try {
      // Validate required files
      if (!storeImage || !idCard) {
        setError("กรุณาอัพโหลดรูปร้านค้าและบัตรประชาชน");
        setIsSubmitting(false);
        return;
      }

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

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon 
                icon={faExclamationCircle} 
                className="h-5 w-5 text-red-400" 
              />
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="storeName"
            className="block text-sm font-medium text-gray-700"
          >
            ชื่อร้านค้า <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="storeName"
            className={`mt-1 block w-full border ${
              errors.storeName ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            {...register("storeName")}
          />
          {errors.storeName && (
            <p className="mt-1 text-sm text-red-600">{errors.storeName.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            อีเมล <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            className={`mt-1 block w-full border ${
              errors.email ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="bankAccount"
            className="block text-sm font-medium text-gray-700"
          >
            เลขบัญชีธนาคาร <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="bankAccount"
            className={`mt-1 block w-full border ${
              errors.bankAccount ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            {...register("bankAccount")}
          />
          {errors.bankAccount && (
            <p className="mt-1 text-sm text-red-600">{errors.bankAccount.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="taxId"
            className="block text-sm font-medium text-gray-700"
          >
            เลขประจำตัวผู้เสียภาษี (ถ้ามี)
          </label>
          <input
            type="text"
            id="taxId"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            {...register("taxId")}
          />
        </div>

        <div>
          <label
            htmlFor="line"
            className="block text-sm font-medium text-gray-700"
          >
            Line ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="line"
            className={`mt-1 block w-full border ${
              errors.contactInfo?.line ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            {...register("contactInfo.line")}
          />
          {errors.contactInfo?.line && (
            <p className="mt-1 text-sm text-red-600">{errors.contactInfo.line.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="facebook"
            className="block text-sm font-medium text-gray-700"
          >
            Facebook Page <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="facebook"
            className={`mt-1 block w-full border ${
              errors.contactInfo?.facebook ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            {...register("contactInfo.facebook")}
          />
          {errors.contactInfo?.facebook && (
            <p className="mt-1 text-sm text-red-600">{errors.contactInfo.facebook.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            เบอร์โทรศัพท์ <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            className={`mt-1 block w-full border ${
              errors.contactInfo?.phone ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            {...register("contactInfo.phone")}
          />
          {errors.contactInfo?.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.contactInfo.phone.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            ที่อยู่ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            rows={3}
            className={`mt-1 block w-full border ${
              errors.contactInfo?.address ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            {...register("contactInfo.address")}
          ></textarea>
          {errors.contactInfo?.address && (
            <p className="mt-1 text-sm text-red-600">{errors.contactInfo.address.message}</p>
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
          fileRef={storeImageRef}
          selectedFile={storeImage}
        />

        {/* Business Registration Document */}
        <FileInput
          id="registration-doc"
          label="เอกสารจดทะเบียนธุรกิจ (ถ้ามี)"
          description="PDF ขนาดไม่เกิน 5MB"
          acceptTypes="application/pdf"
          onChange={handleRegistrationDocChange}
          fileRef={registrationDocRef}
          selectedFile={registrationDoc}
        />

        {/* ID Card */}
        <FileInput
          id="id-card"
          label="บัตรประชาชน (จำเป็น)"
          description="PNG, JPG ขนาดไม่เกิน 5MB"
          acceptTypes="image/jpeg, image/png"
          onChange={handleIdCardChange}
          fileRef={idCardRef}
          selectedFile={idCard}
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
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังส่งเอกสาร..." : "ส่งเอกสารยืนยันตัวตน"}
          </button>
        </div>
      </div>
    </form>
  );
} 