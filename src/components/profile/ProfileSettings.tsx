import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";
import EmailForm from "./EmailForm";
import { ProfileFormSchema, PasswordFormSchema } from "@/validators/profile.schema";
import { User as AuthUser } from "@/types/auth";
import { User as AppUser, UserResponse } from "@/types/users";
import StatusDialog from "@/components/common/StatusDialog";
import useShowDialog from "@/hooks/useShowDialog";

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
  cooldownSeconds?: number;
  emailCooldownSeconds?: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: () => Promise<void>;
  onSaveProfile: () => Promise<void>;
  onEditToggle: () => void;
  onPasswordChangeSuccess?: (responseData: { data: UserResponse }) => void;
  onPasswordChangeError?: (error: string) => void;
  onEmailChangeSuccess?: (responseData: { data: UserResponse }, emailData: { email: string, password: string }) => void;
  onEmailChangeError?: (error: string) => void;
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
  cooldownSeconds,
  emailCooldownSeconds,
  onInputChange,
  onPasswordChange,
  onImageChange,
  onChangePassword,
  onSaveProfile,
  onEditToggle,
  onPasswordChangeSuccess,
  onPasswordChangeError,
  onEmailChangeSuccess,
  onEmailChangeError,
  fileInputRef
}: ProfileSettingsProps) {
  // Email form reset state
  const [shouldResetEmailForm, setShouldResetEmailForm] = useState(false);

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

  const handleEmailChangeError = (error: string) => {
    displayErrorDialog(error);
  };

  const handleEmailChangeSuccess = (responseData: { data: UserResponse }, emailData: { email: string, password: string }) => {
    // Pass through to parent component (ProfileClient) which handles OTP modal
    if (onEmailChangeSuccess) {
      onEmailChangeSuccess(responseData, emailData);
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
        user={user as unknown as AppUser}
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
        currentEmail={user.email || ""}
        lastEmailChange={lastEmailChange}
        canChangeEmail={canChangeEmail}
        emailError={emailError}
        emailCooldownSeconds={emailCooldownSeconds}
        onEmailChange={onInputChange}
        shouldResetForm={shouldResetEmailForm}
        onFormReset={() => setShouldResetEmailForm(false)}
        userId={user.id}
        onEmailChangeError={onEmailChangeError || handleEmailChangeError}
        onEmailChangeSuccess={onEmailChangeSuccess || handleEmailChangeSuccess}
      />

      {/* Password Form */}
      <PasswordForm
        isEditing={isEditing}
        email={user?.email || ""}
        displayName={(user as AppUser)?.displayName || ""}
        passwordError={passwordError}
        isChangingPassword={isChangingPassword || false}
        cooldownSeconds={cooldownSeconds}
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