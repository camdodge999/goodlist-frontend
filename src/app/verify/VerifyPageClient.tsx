"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useUser } from "@/contexts/UserContext";
import { useStore } from "@/contexts/StoreContext";
import useShowDialog from "@/hooks/useShowDialog";
import StatusDialog from "@/components/common/StatusDialog";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";  
import "dayjs/locale/th";
dayjs.locale("th");

// Components
import VerificationStatusBox from "@/components/verify/VerificationStatusBox";
import VerificationForm from "@/components/verify/VerificationForm";

// Types
import { VerificationFormSchema } from "@/validators/verify.schema";
import { Store } from "@/types/stores";

interface VerifyPageClientProps {
  session: Session;
}

export default function VerifyPageClient({ session: serverSession }: VerifyPageClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { fetchUserProfile, isLoading: userLoading, userStores } = useUser();
  const { addStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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

  // Use server session or client session, preferring server session for immediate availability
  const activeSession = serverSession || session;

  // Initialize user data when component mounts or session changes
  useEffect(() => {
    // Redirect to login if not authenticated (fallback check)
    if (status === "unauthenticated" && !serverSession) {
      router.push("/login");
      return;
    }

    // Only fetch user profile if authenticated and not already fetched
    if (activeSession?.user?.id && !initialFetchComplete.current) {
      // Set initialFetchComplete immediately to prevent double fetches
      initialFetchComplete.current = true;
      fetchUserProfile(activeSession.user.id);
    }
  }, [status, activeSession, router, serverSession]);

  // Get the oldest store (first store created)
  const getOldestStore = (): Store | null => {
    if (userStores.length === 0) return null;
    
    // Sort stores by createdAt to get the oldest one
    const sortedStores = [...userStores].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return sortedStores[0];
  };

  // Get verification status based on the oldest store
  const getStoreVerificationStatus = (): "not_started" | "pending" | "verified" | "banned" => {
    const oldestStore = getOldestStore();
    
    if (!oldestStore) {
      return "not_started";
    }
    
    // Check if store is banned
    if (oldestStore.isBanned) {
      return "banned";
    }
    
    // Check verification status
    if (oldestStore.isVerified === true) {
      return "verified";
    } else if (oldestStore.isVerified === false) {
      return "banned"; // Store didn't pass verification
    } else {
      return "pending"; // isVerified is null, waiting for verification
    }
  };

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
      if (!activeSession?.user?.id) {
        throw new Error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง");
      }

      setIsLoading(true);

      // Create FormData object to send files
      const submitFormData = new FormData();

      // Add form fields - ensure all values are strings
      submitFormData.append('userId', activeSession.user.id.toString());
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
      const storeResult = await addStore(submitFormData as unknown as FormData);

      if (storeResult) {
        // Clear saved form data on success
        setSaveFormData(null);
        setSavedFiles(null);
        setShowForm(false);
        
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

  const handleAddAnotherStore = () => {
    setShowForm(true);
  };

  // Optimize loading state - only show loading if we don't have server session and client session is still loading
  if (userLoading || (!serverSession && status === "loading")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const storeVerificationStatus = getStoreVerificationStatus();
  const oldestStore = getOldestStore();

  return (
    <div className="min-h-[calc(100vh-100px)] bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            ยืนยันตัวตนร้านค้า
          </h1>

          <VerificationStatusBox status={storeVerificationStatus} />

          {/* Show form when no stores exist or when user clicks add another store */}
          {(storeVerificationStatus === "not_started" || showForm) && (
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
                initialData={saveFormData || { email: activeSession?.user?.email || "" }}
                savedFiles={savedFiles}
                onSubmit={handleFormSubmit}
                isSubmitting={isLoading}
              />
            </>
          )}

          {/* Show add another store button for verified stores */}
          {storeVerificationStatus === "verified" && !showForm && (
            <div className="mt-6">
              <Button
                onClick={handleAddAnotherStore}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                เพิ่มร้านค้าใหม่
              </Button>
              
              {oldestStore && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    ร้านค้าที่ได้รับการยืนยันแล้ว
                  </h3>
                  <p className="text-sm text-green-700">
                    <strong>{oldestStore.storeName}</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ยืนยันเมื่อ: {oldestStore.verifiedAt ? dayjs(oldestStore.verifiedAt).format('DD/MM/YYYY') : 'ไม่ระบุ'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Show information for pending stores */}
          {storeVerificationStatus === "pending" && !showForm && oldestStore && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                ร้านค้าที่รอการตรวจสอบ
              </h3>
              <p className="text-sm text-yellow-700">
                <strong>{oldestStore.storeName}</strong>
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                ส่งเอกสารเมื่อ: {dayjs(oldestStore.createdAt).format('DD/MM/YYYY')}
              </p>
            </div>
          )}

          {/* Show information for banned/rejected stores */}
          {storeVerificationStatus === "banned" && !showForm && oldestStore && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                ร้านค้าที่ไม่ผ่านการตรวจสอบ
              </h3>
              <p className="text-sm text-red-700">
                <strong>{oldestStore.storeName}</strong>
              </p>
              {oldestStore.rejectionReason && (
                <p className="text-xs text-red-600 mt-1">
                  เหตุผล: {oldestStore.rejectionReason}
                </p>
              )}
              <div className="mt-3">
                <Button
                  onClick={handleAddAnotherStore}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  size="sm"
                >
                  ส่งเอกสารใหม่
                </Button>
              </div>
            </div>
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