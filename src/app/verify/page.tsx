"use client";

import {
  useState,
  useRef,
  useEffect
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStore, 
  faFileAlt, 
  faIdCard, 
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// Components
import FileInput from "@/components/verify/FileInput";
import VerificationStatusBox from "@/components/verify/VerificationStatusBox";

// Types
import { 
  ContactInfo, 
  VerificationFormData, 
  VerificationStatusType 
} from "@/types/verify";
import { Store } from "@/types/stores";

export default function VerifyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<VerificationFormData>({
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
  });
  
  const [storeImage, setStoreImage] = useState<File | null>(null);
  const [registrationDoc, setRegistrationDoc] = useState<File | null>(null);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const storeImageRef = useRef<HTMLInputElement>(null);
  const registrationDocRef = useRef<HTMLInputElement>(null);
  const idCardRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsLoading(false);
    
    // Pre-fill email field with user's email
    if (user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ""
      }));
    }
  }, [user, router]);

  const getVerificationStatus = (): VerificationStatusType => {
    if (!user) return "not_started";

    // In a real app, this would be fetched from API
    // Mock implementation
    const userStores: Store[] = [
      {
        id: 1,
        userId: 1,
        storeName: "Example Store",
        bankAccount: "XXX-X-XXXXX-X",
        contactInfo: {
          line: "@examplestore",
          facebook: "ExampleStorePage",
          phone: "08-1234-5678",
          address: "123 Example St., Bangkok, Thailand",
        },
        description: "This is an example store",
        isVerified: true,
        isBanned: false,
        createdAt: "2023-02-15T08:30:00Z",
        updatedAt: "2023-02-15T08:30:00Z",
        imageUrl: "/images/stores/default-store.jpg",
      }
    ];

    // For example purposes only
    const hasVerifiedStore = userStores.some(store => store.isVerified);
    const hasPendingStore = userStores.some(store => !store.isVerified && !store.isBanned);
    const hasBannedStore = userStores.some(store => store.isBanned);

    if (hasBannedStore) {
      return "banned";
    } else if (hasVerifiedStore) {
      return "verified";
    } else if (hasPendingStore) {
      return "pending";
    } else {
      return "not_started";
    }
  };

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

  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [name]: value,
      },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (
        !formData.storeName ||
        !formData.bankAccount ||
        !formData.contactInfo.line ||
        !formData.contactInfo.facebook ||
        !formData.contactInfo.phone ||
        !formData.contactInfo.address
      ) {
        setError("กรุณากรอกข้อมูลให้ครบถ้วน");
        setIsSubmitting(false);
        return;
      }

      // Require at least the store image and ID card
      if (!storeImage || !idCard) {
        setError("กรุณาอัพโหลดรูปร้านค้าและบัตรประชาชน");
        setIsSubmitting(false);
        return;
      }

      // In a real app, you would upload files to a server
      // and create a store record with the verification status
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert("ส่งเอกสารเรียบร้อยแล้ว กรุณารอการตรวจสอบ");
      router.push("/profile");
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการส่งเอกสาร กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            ยืนยันตัวตนร้านค้า
          </h1>

          <VerificationStatusBox status={verificationStatus} />

          {/* Only show form if user hasn't submitted verification yet */}
          {verificationStatus === "not_started" && (
            <form onSubmit={handleSubmit}>
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
                    name="storeName"
                    id="storeName"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    required
                  />
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
                    name="email"
                    id="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!!user?.email}
                    required
                  />
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
                    name="bankAccount"
                    id="bankAccount"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    required
                  />
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
                    name="taxId"
                    id="taxId"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.taxId}
                    onChange={handleInputChange}
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
                    name="line"
                    id="line"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.contactInfo.line}
                    onChange={handleContactInfoChange}
                    required
                  />
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
                    name="facebook"
                    id="facebook"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.contactInfo.facebook}
                    onChange={handleContactInfoChange}
                    required
                  />
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
                    name="phone"
                    id="phone"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.contactInfo.phone}
                    onChange={handleContactInfoChange}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ที่อยู่ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.contactInfo.address}
                    onChange={handleContactInfoChange}
                    required
                  ></textarea>
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
          )}
        </div>
      </div>
    </div>
  );
} 