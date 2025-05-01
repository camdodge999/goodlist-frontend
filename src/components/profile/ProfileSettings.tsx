import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { ProfileFormData, PasswordFormData, User } from '@/types/profile';

interface ProfileSettingsProps {
  user: User;
  formData: ProfileFormData;
  passwordData: PasswordFormData;
  tempEmail: string;
  previewImage: string | null;
  isEditing: boolean;
  canChangeEmail: boolean;
  lastEmailChange: Date | null;
  emailError: string;
  passwordError: string;
  isChangingPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: () => void;
  onSaveProfile: () => void;
  onEditToggle: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  formData,
  passwordData,
  tempEmail,
  previewImage,
  isEditing,
  canChangeEmail,
  lastEmailChange,
  emailError,
  passwordError,
  isChangingPassword,
  onInputChange,
  onPasswordChange,
  onImageChange,
  onChangePassword,
  onSaveProfile,
  onEditToggle,
  fileInputRef
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            ตั้งค่าบัญชี
          </h3>
          <button
            type="button"
            onClick={onEditToggle}
            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md 
              ${isEditing 
                ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
              } transition-colors duration-200`}
          >
            {isEditing ? 'ยกเลิก' : 'แก้ไข'}
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
              {previewImage || user.profile_image ? (
                <Image
                  src={previewImage || user.profile_image}
                  alt={`รูปโปรไฟล์ของ ${user.name}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <FontAwesomeIcon icon={faUser} className="h-full w-full p-4 text-gray-300" />
              )}
              {isEditing && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-40 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FontAwesomeIcon icon={faCamera} className="h-6 w-6 text-white" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={onImageChange}
                  />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                รูปโปรไฟล์
              </h4>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? "คลิกที่รูปเพื่อเปลี่ยนรูปโปรไฟล์"
                  : "คลิกปุ่มแก้ไขเพื่อเปลี่ยนรูปโปรไฟล์"}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              ชื่อ
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={onInputChange}
                disabled={!isEditing}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${
                  !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              อีเมล
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                value={tempEmail}
                onChange={onInputChange}
                disabled={!isEditing || !canChangeEmail}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${
                  !isEditing || !canChangeEmail
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                } ${emailError ? "ring-2 ring-red-500" : ""}`}
              />
              {!canChangeEmail && lastEmailChange && isEditing && (
                <p className="mt-1 text-sm text-gray-500">
                  สามารถเปลี่ยนอีเมลได้อีกครั้งในวันที่{" "}
                  {dayjs(lastEmailChange).locale('th').format('D MMMM YYYY')}
                </p>
              )}
              {emailError && isEditing && (
                <p className="mt-1 text-sm text-red-500">
                  {emailError}
                </p>
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
            <div className="mt-1">
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={onInputChange}
                disabled={!isEditing}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${
                  !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              ที่อยู่
            </label>
            <div className="mt-1">
              <textarea
                name="address"
                id="address"
                rows={3}
                value={formData.address}
                onChange={onInputChange}
                disabled={!isEditing}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${
                  !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              เปลี่ยนรหัสผ่าน
            </h4>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="oldPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  รหัสผ่านเดิม
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="oldPassword"
                    id="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={onPasswordChange}
                    disabled={!isEditing}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  รหัสผ่านใหม่
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={onPasswordChange}
                    disabled={!isEditing}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={onPasswordChange}
                    disabled={!isEditing}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>

              {passwordError && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
                  {passwordError}
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={onChangePassword}
                    disabled={
                      isChangingPassword ||
                      !passwordData.oldPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                    className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? "กำลังดำเนินการ..." : "เปลี่ยนรหัสผ่าน"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="border-t border-gray-200 pt-6 flex justify-end">
              <button
                type="button"
                onClick={onSaveProfile}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 