"use client";

import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
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
import { faCheck, faTimes, faEye, faEyeSlash, faUser, faEnvelope, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import useShowDialog from "@/hooks/useShowDialog";  
import StatusDialog from "@/components/common/StatusDialog";
import { signIn } from "next-auth/react";
import { FormLabel } from "../ui/form-label";

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpToken, setOtpToken] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [refNumber, setRefNumber] = useState<string>("");
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [cooldownTimer, setCooldownTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Use the dialog hook
  const {
    showSuccessDialog,
    setShowSuccessDialog,
    showErrorDialog,
    setShowErrorDialog,
    successMessage,
    errorMessage,
    displaySuccessDialog,
    displayErrorDialog,
  } = useShowDialog();

  const handleOtpChange = (index: number, value: string): void => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
  };

  const validateForm = (): boolean => {
    try {
      // Check if all password requirements are met
      const allPasswordRequirementsMet =
        passwordValidation.hasMinLength &&
        passwordValidation.hasUppercase &&
        passwordValidation.hasLowercase &&
        passwordValidation.hasNumber;

      // Proceed with schema validation
      registrationSchema.parse({
        displayName,
        email,
        password,
        confirmPassword,
        acceptedTerms,
      });
      
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
          displayErrorDialog(errors.acceptedTerms);
        }
      }
      return false;
    }
  };

  const validateOtp = (): boolean => {
    try {
      console.log(otpValues.join(""));
      otpSchema.parse(otpValues.join(""));

      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        displayErrorDialog(err.errors[0]?.message || "OTP ไม่ถูกต้อง");
      }
      return false;
    }
  };

  const handleDisplayNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // Reset displayName-specific error when typing
    if (fieldErrors.displayName) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.displayName;
        return newErrors;
      });
    }

    // Reset general error
    if (error) {
      setError("");
    }

    setDisplayName(e.target.value);
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

    setConfirmPassword(newConfirmPassword);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    // Start loading state for the submit button
    setIsSendingOtp(true);

    try{
       // Call your authentication service
       const response = await fetch(`api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          email,
          password
        }),
      });

      if(response.ok){  
        const { data } = await response.json();
        setRefNumber(data.refNumber);
        setOtpToken(data.otpToken);
        
        // Show success dialog first, then open OTP modal
        displaySuccessDialog({
          message: "ส่งข้อมูลการสมัครสมาชิกสำเร็จ! กรุณายืนยัน OTP",
          title: "ส่งข้อมูลสำเร็จ",
          buttonText: "ยืนยัน OTP",
          onButtonClick: () => {
            setShowOtpModal(true);
          }
        });
      } else {
        const errorData = await response.json();
        displayErrorDialog(errorData.message || "อีเมลนี้มีผู้ใช้งานแล้ว");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      displayErrorDialog("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (): Promise<void> => {
    if (!validateOtp()) {
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Call your authentication service
      const response = await fetch(`/api/user/register/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otpCode: otpValues.join(""),
          otpToken: otpToken,
        }),
      });

      if (response.ok) {
        // Close OTP modal
        setShowOtpModal(false);
        // Clear any existing cooldown timer when closing modal
        if (cooldownTimer) {
          clearInterval(cooldownTimer);
          setCooldownTimer(null);
        }
        
        // Show success dialog
        displaySuccessDialog({
          message: "สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบอัตโนมัติ",
          title: "สมัครสมาชิกสำเร็จ",
          buttonText: "ไปที่หน้าโปรไฟล์",
          onButtonClick: () => router.push("/")
        });
        
        try {
          // Automatically log in the user with the credentials they just registered with
          const result = await signIn("credentials", {
            email: email,
            password: password,
            redirect: false,
            callbackUrl: "/",
          });
          
          if (result?.error) {
            console.error("Auto login error:", result.error);
            // Still redirect to home page even if auto-login fails
            // User can manually log in
          }
        } catch (loginError) {
          console.error("Error during auto login:", loginError);
        }
      } else {
        const errorData = await response.json();
        displayErrorDialog(errorData.message || "อีเมลนี้มีผู้ใช้งานแล้ว");
      }
    } catch {
      // Ignore the error variable name but handle the error
      displayErrorDialog("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsVerifying(false);
    }
  };

  const startCooldownTimer = () => {
    // Set initial cooldown time (3 minutes = 180 seconds)
    setCooldownSeconds(180);
    
    // Clear any existing timer
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
    }
    
    // Start a new timer that decrements the cooldown every second
    const timer = setInterval(() => {
      setCooldownSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          // When timer reaches 0, clear the interval and allow resending
          clearInterval(timer);
          setCooldownTimer(null);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
    
    // Store the timer ID so we can clear it later if needed
    setCooldownTimer(timer);
    
    // Cleanup function to clear the timer when component unmounts
    return () => {
      if (timer) clearInterval(timer);
    };
  };

  const handleSendOtp = async (): Promise<void> => {
    setIsSendingOtp(true);
    setError("");

    try {
      const response = await fetch(`api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          email,
          password
        }),
      }); 

      const { data } = await response.json();
      setRefNumber(data.refNumber);
      setOtpToken(data.otpToken); 
      setOtpSent(true);
      
      // Start the cooldown timer after successfully sending OTP
      startCooldownTimer();
    } catch {
      // Ignore the error variable name but handle the error
      displayErrorDialog("เกิดข้อผิดพลาดในการส่ง OTP กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCloseOtpModal = (): void => {
    setShowOtpModal(false);
    setOtpValues(["", "", "", "", "", ""]);
    setError("");
    setOtpSent(false);
    
    // Clear any existing cooldown timer when closing modal
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
      setCooldownTimer(null);
      setCooldownSeconds(0);
    }
  };

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (cooldownTimer) {
        clearInterval(cooldownTimer);
      }
    };
  }, [cooldownTimer]);

  return (
    <>
      <StatusDialog
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        type="success"
        title="สมัครสมาชิกสำเร็จ"
        message={successMessage}
        buttonText="ไปที่หน้าโปรไฟล์"
        onButtonClick={() => router.push("/")}
      />

      <StatusDialog
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        type="error"
        message={errorMessage}
      />

      <TermsModal
        showTerms={showTerms}
        setShowTerms={setShowTerms}
        setAcceptedTerms={setAcceptedTerms}
      />

      {showOtpModal && (
        <OtpModal
          email={email}
          refNumber={refNumber} 
          otpValues={otpValues}
          error={error}
          isVerifying={isVerifying}
          isSendingOtp={isSendingOtp}
          otpSent={otpSent}
          onOtpChange={handleOtpChange}
          onVerify={handleVerifyOtp}
          onClose={handleCloseOtpModal}
          onSendOtp={handleSendOtp}
          cooldownSeconds={cooldownSeconds}
        />
      )}

      {/* Form content */}
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
              <FormLabel htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">  
                ชื่อผู้ใช้งาน
              </FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                </div>
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="กรอกชื่อผู้ใช้งานของคุณ"
                  value={displayName}
                  onChange={handleDisplayNameChange}
                  className={`pl-10 ${fieldErrors.displayName ? "ring-2 ring-red-500" : ""}`}
                />
              </div>
              {fieldErrors.displayName && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.displayName}</p>
              )}
            </div>

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

            <div>
              <FormLabel htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน
              </FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={password}
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

              {/* Password requirements */}
              {(
                <div className="mt-2 mb-4 p-3 bg-gray-50 rounded-md border text-sm space-y-2">
                  <h4 className="font-medium text-gray-700">รหัสผ่านต้องประกอบด้วย :</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <FontAwesomeIcon
                        icon={passwordValidation.hasMinLength ? faCheck : faTimes}
                        className={`mr-2 ${passwordValidation.hasMinLength ? "text-green-500" : "text-red-500"
                          }`}
                      />
                      <span>อย่างน้อย 8 ตัวอักษร</span>
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon
                        icon={passwordValidation.hasUppercase ? faCheck : faTimes}
                        className={`mr-2 ${passwordValidation.hasUppercase ? "text-green-500" : "text-red-500"
                          }`}
                      />
                      <span>ตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว</span>
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon
                        icon={passwordValidation.hasLowercase ? faCheck : faTimes}
                        className={`mr-2 ${passwordValidation.hasLowercase ? "text-green-500" : "text-red-500"
                          }`}
                      />
                      <span>ตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว</span>
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon
                        icon={passwordValidation.hasNumber ? faCheck : faTimes}
                        className={`mr-2 ${passwordValidation.hasNumber ? "text-green-500" : "text-red-500"
                          }`}
                      />
                      <span>ตัวเลขอย่างน้อย 1 ตัว</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <FormLabel htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                ยืนยันรหัสผ่าน
              </FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <FontAwesomeIcon icon={faLockOpen} className="w-5 h-5" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`pl-10 ${fieldErrors.confirmPassword ? "ring-2 ring-red-500" : ""}`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                className="cursor-pointer"
                onCheckedChange={(checked: boolean | "indeterminate") => setAcceptedTerms(checked === true)}
              />
              <FormLabel
                htmlFor="terms"
                className="text-sm text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span className="cursor-pointer">ฉันยอมรับ</span>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowTerms(true)}
                  className="h-auto p-0 text-blue-600 hover:text-blue-500 underline cursor-pointer"
                >
                  ข้อกำหนดและเงื่อนไขการใช้งาน
                </Button>
              </FormLabel>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              disabled={!acceptedTerms || isSendingOtp}
              className="w-full cursor-pointer flex items-center justify-center gap-2"
            >
              {isSendingOtp ? (
                <Spinner />
              ) : null}
              {isSendingOtp ? "กำลังส่งข้อมูล..." : "สมัครสมาชิก"} 
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
} 