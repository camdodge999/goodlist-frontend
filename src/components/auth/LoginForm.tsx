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
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (result?.ok) {
        router.push("/profile");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl z-50"
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
            <Input
              id="email"
              name="email"
              placeholder="อีเมล"
              value={formInput.email}
              onChange={handleEmailChange}
              className={fieldErrors.email ? "ring-2 ring-red-500" : ""}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="รหัสผ่าน"
                value={formInput.password}
                onChange={handlePasswordChange}
                className={fieldErrors.password ? "ring-2 ring-red-500" : ""}
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

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

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
  );
} 