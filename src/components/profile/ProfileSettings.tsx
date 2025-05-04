import React from "react";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";
import { ProfileFormSchema, PasswordFormSchema } from "@/validators/profile.schema";
import { User } from "@/types/auth";

interface ProfileSettingsProps {
  user: User;
  formData: ProfileFormSchema;
  passwordData: PasswordFormSchema;
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
  onChangePassword: () => Promise<void>;
  onSaveProfile: () => Promise<void>;
  onEditToggle: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function ProfileSettings({
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
}: ProfileSettingsProps) {
  return (
    <div>
      {/* Profile Form */}
      <ProfileForm
        initialData={formData}
        isEditing={isEditing}
        canChangeEmail={canChangeEmail}
        lastEmailChange={lastEmailChange}
        emailError={emailError}
        onInputChange={onInputChange}
        onImageChange={onImageChange}
        onSaveProfile={onSaveProfile}
        onEditToggle={onEditToggle}
        previewImage={previewImage}
        fileInputRef={fileInputRef}
      />

      {/* Password Form */}
      <PasswordForm
        isEditing={isEditing}
        passwordError={passwordError}
        isChangingPassword={isChangingPassword}
        onPasswordChange={onPasswordChange}
        onChangePassword={onChangePassword}
        initialData={passwordData}
      />
    </div>
  );
} 