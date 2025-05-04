"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Components
import VerificationStatusBox from "@/components/verify/VerificationStatusBox";
import VerificationForm from "@/components/verify/VerificationForm";

// Types
import { Store } from "@/types/stores";

export default function VerifyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsLoading(false);
  }, [user, router]);

  const getVerificationStatus = () => {
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

  const handleFormSubmit = async () => {
    try {
      // In a real app, you would upload files to a server
      // and create a store record with the verification status
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert("ส่งเอกสารเรียบร้อยแล้ว กรุณารอการตรวจสอบ");
      router.push("/profile");
    } catch {
      throw new Error("เกิดข้อผิดพลาดในการส่งเอกสาร กรุณาลองใหม่อีกครั้ง");
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
            <VerificationForm 
              initialData={{ email: user?.email || "" }}
              onSubmit={handleFormSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
} 