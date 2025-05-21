"use client";

import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useReactActionState, getFieldError } from "@/utils/forms/useReactActionState";
import { FormLabel } from "@/components/ui/form-label";
import useShowDialog from "@/hooks/useShowDialog";  
import StatusDialog from "@/components/common/StatusDialog";

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [email, setEmail] = useState<string>("");
  const [action, setAction] = useState<any>(null);
  
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

  // Use the server action state hook with React's useActionState
  const { 
    execute, 
    isPending, 
    errors, 
    errorMessage: actionErrorMessage,
    successMessage: actionSuccessMessage
  } = useReactActionState(action || (async () => ({ status: "error", message: "Action not loaded" })), {
    onSuccess: () => {
      displaySuccessDialog({
        title: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว",
        message: actionSuccessMessage || `เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมล ${email} กรุณาตรวจสอบกล่องข้อความของคุณ`,
        buttonText: "ตกลง",
        onButtonClick: () => {
          shouldCallSuccessRef.current = true;
        }
      });
    },
    onError: () => {
      displayErrorDialog(actionErrorMessage || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  });

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!action) return;
    
    // Create FormData object from the form
    const formData = new FormData(e.currentTarget);
    
    // Execute the server action
    await execute(formData);
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
                className={`pl-10 ${getFieldError("email", errors) ? "ring-2 ring-red-500" : ""}`}
              />
            </div>
            {getFieldError("email", errors) && (
              <p className="mt-1 text-sm text-red-500">{getFieldError("email", errors)}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isPending || !action} 
            variant="primary"
            className="w-full cursor-pointer"
          >
            {isPending && <Spinner className="mr-2" />}
            {isPending ? "กำลังส่งคำขอ..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
          </Button>
        </form>
      </motion.div>
    </>
  );
} 