import React, { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordFormSchema, passwordFormSchema } from "@/validators/profile.schema";
import { FormLabel } from "../ui/form-label";
import { useUser } from "@/contexts/UserContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface PasswordFormProps {
  isEditing: boolean;
  passwordError: string;
  isChangingPassword: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: () => Promise<void>;
  initialData: PasswordFormSchema;
  userId: string;
}

export default function PasswordForm({
  isEditing,
  passwordError,
  isChangingPassword,
  onPasswordChange,
  onChangePassword,
  initialData,
  userId
}: PasswordFormProps) {
  const { changeUserPassword } = useUser();
  const [formData, setFormData] = useState<PasswordFormSchema>(initialData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  });
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If this is the new password field, validate it in real-time
    if (name === 'newPassword') {
      setPasswordValidation({
        hasMinLength: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value)
      });
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // Also call the parent handler
    onPasswordChange(e);
  };

  const validateForm = (): boolean => {
    // Check if all password requirements are met for new password
    const allPasswordRequirementsMet =
      passwordValidation.hasMinLength &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasLowercase &&
      passwordValidation.hasNumber;

    // If new password requirements are not met, show specific error
    if (formData.newPassword && !allPasswordRequirementsMet) {
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

      setValidationErrors(errors);
      return false;
    }

    // Check if passwords match
    if (formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      setValidationErrors({ confirmPassword: "รหัสผ่านไม่ตรงกัน" });
      return false;
    }

    const result = passwordFormSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setValidationErrors(errors);
      return false;
    }
    
    setValidationErrors({});
    return true;
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await changeUserPassword(
        userId,
        formData.oldPassword,
        formData.newPassword,
        formData.confirmPassword
      );
      
      if (result) {
        // Reset form on success
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        
        // Call the parent success handler
        await onChangePassword();
      }
    } catch (error) {
      console.error("Error changing password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">เปลี่ยนรหัสผ่าน</h3>
      <form onSubmit={handleFormSubmit}>
        {passwordError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{passwordError}</span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <FormLabel
              htmlFor="oldPassword"
              className="block text-sm font-medium text-gray-700"
            >
              รหัสผ่านปัจจุบัน
            </FormLabel>
            <Input
              type="password"
              id="oldPassword"
              name="oldPassword"
              className="mt-1"
              value={formData.oldPassword}
              onChange={handleInputChange}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
            />
            {validationErrors.oldPassword && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.oldPassword}</p>
            )}
          </div>

          <div>
            <FormLabel
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              รหัสผ่านใหม่
            </FormLabel>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                className="mt-1 pr-10"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="กรอกรหัสผ่านใหม่"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} className="w-5 h-5" />
              </button>
            </div>
            
            {/* Password requirements */}
            {formData.newPassword && (
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
            )}
            
            {validationErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
            )}
          </div>

          <div>
            <FormLabel
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              ยืนยันรหัสผ่านใหม่
            </FormLabel>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="mt-1"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="ยืนยันรหัสผ่านใหม่"
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isChangingPassword || isSubmitting}
          >
            {(isChangingPassword || isSubmitting) ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
          </Button>
        </div>
      </form>
    </div>
  );
} 