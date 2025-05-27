import React, { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormSchema } from "@/validators/profile.schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { FormLabel } from "@/components/ui/form-label";
import dayjs from "dayjs";
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";
dayjs.extend(buddhistEra);
dayjs.locale('th');

interface ProfileFormProps {
  initialData: ProfileFormSchema;
  isEditing: boolean;
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

  const { authenticatedUrl: imageUrl } = useAuthenticatedImage(initialData.logo_url);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลส่วนตัว</h3>
        <form onSubmit={handleFormSubmit} encType="multipart/form-data">
          <div className="mb-6">
            <div className="flex items-center">
              <div className="mr-4 relative">
                <div className="flex items-start space-x-4">
                  {/* Current Profile Image */}
                  <div className="relative group">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={imageUrl || undefined}
                        alt={initialData.name || "User"}
                        className="transition-opacity duration-300"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-medium text-4xl">
                        {initialData.name ? initialData.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Preview Image (shows only when a new image is selected) */}
                  {previewImage && isEditing && (
                    <div className="relative group">
                      <div className="flex flex-col items-center">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src={previewImage}
                            alt="Preview"
                            className="transition-opacity duration-300 object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 font-medium text-4xl">
                            {initialData.name ? initialData.name.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-green-600 mt-1">รูปใหม่</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {isEditing && (
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 cursor-pointer hover:bg-blue-500 hover:text-white transition-all duration-200"
                  >
                    เปลี่ยนรูปโปรไฟล์
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={onImageChange}
                    aria-label="เลือกรูปโปรไฟล์"
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
              <FormLabel
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                ชื่อ
              </FormLabel>
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
              <FormLabel
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                อีเมล (สามารถเปลี่ยนได้)
              </FormLabel>
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1"
                  disabled={true}
                  defaultValue={initialData.email}
                  onChange={onInputChange}
                />
              </div>
            </div>

            <div>
              <FormLabel
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                เบอร์โทรศัพท์
              </FormLabel>
              <Input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className="mt-1"
                disabled={!isEditing}
                defaultValue={initialData.phoneNumber}
                onChange={onInputChange}
              />
            </div>

            <div className="sm:col-span-2">
              <FormLabel
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                ที่อยู่
              </FormLabel>
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
                  variant="primary"
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
      </motion.div>
    </div>
  );
} 