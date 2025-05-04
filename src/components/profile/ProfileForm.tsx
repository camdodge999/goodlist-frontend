import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, ProfileFormSchema } from "@/validators/profile.schema";

interface ProfileFormProps {
  initialData: ProfileFormSchema;
  isEditing: boolean;
  canChangeEmail: boolean;
  lastEmailChange: Date | null;
  emailError: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveProfile: () => Promise<void>;
  onEditToggle: () => void;
  previewImage: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function ProfileForm({
  initialData,
  isEditing,
  canChangeEmail,
  lastEmailChange,
  emailError,
  onInputChange,
  onImageChange,
  onSaveProfile,
  onEditToggle,
  previewImage,
  fileInputRef
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData
  });

  const handleFormSubmit = async (data: ProfileFormSchema) => {
    await onSaveProfile();
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลส่วนตัว</h3>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="mb-6">
          <div className="flex items-center">
            <div className="mr-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">
                    {initialData.name ? initialData.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              )}
            </div>
            {isEditing && (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  เปลี่ยนรูปโปรไฟล์
                </button>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={onImageChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              ชื่อ
            </label>
            <input
              type="text"
              id="name"
              className={`mt-1 block w-full rounded-md border ${
                errors.name ? "border-red-300" : "border-gray-300"
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              disabled={!isEditing}
              {...register("name")}
              onChange={onInputChange}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              อีเมล
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                className={`mt-1 block w-full rounded-md border ${
                  emailError || errors.email ? "border-red-300" : "border-gray-300"
                } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                disabled={!isEditing || !canChangeEmail}
                {...register("email")}
                onChange={onInputChange}
              />
              {!canChangeEmail && lastEmailChange && (
                <div className="mt-1 text-xs text-gray-500">
                  คุณได้เปลี่ยนอีเมลล่าสุดเมื่อวันที่{" "}
                  {formatDate(lastEmailChange)} สามารถเปลี่ยนอีเมลได้อีกครั้งหลังจาก 1 เดือน
                </div>
              )}
              {(emailError || errors.email) && (
                <p className="mt-1 text-sm text-red-600">{emailError || errors.email?.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              id="phone"
              className={`mt-1 block w-full rounded-md border ${
                errors.phone ? "border-red-300" : "border-gray-300"
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              disabled={!isEditing}
              {...register("phone")}
              onChange={onInputChange}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              ที่อยู่
            </label>
            <textarea
              id="address"
              rows={3}
              className={`mt-1 block w-full rounded-md border ${
                errors.address ? "border-red-300" : "border-gray-300"
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              disabled={!isEditing}
              {...register("address")}
              onChange={onInputChange}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          {isEditing ? (
            <>
              <button
                type="button"
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={onEditToggle}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                บันทึก
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onEditToggle}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              แก้ไข
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 