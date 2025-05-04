import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordFormSchema, PasswordFormSchema } from "@/validators/profile.schema";

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
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PasswordFormSchema>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: initialData
  });

  const handleFormSubmit = async (data: PasswordFormSchema) => {
    await onChangePassword();
  };

  if (!isEditing) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">เปลี่ยนรหัสผ่าน</h3>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {passwordError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{passwordError}</span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label
              htmlFor="oldPassword"
              className="block text-sm font-medium text-gray-700"
            >
              รหัสผ่านปัจจุบัน
            </label>
            <input
              type="password"
              id="oldPassword"
              className={`mt-1 block w-full rounded-md border ${
                errors.oldPassword ? "border-red-300" : "border-gray-300"
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              {...register("oldPassword")}
              onChange={onPasswordChange}
            />
            {errors.oldPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.oldPassword.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              id="newPassword"
              className={`mt-1 block w-full rounded-md border ${
                errors.newPassword ? "border-red-300" : "border-gray-300"
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              {...register("newPassword")}
              onChange={onPasswordChange}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={`mt-1 block w-full rounded-md border ${
                errors.confirmPassword ? "border-red-300" : "border-gray-300"
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              {...register("confirmPassword")}
              onChange={onPasswordChange}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
          </button>
        </div>
      </form>
    </div>
  );
} 