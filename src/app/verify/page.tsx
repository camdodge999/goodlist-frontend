"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUser, UserProvider } from "@/contexts/UserContext";

// Components
import VerificationStatusBox from "@/components/verify/VerificationStatusBox";
import VerificationForm from "@/components/verify/VerificationForm";

// Types
import { VerificationFormSchema } from "@/validators/verify.schema";

// Client component that uses UserContext
function VerifyPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { currentUser, fetchUserProfile, verifyUser, getVerificationStatus, isLoading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    // Use a ref to ensure we only fetch user data once
    if (status === "authenticated" && session?.user?.id && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsLoading(true);
      
      // We don't need to wait for this promise in the effect
      fetchUserProfile(session.user.id).finally(() => {
        setIsLoading(false);
      });
    }
  }, [status, session, router, fetchUserProfile]);

  const handleFormSubmit = async (
    formData: VerificationFormSchema, 
    files: { 
      imageStore: File | null; 
      certIncorp: File | null; 
      imageIdCard: File | null 
    }
  ) => {
    try {
      if (!session?.user?.id) {
        throw new Error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง");
      }
      
      setIsLoading(true);
      
      // Create FormData object to send files
      const submitFormData = new FormData();
      
      // Add form fields - ensure all values are strings
      submitFormData.append('userId', session.user.id.toString());
      submitFormData.append('storeName', formData.storeName);
      submitFormData.append('email', formData.email || '');
      submitFormData.append('bankAccount', formData.bankAccount || '');
      submitFormData.append('taxPayerId', formData.taxPayerId || '');
      submitFormData.append('description', formData.description || '');
      submitFormData.append('contactInfo', JSON.stringify(formData.contactInfo || {}));
      
      // Add files
      if (files.imageStore) {
        submitFormData.append('imageStore', files.imageStore);
      }
      
      if (files.certIncorp) {
        submitFormData.append('certIncorp', files.certIncorp);
      }
      
      if (files.imageIdCard) {
        submitFormData.append('imageIdCard', files.imageIdCard);
      }
      
      const success = await verifyUser(session.user.id, submitFormData);
      
      if (success) {
        alert("ส่งเอกสารเรียบร้อยแล้ว กรุณารอการตรวจสอบ");
        router.push("/profile");
      } else {
        throw new Error("เกิดข้อผิดพลาดในการส่งเอกสาร กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งเอกสาร กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || userLoading || status === "loading") {
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

          {/* Debug information - remove in production */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
            <p>Session user: {session?.user?.id || 'Not authenticated'}</p>
            <p>Current user: {currentUser ? JSON.stringify(currentUser.id) : 'Not loaded'}</p>
            <p>Verification status: {verificationStatus}</p>
          </div>

          <VerificationStatusBox status={verificationStatus} />

          {/* Only show form if user hasn't submitted verification yet */}
          {verificationStatus === "not_started" && (
            <VerificationForm 
              initialData={{ email: session?.user?.email || "" }}
              onSubmit={handleFormSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Page component that wraps the content with UserProvider
export default function VerifyPage() {
  return (
    <UserProvider>
      <VerifyPageContent />
    </UserProvider>
  );
} 