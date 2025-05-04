"use client";

import { useState, type KeyboardEvent, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import OtpModal from "./OtpModal";
import TermsModal from "./TermsModal";
import { registrationSchema, otpSchema } from "@/validators/user.schema";
import { ZodError } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function SignupForm() {
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
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  });
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validateOTP = (otpCode: string): boolean => {
    // Demo validation - in production this would be a server call
    return otpCode === "000000";
  }

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
      // Check if all password requirements are met
      const allPasswordRequirementsMet = 
        passwordValidation.hasMinLength && 
        passwordValidation.hasUppercase && 
        passwordValidation.hasLowercase && 
        passwordValidation.hasNumber;
      
      // If password requirements are not met, don't proceed with form validation
      if (password && !allPasswordRequirementsMet) {
        const errors: Record<string, string> = {};
        
        if (!passwordValidation.hasMinLength) {
          errors.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
        } else if (!passwordValidation.hasUppercase) {
          errors.password = "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว";
        } else if (!passwordValidation.hasLowercase) {
          errors.password = "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว";
        } else if (!passwordValidation.hasNumber) {
          errors.password = "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
        }
        
        setFieldErrors(errors);
        return false;
      }
      
      // Check if passwords match
      if (password && confirmPassword && password !== confirmPassword) {
        setFieldErrors({ confirmPassword: "รหัสผ่านไม่ตรงกัน" });
        return false;
      }
      
      // Proceed with schema validation
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
      
      // Use our validateOTP helper
      if (!validateOTP(otp)) {
        setError("OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
        return false;
      }
      
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message || "OTP ไม่ถูกต้อง");
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
    
    // Reset general error
    if (error) {
      setError("");
    }
    
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newPassword = e.target.value;
    
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
    
    // Validate password in real-time
    setPasswordValidation({
      hasMinLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword)
    });
    
    setPassword(newPassword);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newConfirmPassword = e.target.value;
    
    // Reset confirm password-specific error when typing
    if (fieldErrors.confirmPassword) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
    
    // Reset general error
    if (error) {
      setError("");
    }
    
    // Check if passwords match in real-time
    if (newConfirmPassword.length > 0) {
      setPasswordsMatch(newConfirmPassword === password);
    } else {
      setPasswordsMatch(null);
    }
    
    setConfirmPassword(newConfirmPassword);
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

    setIsVerifying(true);
    setError("");

    try {
      // Call your authentication service
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
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

  return (
    <>
      <TermsModal 
        showTerms={showTerms}
        setShowTerms={setShowTerms}
        setAcceptedTerms={setAcceptedTerms}
      />
      
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
        transition={{ duration: 0.25 }}
        className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl z-50"
      >
        <div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold text-gray-900"
          >
            สมัครสมาชิก
          </h2>
          <p
            className="mt-2 text-center text-sm text-gray-600"
          >
            หรือ{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                อีเมล
              </label>
              <Input
                id="email"
                name="email"
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
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="รหัสผ่าน"
                  value={password}
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
                
              {/* Password requirements */}
              {(
                <div className="mt-2 mb-4 p-3 bg-gray-50 rounded-md border text-sm space-y-2">
                  <h4 className="font-medium text-gray-700">รหัสผ่านต้องประกอบด้วย :</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <FontAwesomeIcon
                        icon={passwordValidation.hasMinLength ? faCheck : faTimes}
                        className={`mr-2 ${
                          passwordValidation.hasMinLength ? "text-green-500" : "text-red-500"
                        }`}
                      />
                      <span>อย่างน้อย 8 ตัวอักษร</span>
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon
                        icon={passwordValidation.hasUppercase ? faCheck : faTimes}
                        className={`mr-2 ${
                          passwordValidation.hasUppercase ? "text-green-500" : "text-red-500"
                        }`}
                      />
                      <span>ตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว</span>
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon
                        icon={passwordValidation.hasLowercase ? faCheck : faTimes}
                        className={`mr-2 ${
                          passwordValidation.hasLowercase ? "text-green-500" : "text-red-500"
                        }`}
                      />
                      <span>ตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว</span>
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon
                        icon={passwordValidation.hasNumber ? faCheck : faTimes}
                        className={`mr-2 ${
                          passwordValidation.hasNumber ? "text-green-500" : "text-red-500"
                        }`}
                      />
                      <span>ตัวเลขอย่างน้อย 1 ตัว</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่าน"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={fieldErrors.confirmPassword ? "ring-2 ring-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="w-5 h-5" />
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {fieldErrors.confirmPassword}
                </p>
              )}
              
              {/* Password matching indicator */}
              {passwordsMatch !== null && (
                <div className="mt-1 flex items-center text-sm">
                  <FontAwesomeIcon
                    icon={passwordsMatch ? faCheck : faTimes}
                    className={`mr-2 ${
                      passwordsMatch ? "text-green-500" : "text-red-500"
                    }`}
                  />
                  <span className={passwordsMatch ? "text-green-600" : "text-red-500"}>
                    {passwordsMatch ? "รหัสผ่านตรงกัน" : "รหัสผ่านไม่ตรงกัน"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                className="cursor-pointer"
                onCheckedChange={(checked: boolean | "indeterminate") => setAcceptedTerms(checked === true)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                ฉันยอมรับ{" "}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowTerms(true)}
                  className="h-auto p-0 text-blue-600 hover:text-blue-500 underline cursor-pointer"
                >
                  ข้อกำหนดและเงื่อนไขการใช้งาน
                </Button>
              </label>
            </div>
          </div>

          {error && (
            <div
              className="text-red-500 text-sm text-center"
            >
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full cursor-pointer flex items-center justify-center"
            >
              {isLoading ? (
                <Spinner />
              ) : null}
              {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
} 