"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import ResetPasswordSuccess from "@/components/auth/ResetPasswordSuccess";
import { ResetPasswordFormData } from "@/types/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ResetPasswordFormData>({ email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("รูปแบบอีเมลไม่ถูกต้อง");
        setIsLoading(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would:
      // 1. Call your password reset API
      // 2. Handle the response
      setSuccess(true);
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Navigate to login page
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {success ? (
          <ResetPasswordSuccess onBackToLogin={handleBackToLogin} />
        ) : (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                รีเซ็ตรหัสผ่าน
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                กรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน
              </p>
            </div>
            
            <ResetPasswordForm
              email={formData.email}
              error={error}
              isLoading={isLoading}
              onEmailChange={handleEmailChange}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </div>
    </div>
  );
} 