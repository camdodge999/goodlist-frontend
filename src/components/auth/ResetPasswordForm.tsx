"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { emailSchema } from "@/validators/user.schema";
import { ZodError } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import SuccessDialog from "./SuccessDialog";
import ErrorDialog from "./ErrorDialog";

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [email, setEmail] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validateForm = (): boolean => {
    try {
      emailSchema.parse(email);
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          errors.email = error.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // Reset email-specific error when typing
    if (fieldErrors.email) {
      setFieldErrors({});
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
      // Simulate API call to request password reset
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Show success dialog
      setShowSuccessDialog(true);
    } catch (err) {
      setErrorMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    onSuccess();
  };

  return (
    <>
      <SuccessDialog 
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        title="ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว"
        message={`เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมล ${email} กรุณาตรวจสอบกล่องข้อความของคุณ`}
        buttonText="ตกลง"
        onButtonClick={handleSuccessDialogClose}
      />

      <ErrorDialog 
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        message={errorMessage}
      />
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl z-50"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
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
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="อีเมล"
              value={email}
              onChange={handleEmailChange}
              className={fieldErrors.email ? "ring-2 ring-red-500" : ""}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <Button 
              type="submit" 
              disabled={isLoading} 
              variant="primary"
              className="w-full cursor-pointer"
            >
              {isLoading && <Spinner className="mr-2" />}
              {isLoading ? "กำลังส่งคำขอ..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
} 