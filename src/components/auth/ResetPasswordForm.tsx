"use client";

import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormLabel } from "@/components/ui/form-label";
import useShowDialog from "@/hooks/useShowDialog";  
import StatusDialog from "@/components/common/StatusDialog";
import { ZodError } from "zod";
import { emailSchema } from "@/validators/user.schema";

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Use the dialog hook
  const {
    showSuccessDialog,
    setShowSuccessDialog,
    showErrorDialog,
    setShowErrorDialog,
    successMessage,
    errorMessage,
    displaySuccessDialog,
    displayErrorDialog
  } = useShowDialog();

  // Reference to track if we should call onSuccess
  const shouldCallSuccessRef = useRef(false);
  
  // Handle success callback outside of render cycle
  useEffect(() => {
    if (shouldCallSuccessRef.current && !showSuccessDialog) {
      shouldCallSuccessRef.current = false;
      onSuccess();
    }
  }, [onSuccess, showSuccessDialog]);

  const validateForm = (): boolean => {
    try {
      // Validate the email using zod schema
      emailSchema.parse(email);
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as string] = error.message;
          }
        });
        setFieldErrors({ email: err.errors[0]?.message || "อีเมลไม่ถูกต้อง" });
      }
      return false;
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // Reset email-specific error when typing
    if (fieldErrors.email) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
    
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the reset password API endpoint
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        displaySuccessDialog({
          title: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว",
          message: `เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมล ${email} กรุณาตรวจสอบกล่องข้อความของคุณ`,
          buttonText: "ตกลง",
          onButtonClick: () => {
            shouldCallSuccessRef.current = true;
          }
        });
      } else {
        displayErrorDialog(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      displayErrorDialog("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusDialog 
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        type="success"
        title="ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว"
        message={successMessage}
        buttonText="ตกลง"
      />

      <StatusDialog 
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        type="error"
        message={errorMessage}
      />
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl z-50"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            รีเซ็ตรหัสผ่าน
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            กรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน หรือ{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <FormLabel htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </FormLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
              </div>
              <Input
                id="email"
                name="email"
                placeholder="กรอกอีเมลของคุณ"
                value={email}
                onChange={handleEmailChange}
                className={`pl-10 ${fieldErrors.email ? "ring-2 ring-red-500" : ""}`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            variant="primary"
            className="w-full cursor-pointer"
          >
            {isLoading && <Spinner className="mr-2" />}
            {isLoading ? "กำลังส่งคำขอ..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
          </Button>
        </form>
      </motion.div>
    </>
  );
} 