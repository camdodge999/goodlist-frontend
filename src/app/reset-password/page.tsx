"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import ResetPasswordSuccess from "@/components/auth/ResetPasswordSuccess";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-cover bg-center z-0"></div>
      <div className="absolute inset-0 bg-blue-900 opacity-40 z-10"></div>
      
      {success ? (
        <ResetPasswordSuccess onBackToLogin={handleBackToLogin} />
      ) : (
        <ResetPasswordForm onSuccess={handleSuccess} />
      )}
    </div>
  );
} 