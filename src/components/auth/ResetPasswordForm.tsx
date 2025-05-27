"use client";

import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { faEnvelope, faLock, faLockOpen, faEye, faEyeSlash, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormLabel } from "@/components/ui/form-label";
import useShowDialog from "@/hooks/useShowDialog";  
import StatusDialog from "@/components/common/StatusDialog";
import { ZodError } from "zod";
import { emailSchema, passwordSchema } from "@/validators/user.schema";

interface ResetPasswordFormProps {
  onSuccess: () => void;
  token?: string; // Optional token for password reset verification
}

export default function ResetPasswordForm({ onSuccess, token }: ResetPasswordFormProps) {
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [step] = useState<'email' | 'password'>(token ? 'password' : 'email');
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  });
  
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

  const validateEmailForm = (): boolean => {
    try {
      // Validate the email using zod schema
      emailSchema.parse(email);
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setFieldErrors({ email: err.errors[0]?.message || "อีเมลไม่ถูกต้อง" });
      }
      return false;
    }
  };

  const validatePasswordForm = (): boolean => {
    try {
      // Check if all password requirements are met
      const allPasswordRequirementsMet =
        passwordValidation.hasMinLength &&
        passwordValidation.hasUppercase &&
        passwordValidation.hasLowercase &&
        passwordValidation.hasNumber;

      // Validate password using zod schema
      passwordSchema.parse(newPassword);
      
      // If password requirements are not met, don't proceed with form validation
      if (newPassword && !allPasswordRequirementsMet) {
        const errors: Record<string, string> = {};

        if (!passwordValidation.hasMinLength) {
          errors.newPassword = "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
        } else if (!passwordValidation.hasUppercase) {
          errors.newPassword = "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว";
        } else if (!passwordValidation.hasLowercase) {
          errors.newPassword = "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว";
        } else if (!passwordValidation.hasNumber) {
          errors.newPassword = "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
        }

        setFieldErrors(errors);
        return false;
      }

      // Check if passwords match
      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        setFieldErrors({ confirmPassword: "รหัสผ่านไม่ตรงกัน" });
        return false;
      }

      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setFieldErrors({ newPassword: err.errors[0]?.message || "รหัสผ่านไม่ถูกต้อง" });
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

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const password = e.target.value;

    // Reset password-specific error when typing
    if (fieldErrors.newPassword) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.newPassword;
        return newErrors;
      });
    }

    // Validate password in real-time
    setPasswordValidation({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    });

    setNewPassword(password);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const confirmPwd = e.target.value;

    // Reset confirm password-specific error when typing
    if (fieldErrors.confirmPassword) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }

    setConfirmPassword(confirmPwd);
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateEmailForm()) {
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

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the set new password API endpoint
      const response = await fetch('/api/user/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          newPassword,
          confirmPassword 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        displaySuccessDialog({
          title: "เปลี่ยนรหัสผ่านสำเร็จ",
          message: "รหัสผ่านของคุณได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
          buttonText: "ไปหน้าเข้าสู่ระบบ",
          onButtonClick: () => {
            shouldCallSuccessRef.current = true;
          }
        });
      } else {
        displayErrorDialog(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Set new password error:", error);
      displayErrorDialog("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
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
  );

  const renderPasswordStep = () => (
    <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
      <div className="space-y-4">
        <div>
          <FormLabel htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            รหัสผ่านใหม่
          </FormLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
            </div>
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="กรอกรหัสผ่านใหม่"
              value={newPassword}
              onChange={handlePasswordChange}
              className={`pl-10 pr-10 ${fieldErrors.newPassword ? "ring-2 ring-red-500" : ""}`}
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
          <div className="mt-2 mb-4 p-3 bg-gray-50 rounded-md border text-sm space-y-2">
            <h4 className="font-medium text-gray-700">รหัสผ่านต้องประกอบด้วย :</h4>
            <ul className="space-y-1">
              <li className="flex items-center">
                <FontAwesomeIcon
                  icon={passwordValidation.hasMinLength ? faCheck : faTimes}
                  className={`mr-2 ${passwordValidation.hasMinLength ? "text-green-500" : "text-red-500"}`}
                />
                <span>อย่างน้อย 8 ตัวอักษร</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon
                  icon={passwordValidation.hasUppercase ? faCheck : faTimes}
                  className={`mr-2 ${passwordValidation.hasUppercase ? "text-green-500" : "text-red-500"}`}
                />
                <span>ตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon
                  icon={passwordValidation.hasLowercase ? faCheck : faTimes}
                  className={`mr-2 ${passwordValidation.hasLowercase ? "text-green-500" : "text-red-500"}`}
                />
                <span>ตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon
                  icon={passwordValidation.hasNumber ? faCheck : faTimes}
                  className={`mr-2 ${passwordValidation.hasNumber ? "text-green-500" : "text-red-500"}`}
                />
                <span>ตัวเลขอย่างน้อย 1 ตัว</span>
              </li>
            </ul>
          </div>

          {fieldErrors.newPassword && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.newPassword}</p>
          )}
        </div>

        <div>
          <FormLabel htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            ยืนยันรหัสผ่านใหม่
          </FormLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FontAwesomeIcon icon={faLockOpen} className="w-5 h-5" />
            </div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`pl-10 pr-10 ${fieldErrors.confirmPassword ? "ring-2 ring-red-500" : ""}`}
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
            <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading} 
        variant="primary"
        className="w-full cursor-pointer"
      >
        {isLoading && <Spinner className="mr-2" />}
        {isLoading ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
      </Button>
    </form>
  );

  return (
    <>
      <StatusDialog 
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        type="success"
        title={step === 'email' ? "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว" : "เปลี่ยนรหัสผ่านสำเร็จ"}
        message={successMessage}
        buttonText={step === 'email' ? "ตกลง" : "ไปหน้าเข้าสู่ระบบ"}
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
            {step === 'email' ? 'รีเซ็ตรหัสผ่าน' : 'ตั้งรหัสผ่านใหม่'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email' ? (
              <>
                กรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน หรือ{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </>
            ) : (
              <>
                กรอกรหัสผ่านใหม่ของคุณ หรือ{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </>
            )}
          </p>
        </div>
        
        {step === 'email' ? renderEmailStep() : renderPasswordStep()}
      </motion.div>
    </>
  );
} 