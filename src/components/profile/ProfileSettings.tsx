import React from "react";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";
import { ProfileFormSchema, PasswordFormSchema } from "@/validators/profile.schema";
import { User as AuthUser } from "@/types/auth";
import { User as AppUser } from "@/types/users";
import StatusDialog from "@/components/common/StatusDialog";
import { useShowDialog } from "@/hooks/useShowDialog";
import { motion } from "framer-motion";

// Create a union type that works with both User types
type User = AuthUser | AppUser;

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
  // Use the dialog hook
  const {
    showSuccessDialog,
    setShowSuccessDialog,
    showErrorDialog,
    setShowErrorDialog,
    successMessage,
    errorMessage,
    successTitle,
    errorTitle,
    displaySuccessDialog,
    displayErrorDialog
  } = useShowDialog();

  // Wrap the original handlers to use dialogs instead of alerts
  const handleSaveProfile = async () => {
    try {
      await onSaveProfile();
    } catch (error) {
      displayErrorDialog(error instanceof Error ? error.message : "ไม่สามารถอัปเดตโปรไฟล์ได้");
    }
  };

  const handleChangePassword = async () => {
    try {
      await onChangePassword();
      displaySuccessDialog("เปลี่ยนรหัสผ่านสำเร็จ");
    } catch (error) {
      displayErrorDialog(error instanceof Error ? error.message : "ไม่สามารถเปลี่ยนรหัสผ่านได้");
    }
  };

  return (
    <div>
      {/* Success Dialog */}
      <StatusDialog
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        type="success"
        message={successMessage}
        title={successTitle}
      />

      {/* Error Dialog */}
      <StatusDialog
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        type="error"
        message={errorMessage}
        title={errorTitle}
      />


        <ProfileForm
          initialData={formData}
          isEditing={isEditing}
          canChangeEmail={canChangeEmail}
          lastEmailChange={lastEmailChange}
          emailError={emailError}
          onInputChange={onInputChange}
          onImageChange={onImageChange}
          onSaveProfile={handleSaveProfile}
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
          onChangePassword={handleChangePassword}
          initialData={passwordData}
        />
    </div>
  );
} 