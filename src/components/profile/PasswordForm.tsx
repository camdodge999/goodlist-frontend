import React, { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordFormSchema, passwordFormSchema } from "@/validators/profile.schema";
import { FormLabel } from "../ui/form-label";
import { useUser } from "@/contexts/UserContext";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
            <Input
              type="password"
              id="newPassword"
              name="newPassword"
              className="mt-1"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="กรอกรหัสผ่านใหม่"
            />
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