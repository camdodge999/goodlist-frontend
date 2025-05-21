"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUser, UserProvider } from "@/contexts/UserContext";
import { useStore, StoreProvider } from "@/contexts/StoreContext";
import useShowDialog from "@/hooks/useShowDialog";
import StatusDialog from "@/components/common/StatusDialog";

// Components
import VerificationStatusBox from "@/components/verify/VerificationStatusBox";
import VerificationForm from "@/components/verify/VerificationForm";

// Types
import { VerificationFormSchema } from "@/validators/verify.schema";

// Client component that uses UserContext
function VerifyPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { currentUser, fetchUserProfile, getVerificationStatus, isLoading: userLoading, userStores } = useUser();
  const { addStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [saveFormData, setSaveFormData] = useState<VerificationFormSchema | null>(null);
  const [savedFiles, setSavedFiles] = useState<{
    imageStore: File | null;
    certIncrop: File | null;
    imageIdCard: File | null;
  } | null>(null);
  const initialFetchComplete = useRef(false);
  const {
    showSuccessDialog,
    setShowSuccessDialog,
    successMessage,
    successTitle,
    successButtonText,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage,
    errorTitle,
    errorButtonText,
    displaySuccessDialog,
    displayErrorDialog,
    handleSuccessClose,
    handleErrorClose,
  } = useShowDialog();

  // Initialize user data when component mounts or session changes
  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Only fetch user profile if authenticated and not already fetched
    if (status === "authenticated" && session?.user?.id && !initialFetchComplete.current) {
      // Set initialFetchComplete immediately to prevent double fetches
      initialFetchComplete.current = true;
      fetchUserProfile(session.user.id);
    }
  }, [status, session, router, fetchUserProfile]);

  const handleFormSubmit = async (
    formData: VerificationFormSchema,
    files: {
      imageStore: File | null;
      certIncrop: File | null;
      imageIdCard: File | null
    }
  ) => {
    // Save form data in case submission fails
    setSaveFormData(formData);
    setSavedFiles(files);
    
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

      if (files.certIncrop) {
        submitFormData.append('certIncrop', files.certIncrop);
      }

      if (files.imageIdCard) {
        submitFormData.append('imageIdCard', files.imageIdCard);
      }

      // Create a new store with the verification data
      // We use any type since we're sending FormData instead of a regular Store object
      const storeResult = await addStore(submitFormData as any);

      if (storeResult) {
        // Clear saved form data on success
        setSaveFormData(null);
        setSavedFiles(null);
        
        displaySuccessDialog({
          message: "ส่งเอกสารเรียบร้อยแล้ว กรุณารอการตรวจสอบ",
          onButtonClick: () => router.push("/profile")
        });
      } else {
        throw new Error("เกิดข้อผิดพลาดในการสร้างร้านค้า กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      displayErrorDialog({
        message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งเอกสาร กรุณาลองใหม่อีกครั้ง",
        buttonText: "ลองใหม่"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading || status === "loading") {
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

          {/* Debug information - remove in production
          <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
            <p>Session user: {session?.user?.id || 'Not authenticated'}</p>
            <p>Current user: {currentUser ? JSON.stringify(currentUser.id) : 'Not loaded'}</p>
            <p>Verification status: {verificationStatus}</p>
          </div> */}

          <VerificationStatusBox status={userStores.length > 0 ? "verified" : verificationStatus} />

          {/* Always show form if user hasn't been verified yet */}
          {verificationStatus === "not_started" && (
            <>
              {isLoading && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-blue-700">กำลังส่งข้อมูลการยืนยันตัวตน...</p>
                  </div>
                </div>
              )}
              
              <VerificationForm
                initialData={saveFormData || { email: session?.user?.email || "" }}
                savedFiles={savedFiles}
                onSubmit={handleFormSubmit}
                isSubmitting={isLoading}
              />
            </>
          )}

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
      </div>
    </div>
  );
}

// Page component that wraps the content with UserProvider
export default function VerifyPage() {
  return (
    <StoreProvider>
      <UserProvider>
        <VerifyPageContent />
      </UserProvider>
    </StoreProvider>
  );
} 