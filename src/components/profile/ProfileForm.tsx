import React, { useRef, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormSchema } from "@/validators/profile.schema";

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
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      <form onSubmit={handleFormSubmit}>
        <div className="mb-6">
          <div className="flex items-center">
            <div className="mr-4 relative">
              {previewImage ? (
                <div className="relative group">
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="h-24 w-24 rounded-full object-cover border-2 border-blue-500"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center rounded-full transition-all duration-200">
                      <span className="text-white opacity-0 group-hover:opacity-100">
                        เปลี่ยน
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">
                    {initialData.name ? initialData.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              )}
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 cursor-pointer shadow-md" 
                     onClick={() => fileInputRef.current?.click()}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
            </div>
            {isEditing && (
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 cursor-pointer"
                >
                  เปลี่ยนรูปโปรไฟล์
                </Button>
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
            <Input
              type="text"
              id="name"
              name="name"
              className="mt-1"
              disabled={!isEditing}
              defaultValue={initialData.name}
              onChange={onInputChange}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              อีเมล
            </label>
            <div className="relative">
              <Input
                type="email"
                id="email"
                name="email"
                className="mt-1"
                disabled={!isEditing || !canChangeEmail}
                defaultValue={initialData.email}
                onChange={onInputChange}
              />
              {!canChangeEmail && lastEmailChange && (
                <div className="mt-1 text-xs text-gray-500">
                  คุณได้เปลี่ยนอีเมลล่าสุดเมื่อวันที่{" "}
                  {formatDate(lastEmailChange)} สามารถเปลี่ยนอีเมลได้อีกครั้งหลังจาก 1 เดือน
                </div>
              )}
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
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
            <Input
              type="tel"
              id="phone"
              name="phone"
              className="mt-1"
              disabled={!isEditing}
              defaultValue={initialData.phone}
              onChange={onInputChange}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              ที่อยู่
            </label>
            <Textarea
              id="address"
              name="address"
              rows={3}
              className="mt-1"
              disabled={!isEditing}
              defaultValue={initialData.address}
              onChange={onInputChange}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="mr-3 cursor-pointer"
                onClick={onEditToggle}
              >
                ยกเลิก
              </Button>
              <Button 
                type="submit"
                className="cursor-pointer"
              >
                บันทึก
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onEditToggle}
            >
              แก้ไข
            </Button>
          )}
        </div>
      </form>
    </div>
  );
} 