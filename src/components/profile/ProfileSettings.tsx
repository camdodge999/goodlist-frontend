import React from "react";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";
import EmailForm from "./EmailForm";
import { ProfileFormSchema, PasswordFormSchema } from "@/validators/profile.schema";
import { User as AuthUser } from "@/types/auth";
import { User as AppUser, UserResponse } from "@/types/users";
import StatusDialog from "@/components/common/StatusDialog";
import useShowDialog from "@/hooks/useShowDialog";
import { useUser } from "@/contexts/UserContext";

// Create a union type that works with both User types
type User = AuthUser | AppUser;

interface ProfileSettingsProps {
  user: User;
  formData: ProfileFormSchema;
  passwordData: PasswordFormSchema;
  previewImage: string | null;
  isEditing: boolean;
  canChangeEmail: boolean;
  lastEmailChange: Date | null;
  emailError: string;
  passwordError: string;
  isChangingPassword?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: () => Promise<void>;
  onSaveProfile: () => Promise<void>;
  onEditToggle: () => void;
  onPasswordChangeSuccess?: (responseData: { data: UserResponse }) => void;
  onPasswordChangeError?: (error: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function ProfileSettings({
  user,
  formData,
  passwordData,
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
  onPasswordChangeSuccess,
  onPasswordChangeError,
  fileInputRef
}: ProfileSettingsProps) {
  // Use the user context for email change
  const { changeUserEmail, refreshUser } = useUser();

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

  const handleChangeEmail = async (newEmail: string, currentPassword: string): Promise<boolean> => {
    try {
      if (!user?.id) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }
      
      const result = await changeUserEmail(user.id, newEmail, currentPassword);
      
      if (result) {
        // Refresh user data after update
        await refreshUser();
        displaySuccessDialog("อีเมลของคุณได้รับการอัปเดตเรียบร้อยแล้ว");
        return true;
      } else {
        throw new Error("ไม่สามารถอัปเดตอีเมล");
      }
    } catch (error) {
      displayErrorDialog(error instanceof Error ? error.message : "ไม่สามารถอัปเดตอีเมล");
      return false;
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
        onInputChange={onInputChange}
        onImageChange={onImageChange}
        onSaveProfile={handleSaveProfile}
        onEditToggle={onEditToggle}
        previewImage={previewImage}
        fileInputRef={fileInputRef}
      />

      {/* Email Form - New component for email management */}
      <EmailForm
        isEditing={isEditing}
        currentEmail={formData.email}
        lastEmailChange={lastEmailChange}
        canChangeEmail={canChangeEmail}
        emailError={emailError}
        onEmailChange={onInputChange}
        onChangeEmail={handleChangeEmail}
      />

      {/* Password Form */}
      <PasswordForm
        isEditing={isEditing}
        email={user?.email || ""}
        displayName={(user as AppUser)?.displayName || ""}
        passwordError={passwordError}
        isChangingPassword={isChangingPassword || false}
        onPasswordChange={onPasswordChange}
        onChangePassword={handleChangePassword}
        onPasswordChangeSuccess={onPasswordChangeSuccess} 
        onPasswordChangeError={onPasswordChangeError}
        initialData={passwordData}
        userId={user.id}
      />
    </div>
  );
} 