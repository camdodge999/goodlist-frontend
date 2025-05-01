"use client";

import { useState, type KeyboardEvent, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import OtpModal from "./OtpModal";
import { registrationSchema, otpSchema } from "@/validators/user.schema";
import { ZodError } from "zod";

export default function SignupForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleOtpChange = (index: number, value: string): void => {
    if (value.length > 1) {
      // Handle paste
      const pastedValues = value.split("").slice(0, 6);
      const newOtpValues = [...otpValues];
      pastedValues.forEach((val, i) => {
        if (i < 6) {
          newOtpValues[i] = val;
        }
      });
      setOtpValues(newOtpValues);
      setOtp(newOtpValues.join(""));
      return;
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    setOtp(newOtpValues.join(""));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      // This functionality is now handled by the shadcn ui component
    }
  };

  const validateForm = (): boolean => {
    try {
      registrationSchema.parse({
        email,
        password,
        confirmPassword,
        acceptedTerms,
      });
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
        if (errors.acceptedTerms) {
          setError(errors.acceptedTerms);
        }
      }
      return false;
    }
  };

  const validateOtp = (): boolean => {
    try {
      otpSchema.parse(otp);
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message || "OTP ไม่ถูกต้อง");
      }
      return false;
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setEmail(value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setPassword(value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setConfirmPassword(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setShowOtpModal(true);
  };

  const handleVerifyOtp = async (): Promise<void> => {
    if (!validateOtp()) {
      return;
    }

    if (otp !== "000000") {
      setError("OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const success = await register(email, password);
      if (success) {
        router.push("/profile");
      } else {
        setError("อีเมลนี้มีผู้ใช้งานแล้ว");
      }
    } catch (_) {
      // Ignore the error variable name but handle the error
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendOtp = async (): Promise<void> => {
    setIsSendingOtp(true);
    setError("");

    try {
      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtpSent(true);
    } catch (_) {
      // Ignore the error variable name but handle the error
      setError("เกิดข้อผิดพลาดในการส่ง OTP กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCloseOtpModal = (): void => {
    setShowOtpModal(false);
    setOtp("");
    setOtpValues(["", "", "", "", "", ""]);
    setError("");
    setOtpSent(false);
  };

  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            ข้อกำหนดและเงื่อนไขการใช้งาน
          </h2>
          <button
            onClick={() => setShowTerms(false)}
            aria-label="ปิด"
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        <div className="prose max-w-none text-gray-700 space-y-6">
          {/* Terms content - truncated for brevity */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900">
              เว็บไซต์: Goodlistseller.com
            </h3>
          </div>
          
          {/* Terms sections - truncated */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              การใช้งานเว็บไซต์
            </h3>
            <p className="leading-relaxed">
              ตลอดเว็บไซต์นี้ คำว่า &quot;ผู้ใช้บริการ&quot; หมายถึงบุคคลใด ๆ
              ที่เข้าถึงเว็บไซต์นี้ไม่ว่าด้วยวิธีใดก็ตาม
              การใช้เว็บไซต์นี้ต้องเป็นไปตามข้อกำหนดและเงื่อนไขการใช้งานนี้
              ซึ่งผู้ใช้บริการควรอ่านอย่างละเอียด
              การใช้เว็บไซต์หรือเข้าเยี่ยมชมหน้าใด ๆ
              ถือว่าท่านยอมรับเงื่อนไขทั้งหมดแล้ว
            </p>
          </section>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-4">
              การกดยอมรับหมายถึงผู้ใช้บริการยินยอมตามนโยบาย พ.ร.บ.
              คุ้มครองข้อมูลส่วนบุคคล โดยมีรายละเอียดในลิงค์นี้
            </p>
            <button
              onClick={() => {
                setAcceptedTerms(true);
                setShowTerms(false);
              }}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              ยอมรับข้อกำหนดและเงื่อนไข
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {showTerms && <TermsModal />}
      {showOtpModal && (
        <OtpModal
          email={email}
          otpValues={otpValues}
          error={error}
          isVerifying={isVerifying}
          isSendingOtp={isSendingOtp}
          otpSent={otpSent}
          onOtpChange={handleOtpChange}
          onKeyDown={handleKeyDown}
          onVerify={handleVerifyOtp}
          onClose={handleCloseOtpModal}
          onSendOtp={handleSendOtp}
        />
      )}
      
      {/* Rest of the form content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl"
      >
        <div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center text-3xl font-extrabold text-gray-900"
          >
            สมัครสมาชิก
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-center text-sm text-gray-600"
          >
            หรือ{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              เข้าสู่ระบบ
            </Link>
          </motion.p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="email" className="sr-only">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none relative block w-full px-3 py-2.5 border-0 bg-white/50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 sm:text-sm ${
                  fieldErrors.email ? "ring-2 ring-red-500" : ""
                }`}
                placeholder="อีเมล"
                value={email}
                onChange={handleEmailChange}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="password" className="sr-only">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-2.5 border-0 bg-white/50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 sm:text-sm ${
                  fieldErrors.password ? "ring-2 ring-red-500" : ""
                }`}
                placeholder="รหัสผ่าน"
                value={password}
                onChange={handlePasswordChange}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="confirmPassword" className="sr-only">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-2.5 border-0 bg-white/50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 sm:text-sm ${
                  fieldErrors.confirmPassword ? "ring-2 ring-red-500" : ""
                }`}
                placeholder="ยืนยันรหัสผ่าน"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </motion.div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                ฉันยอมรับ{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  ข้อกำหนดและเงื่อนไขการใช้งาน
                </button>
              </label>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : null}
              {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
} 