"use client";

import { useState, FormEvent, type JSX, ChangeEvent, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { LoginFormValues, loginSchema } from "@/validators/user.schema";
import Spinner from "@/components/ui/Spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import SuccessDialog from "./SuccessDialog";
import ErrorDialog from "./ErrorDialog";

export default function LoginForm(): JSX.Element {
  const router = useRouter();
  const [formInput, setFormInput] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string> | null>(null);

  // Reference to track if we should navigate
  const shouldNavigateRef = useRef(false);

  // Handle navigation outside of render cycle
  useEffect(() => {
    if (shouldNavigateRef.current) {
      shouldNavigateRef.current = false;
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    }
  }, [router, showSuccessDialog]);

  const validateForm = (): boolean => {
    // Client-side validation using zod
    const result = loginSchema.safeParse(formInput);
    
    if (!result.success) {
      // Format validation errors
      const formattedErrors: Record<string, string> = {};
      
      // Extract the first error message for each field
      result.error.errors.forEach((err) => {
        const field = err.path[0].toString();
        if (!formattedErrors[field]) {
          formattedErrors[field] = err.message;
        }
      });
      
      setErrors(formattedErrors);
      return false;
    }
    
    setErrors(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    try {
      // Reset errors
      setErrors(null);
      
      // Validate form before submitting
      if (!validateForm()) {
        return;
      }
      
      // Start loading state
      setIsPending(true);
      
      // Use NextAuth signIn method with the credentials provider
      const result = await signIn("credentials", {
        email: formInput.email,
        password: formInput.password,
        redirect: false,
      });
      
      // End loading state
      setIsPending(false);
      
      if (result?.error) {
        // Handle NextAuth authentication error
        setErrorMessage(result.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setShowErrorDialog(true);
      } else {
        // Authentication successful
        setSuccessMessage("เข้าสู่ระบบสำเร็จ");
        setShowSuccessDialog(true);
        // Set the flag to navigate on next effect run
        shouldNavigateRef.current = true;
        setTimeout(() => {
          router.push("/profile");
        }, 1000);
      }
    } catch (error) {
      setIsPending(false);
      console.error("Error during form submission:", error);
      setErrorMessage("เกิดข้อผิดพลาดขณะเข้าสู่ระบบ กรุณาลองอีกครั้ง");
      setShowErrorDialog(true);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormInput({ ...formInput, email: e.target.value });
    // Clear error for this field when user types
    if (errors && errors.email) {
      const newErrors = { ...errors };
      delete newErrors.email;
      setErrors(Object.keys(newErrors).length > 0 ? newErrors : null);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormInput({ ...formInput, password: e.target.value });
    // Clear error for this field when user types
    if (errors && errors.password) {
      const newErrors = { ...errors };
      delete newErrors.password;
      setErrors(Object.keys(newErrors).length > 0 ? newErrors : null);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Navigation is handled in the useEffect
  };
  
  // Helper function to get field error
  const getFieldError = (fieldName: string): string | undefined => {
    return errors?.[fieldName];
  };

  return (
    <>
      <SuccessDialog 
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        title="เข้าสู่ระบบสำเร็จ"
        message={successMessage}
        buttonText="ไปที่หน้าโปรไฟล์"
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
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ
          </h2>
          <p
            className="mt-2 text-center text-sm text-gray-600"
          >
            หรือ{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              สมัครสมาชิก
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                </div>
                <Input
                  id="email"
                  name="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={formInput.email}
                  onChange={handleEmailChange}
                  className={`pl-10 ${getFieldError("email") ? "ring-2 ring-red-500" : ""}`}
                />
              </div>
              {getFieldError("email") && (
                <p className="mt-1 text-sm text-red-500">{getFieldError("email")}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={formInput.password}
                  onChange={handlePasswordChange}
                  className={`pl-10 ${getFieldError("password") ? "ring-2 ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-5 h-5" />
                </button>
              </div>
              {getFieldError("password") && (
                <p className="mt-1 text-sm text-red-500">{getFieldError("password")}</p>
              )}
            </div>
          </div>

          <div>
            <Button 
              type="submit" 
              disabled={isPending} 
              variant="primary"
              className="w-full cursor-pointer"
            >
              {isPending && <Spinner className="mr-2" />}
              {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link 
                  href="/reset-password"
                  className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </>
  );
} 