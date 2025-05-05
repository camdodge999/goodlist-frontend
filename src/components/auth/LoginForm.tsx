"use client";

import { useState, FormEvent, type JSX, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoginFormValues, loginSchema } from "@/validators/user.schema";
import { ZodError } from "zod";
import { signIn } from "next-auth/react";
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
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formInput); 
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
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formInput.email,
        password: formInput.password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setShowErrorDialog(true);
      } else if (result?.ok) {
        setSuccessMessage("เข้าสู่ระบบสำเร็จ");
        setShowSuccessDialog(true);
        // Router will redirect after dialog is closed
      }
    } catch (err) {
      setErrorMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
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
    
    // Reset general error
    if (error) {
      setError("");
    }
    
    setFormInput({ ...formInput, email: e.target.value });
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // Reset password-specific error when typing
    if (fieldErrors.password) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
    
    // Reset general error
    if (error) {
      setError("");
    }
    
    setFormInput({ ...formInput, password: e.target.value });
  };

  const handleSuccessDialogClose = () => {
    router.push("/profile");
  };

  return (
    <>
      <SuccessDialog 
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        title="เข้าสู่ระบบสำเร็จ"
        message={successMessage}
        buttonText="ไปที่หน้าโปรไฟล์"
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
                  className={`pl-10 ${fieldErrors.email ? "ring-2 ring-red-500" : ""}`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
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
                  className={`pl-10 ${fieldErrors.password ? "ring-2 ring-red-500" : ""}`}
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
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          <div>
            <Button 
              type="submit" 
              disabled={isLoading} 
              variant="primary"
              className="w-full cursor-pointer"
            >
              {isLoading && <Spinner className="mr-2" />}
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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