import React, { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordFormSchema } from "@/validators/profile.schema";
import { FormLabel } from "../ui/form-label";

interface PasswordFormProps {
  isEditing: boolean;
  passwordError: string;
  isChangingPassword: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: () => Promise<void>;
  initialData: PasswordFormSchema;
}

export default function PasswordForm({
  isEditing,
  passwordError,
  isChangingPassword,
  onPasswordChange,
  onChangePassword,
  initialData
}: PasswordFormProps) {
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onChangePassword();
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
              defaultValue={initialData.oldPassword}
              onChange={onPasswordChange}
            />
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
              defaultValue={initialData.newPassword}
              onChange={onPasswordChange}
            />
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
              defaultValue={initialData.confirmPassword}
              onChange={onPasswordChange}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
          </Button>
        </div>
      </form>
    </div>
  );
} 