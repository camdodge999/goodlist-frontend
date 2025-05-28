import React, { useState, useEffect } from "react";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";
import EmailForm from "./EmailForm";
import { ProfileFormSchema, PasswordFormSchema } from "@/validators/profile.schema";
import { User as AuthUser } from "@/types/auth";
import { User as AppUser, UserResponse } from "@/types/users";
import StatusDialog from "@/components/common/StatusDialog";
import useShowDialog from "@/hooks/useShowDialog";
import { useUser } from "@/contexts/UserContext";
import OtpModal from "@/components/auth/OtpModal";
import { useRouter } from "next/navigation";

// Create a union type that works with both User types
type User = AuthUser | AppUser;

// Interface for API response
interface ApiResponse {
  statusCode: number;
  message: string;
  data?: UserResponse;
}

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
  fileInputRef
}: ProfileSettingsProps) {
  // Use the user context for email change
  const { changeUserEmail, refreshUser, verifyUserEmail } = useUser();

  // Email OTP modal states
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtpData, setEmailOtpData] = useState<Partial<UserResponse> | null>(null);
  const [emailOtpValue, setEmailOtpValue] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState<{email: string, password: string} | null>(null);
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

  // Use the router
  const router = useRouter();

  // Handle email OTP change
  const handleEmailOtpChange = (value: string): void => {
    setEmailOtpValue(value);
    if (emailOtpError) {
      setEmailOtpError("");
    }
  };

  // Handle email OTP verification
  const handleVerifyEmailOtp = async () => {
    if (emailOtpValue.length !== 6) {
      setEmailOtpError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }

    if (!pendingEmailChange || !user?.id) {
      setEmailOtpError("ไม่พบข้อมูลการเปลี่ยนอีเมล");
      return;
    }

    setIsVerifyingEmailOtp(true);
    setEmailOtpError("");

    try {
      const result = await verifyUserEmail({
        userId: user.id,
        email: user.email || "",
        newEmail: pendingEmailChange.email,
        password: pendingEmailChange.password,
        otpCode: emailOtpValue,
        otpToken: emailOtpData?.refNumber || ""
      });

      // Type assertion since verifyUserEmail actually returns an API response object
      const apiResponse = result as unknown as ApiResponse;
      
      if (apiResponse && apiResponse.statusCode === 200) {
        // Close OTP modal
        setShowEmailOtpModal(false);
        
        // Reset email OTP states
        setEmailOtpValue("");
        setEmailOtpData(null);
        setPendingEmailChange(null);
        
        // Trigger email form reset
        setShouldResetEmailForm(true);
        
        onEditToggle(); // Close editing mode
        displaySuccessDialog("อีเมลได้เปลี่ยนเรียบร้อยแล้ว");
        
        // Navigate to profile page to refresh
        setTimeout(() => {
          console.log("Navigating to profile page");
          router.push("/profile");
        }, 1000);
      } else {
        setEmailOtpError(apiResponse?.message || "OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Error verifying email OTP:", error);
      setEmailOtpError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  // Handle closing email OTP modal
  const handleCloseEmailOtpModal = () => {
    setShowEmailOtpModal(false);
    setEmailOtpValue("");
    setEmailOtpError("");
    setEmailOtpData(null);
    setPendingEmailChange(null);
  };

  // Handle resending email OTP
  const handleResendEmailOtp = async (): Promise<void> => {
    if (!pendingEmailChange) {
      displayErrorDialog("ไม่พบข้อมูลการเปลี่ยนอีเมล");
      return;
    }

    setIsSendingEmailOtp(true);
    setEmailOtpError("");

    try {
      const result = await changeUserEmail({
        userId: user.id,
        email: user.email || "",
        newEmail: pendingEmailChange.email,
        password: pendingEmailChange.password
      });

      if (result && typeof result === 'object' && 'data' in result && result.data) {
        // Update OTP data with new reference number
        const responseData = result.data as UserResponse;
        setEmailOtpData({
          email: responseData.email,
          refNumber: responseData.refNumber,
          displayName: responseData.displayName,
        });
        // Email cooldown timer already started above
      }
    } catch {
      setEmailOtpError("เกิดข้อผิดพลาดในการส่ง OTP กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

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

  const handleEmailChangeSuccess = (responseData: { data: UserResponse }, emailData: {email: string, password: string}) => {
    // Check if response contains UserResponse with otpToken/refNumber
    if (responseData?.data && responseData.data.refNumber) {
      const userData = responseData.data;
      setEmailOtpData({
        email: userData.email,
        refNumber: userData.refNumber,
        displayName: userData.displayName,
      });
      setPendingEmailChange(emailData);
      setShowEmailOtpModal(true);
    } else {
      // If no OTP required, show success message
      displaySuccessDialog("อีเมลได้เปลี่ยนเรียบร้อยแล้ว");
      onEditToggle(); // Close editing mode
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

      {/* Email OTP Modal */}
      {showEmailOtpModal && emailOtpData && (
        <OtpModal
          email={emailOtpData.email || ""}
          otpValue={emailOtpValue}
          error={emailOtpError}
          isVerifying={isVerifyingEmailOtp}
          isSendingOtp={isSendingEmailOtp}
          refNumber={emailOtpData.refNumber || ""}
          cooldownSeconds={emailCooldownSeconds || 0}
          onOtpChange={handleEmailOtpChange}
          onVerify={handleVerifyEmailOtp}
          onClose={handleCloseEmailOtpModal}
          onSendOtp={handleResendEmailOtp}
        />
      )}

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
        currentEmail={user.email || ""}
        lastEmailChange={lastEmailChange}
        canChangeEmail={canChangeEmail}
        emailError={emailError}
        emailCooldownSeconds={emailCooldownSeconds}
        onEmailChange={onInputChange}
        shouldResetForm={shouldResetEmailForm}
        onFormReset={() => setShouldResetEmailForm(false)}
        userId={user.id}
        onEmailChangeError={handleEmailChangeError}
        onEmailChangeSuccess={handleEmailChangeSuccess}
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