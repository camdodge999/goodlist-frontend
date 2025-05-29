"use client";

import { useState, useEffect, useRef } from "react";
import { profileTabs } from "@/consts/profileTab";
import UnderlineTab from "@/components/ui/underline-tab";
import { useUser } from "@/contexts/UserContext";

// Components
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStores from "@/components/profile/ProfileStores";
import ProfileSettings from "@/components/profile/ProfileSettings";
import OtpModal from "@/components/auth/OtpModal";
import StatusDialog from "@/components/common/StatusDialog";
import useShowDialog from "@/hooks/useShowDialog";

// Types
import { ProfileFormSchema, PasswordFormSchema } from "@/validators/profile.schema";
import { User, UserResponse } from "@/types/users";
import { useRouter } from "next/navigation";
interface ProfileClientProps {
  user: User;
}

// ProfileClient component handles user profile management
export default function ProfileClient({ user }: ProfileClientProps) {
  const { userStores, fetchUserProfile, currentUser, updateUser, refreshUser, storesLoading, signOut, verifyUserPassword, verifyUserEmail, changeUserPassword, changeUserEmail } = useUser();
  const [activeTab, setActiveTab] = useState("stores");
  const [isEditing, setIsEditing] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [lastEmailChange] = useState<Date | null>(null);
  const [canChangeEmail] = useState(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState<NodeJS.Timeout | null>(null);

  // Add separate email cooldown states
  const [emailCooldownSeconds, setEmailCooldownSeconds] = useState(0);
  const [emailCooldownTimer, setEmailCooldownTimer] = useState<NodeJS.Timeout | null>(null);

  // Add password OTP modal states
  const [showPasswordOtpModal, setShowPasswordOtpModal] = useState(false);
  const [passwordOtpData, setPasswordOtpData] = useState<Partial<UserResponse> | null>(null);
  const [passwordOtpValue, setPasswordOtpValue] = useState("");
  const [passwordOtpError, setPasswordOtpError] = useState("");
  const [isVerifyingPasswordOtp, setIsVerifyingPasswordOtp] = useState(false);
  const [isSendingPasswordOtp, setIsSendingPasswordOtp] = useState(false);

  // Add email OTP modal states
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtpData, setEmailOtpData] = useState<Partial<UserResponse> | null>(null);
  const [emailOtpValue, setEmailOtpValue] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState<{email: string, password: string} | null>(null);

  const router = useRouter();
  // Add the useShowDialog hook
  const {
    showErrorDialog,
    setShowErrorDialog,
    errorMessage,
    displayErrorDialog,
    showSuccessDialog,
    setShowSuccessDialog,
    successMessage,
    displaySuccessDialog
  } = useShowDialog();

  // Create individual refs for each OTP input
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
    while (inputRefs.current.length < 6) {
      inputRefs.current.push(null);
    }
  }, []);

  const [formData, setFormData] = useState<ProfileFormSchema>({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    logo_url: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordFormSchema>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the more up-to-date currentUser when available
  const displayUser = currentUser || user;

  // Use a ref to track initialization to prevent repeated fetches
  const initialized = useRef(false);

  useEffect(() => {
    // Fetch user profile with stores when component mounts
    const initializeProfile = async () => {
      try {
        // Only fetch on first mount to prevent loops
        if (!initialized.current) {
          await fetchUserProfile(user.id, true);
          initialized.current = true;
        }
      } catch {
        console.error("Error fetching user profile:");
      }
    };

    initializeProfile();

    // Initialize form data and tempEmail with the most up-to-date user data
    const updateFormWithUserData = () => {
      setFormData({
        name: displayUser.displayName || "",
        email: displayUser.email || "",
        phoneNumber: displayUser.phoneNumber || "",
        address: displayUser.address || "",
        logo_url: displayUser.logo_url || "",
      });
    };

    updateFormWithUserData();

    // Check last email change date from localStorage
    // const lastChange = localStorage.getItem("lastEmailChange");
    // if (lastChange) {
    //   const lastChangeDate = new Date(lastChange);
    //   const oneMonthAgo = new Date();
    //   oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    //   if (lastChangeDate > oneMonthAgo) {
    //     setCanChangeEmail(false);
    //     setLastEmailChange(lastChangeDate);
    //   }
    // }
  }, [user.id, displayUser]);

  // Add a separate effect to update form data when displayUser changes
  useEffect(() => {
    if (displayUser) {
      setFormData({
        name: displayUser.displayName || "",
        email: displayUser.email || "",
        phoneNumber: displayUser.phoneNumber || "",
        address: displayUser.address || "",
        logo_url: displayUser.logo_url || "",
      });
    }
  }, [displayUser]);

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (cooldownTimer) {
        clearInterval(cooldownTimer);
      }
      if (emailCooldownTimer) {
        clearInterval(emailCooldownTimer);
      }
    };
  }, [cooldownTimer, emailCooldownTimer]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("รูปแบบอีเมลไม่ถูกต้อง");
      return false;
    }
    if (email === displayUser?.email) {
      setEmailError("กรุณาใช้อีเมลที่แตกต่างจากอีเมลปัจจุบัน");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "email") {
      validateEmail(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      displayErrorDialog("ไฟล์ขนาดใหญ่เกินไป กรุณาเลือกไฟล์ขนาดไม่เกิน 5MB");
      return;
    }

    // Check file type
    if (!file.type.match('image/(jpeg|jpg|png|gif)')) {
      displayErrorDialog("รองรับเฉพาะไฟล์รูปภาพประเภท JPG, PNG และ GIF เท่านั้น");
      return;
    }

    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.onerror = () => {
      displayErrorDialog("เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาลองใหม่อีกครั้ง");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      // Create FormData object for the profile update
      const formDataObj = new FormData();

      // Add text fields to FormData, checking for undefined/null values
      if (formData.name) {
        formDataObj.append('displayName', formData.name);
      }

      if (formData.email) {
        formDataObj.append('email', formData.email);
      }

      if (formData.phoneNumber) {
        formDataObj.append('phoneNumber', formData.phoneNumber);
      }

      if (formData.address) {
        formDataObj.append('address', formData.address);
      }

      // Add profile image if it exists
      if (profileImage) {
        formDataObj.append('logo_url', profileImage);
      }

      // Call updateUser with FormData
      const result = await updateUser(displayUser.id, formDataObj);

      if (result) {
        setIsEditing(false);
        // Reset profile image state
        setProfileImage(null);
        setPreviewImage(null);
        // Refresh user data after update
        displaySuccessDialog("บันทึกข้อมูลสำเร็จ");
        await refreshUser();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      displayErrorDialog("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError("");
  };

  const handleChangePassword = async () => {
    // This function is now handled by PasswordForm component
    // It will call the new password change flow with OTP
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data if canceling edit
      setFormData({
        name: displayUser?.displayName || "",
        email: displayUser?.email || "",
        phoneNumber: displayUser?.phoneNumber || "",
        address: displayUser?.address || "",
        logo_url: displayUser?.logo_url || "",
      });
      setPreviewImage(null);
      setProfileImage(null);
      setEmailError("");
      setPasswordError("");
    }

    setIsEditing(!isEditing);
  };

  const logout = async () => {
    await signOut();
  };

  // Password OTP handlers - simplified like SignupForm
  const handlePasswordOtpChange = (value: string): void => {
    setPasswordOtpValue(value);
    // Clear error when user starts typing
    if (passwordOtpError) {
      setPasswordOtpError("");
    }
  };

  // Email OTP handlers - following the same pattern
  const handleEmailOtpChange = (value: string): void => {
    setEmailOtpValue(value);
    // Clear error when user starts typing
    if (emailOtpError) {
      setEmailOtpError("");
    }
  };

  const handleVerifyPasswordOtp = async () => {
    if (passwordOtpValue.length !== 6) {
      setPasswordOtpError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }

    setIsVerifyingPasswordOtp(true);
    setPasswordOtpError("");

    try {
      // Here you would typically make an API call to verify the OTP and complete password change
      // For now, we'll simulate the API call
      const response = await verifyUserPassword({
        email: displayUser.email!,
        otpCode: passwordOtpValue,
        userId: displayUser.id!,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
        displayName: displayUser.displayName!,
      });

      if (response.statusCode === 201) {
        // Close OTP modal
        setShowPasswordOtpModal(false);
        // Clear any existing cooldown timer when closing modal
        if (cooldownTimer) {
          clearInterval(cooldownTimer);
          setCooldownTimer(null);
        }

        // Reset password fields and close modal
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsEditing(false);
        displaySuccessDialog("เปลี่ยนรหัสผ่านสำเร็จ");
      } else {
        setPasswordOtpError(response.message || "OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      }

      // Reset OTP states
      setPasswordOtpValue("");
      setPasswordOtpData(null);
    } catch {
      setPasswordOtpError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsVerifyingPasswordOtp(false);
    }
  };

  const handleClosePasswordOtpModal = () => {
    setShowPasswordOtpModal(false);
    setPasswordOtpValue("");
    setPasswordOtpError("");
    setPasswordOtpData(null);
    
    // Keep cooldown timer running when closing modal for rate limiting
    // Don't clear the timer - let it continue running
  };

  const handlePasswordChangeSuccess = (responseData: { data: UserResponse }) => {
    // Check if response contains UserResponse with otpToken
    if (responseData?.data) {
      setPasswordOtpData({
        email: responseData.data.email,
        refNumber: responseData.data.refNumber,
        displayName: responseData.data.displayName,
      });
      setShowPasswordOtpModal(true);
      // Start cooldown timer since OTP was just sent
      startCooldownTimer();
    } else {
      // If no OTP required, show success message
      displaySuccessDialog("เปลี่ยนรหัสผ่านสำเร็จ");
      setIsEditing(false);
    }
  };

  const handlePasswordChangeError = (error: string) => {
    displayErrorDialog(error);
  };

  const handleResendPasswordOtp = async (): Promise<void> => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      displayErrorDialog("กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วน");
      return;
    }

    setIsSendingPasswordOtp(true);
    setPasswordOtpError("");

    try {
      const result = await changeUserPassword({
        userId: displayUser.id,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
        email: displayUser.email || "",
        displayName: displayUser.displayName || ""
      });

      if (result && typeof result === 'object' && 'data' in result && result.data) {
        // Update OTP data with new reference number
        const responseData = result.data as UserResponse;
        setPasswordOtpData({
          email: responseData.email,
          refNumber: responseData.refNumber,
          displayName: responseData.displayName,
        });
        // Start new cooldown timer
        startCooldownTimer();
      }
    } catch {
      setPasswordOtpError("เกิดข้อผิดพลาดในการส่ง OTP กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSendingPasswordOtp(false);
    }
  };

  const startCooldownTimer = () => {
    // Set initial cooldown time (3 minutes = 180 seconds)
    setCooldownSeconds(180);

    // Clear any existing timer
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
    }

    // Start a new timer that decrements the cooldown every second
    const timer = setInterval(() => {
      setCooldownSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          // When timer reaches 0, clear the interval and allow resending
          clearInterval(timer);
          setCooldownTimer(null);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    // Store the timer ID so we can clear it later if needed
    setCooldownTimer(timer);

    // Cleanup function to clear the timer when component unmounts
    return () => {
      if (timer) clearInterval(timer);
    };
  };

  const startEmailCooldownTimer = () => {
    // Set initial cooldown time (3 minutes = 180 seconds)
    setEmailCooldownSeconds(180);

    // Clear any existing email timer
    if (emailCooldownTimer) {
      clearInterval(emailCooldownTimer);
    }

    // Start a new timer that decrements the email cooldown every second
    const timer = setInterval(() => {
      setEmailCooldownSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          // When timer reaches 0, clear the interval and allow resending
          clearInterval(timer);
          setEmailCooldownTimer(null);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    // Store the timer ID so we can clear it later if needed
    setEmailCooldownTimer(timer);

    // Cleanup function to clear the timer when component unmounts
    return () => {
      if (timer) clearInterval(timer);
    };
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtpValue.length !== 6) {
      setEmailOtpError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }

    if (!pendingEmailChange || !displayUser?.id) {
      setEmailOtpError("ไม่พบข้อมูลการเปลี่ยนอีเมล");
      return;
    }

    setIsVerifyingEmailOtp(true);
    setEmailOtpError("");

    try {
      const result = await verifyUserEmail({
        userId: displayUser.id,
        email: displayUser.email || "",
        newEmail: pendingEmailChange.email,
        password: pendingEmailChange.password,
        otpCode: emailOtpValue,
        otpToken: emailOtpData?.refNumber || ""
      });

      if (result && result.statusCode === 200) {
        // Close OTP modal
        setShowEmailOtpModal(false);
        
        // Reset email OTP states
        setEmailOtpValue("");
        setEmailOtpData(null);
        setPendingEmailChange(null);
        setIsEditing(false);
        displaySuccessDialog("อีเมลได้เปลี่ยนเรียบร้อยแล้ว");
        
        await refreshUser();
        router.push("/profile");
      } else {
        setEmailOtpError(result?.message || "OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Error verifying email OTP:", error);
      setEmailOtpError(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการยืนยัน OTP กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  const handleCloseEmailOtpModal = () => {
    setShowEmailOtpModal(false);
    setEmailOtpValue("");
    setEmailOtpError("");
    setEmailOtpData(null);
    setPendingEmailChange(null);
  };

  const handleEmailChangeSuccess = (responseData: { data: UserResponse }, emailData: {email: string, password: string}) => {
    // Check if response contains UserResponse with otpToken
    if (responseData?.data) {
      const userData = responseData.data;
      setEmailOtpData({
        email: userData.email,
        refNumber: userData.refNumber,
        displayName: userData.displayName,
      });
      setPendingEmailChange(emailData);
      setShowEmailOtpModal(true);
      // Start email cooldown timer since OTP was just sent
      startEmailCooldownTimer();
    } else {
      // If no OTP required, show success message
      displaySuccessDialog("อีเมลได้เปลี่ยนเรียบร้อยแล้ว");
      setIsEditing(false);
    }
  };

  const handleEmailChangeError = (error: string) => {
    displayErrorDialog(error);
  };

  const handleResendEmailOtp = async (): Promise<void> => {
    if (!pendingEmailChange) {
      displayErrorDialog("ไม่พบข้อมูลการเปลี่ยนอีเมล");
      return;
    }

    setIsSendingEmailOtp(true);
    setEmailOtpError("");

    try {
      const result = await changeUserEmail({
        userId: displayUser.id,
        email: displayUser.email || "",
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
        // Start new email cooldown timer
        startEmailCooldownTimer();
      }
    } catch {
      setEmailOtpError("เกิดข้อผิดพลาดในการส่ง OTP กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Error Dialog */}
      <StatusDialog
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        type="error"
        message={errorMessage}
      />

      <StatusDialog
        isOpen={showSuccessDialog}
        setIsOpen={setShowSuccessDialog}
        type="success"
        message={successMessage}
      />

      {/* Password OTP Modal */}
      {showPasswordOtpModal && passwordOtpData && (
        <OtpModal
          email={passwordOtpData.email || ""}
          otpValue={passwordOtpValue}
          error={passwordOtpError}
          isVerifying={isVerifyingPasswordOtp}
          isSendingOtp={isSendingPasswordOtp}
          refNumber={passwordOtpData.refNumber || ""}
          cooldownSeconds={cooldownSeconds}
          onOtpChange={handlePasswordOtpChange}
          onVerify={handleVerifyPasswordOtp}
          onClose={handleClosePasswordOtpModal}
          onSendOtp={handleResendPasswordOtp}
        />
      )}

      {/* Email OTP Modal */}
      {showEmailOtpModal && emailOtpData && (
        <OtpModal
          email={emailOtpData.email || ""}
          otpValue={emailOtpValue}
          error={emailOtpError}
          isVerifying={isVerifyingEmailOtp}
          isSendingOtp={isSendingEmailOtp}
          refNumber={emailOtpData.refNumber || ""}
          cooldownSeconds={emailCooldownSeconds}
          onOtpChange={handleEmailOtpChange}
          onVerify={handleVerifyEmailOtp}
          onClose={handleCloseEmailOtpModal}
          onSendOtp={handleResendEmailOtp}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header - Use the most up-to-date user data */}
        <ProfileHeader
          user={displayUser}
          onLogout={logout}
        />

        {/* Tabs */}
        <div className="mt-8">
          <UnderlineTab
            tabs={profileTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <div>
            {activeTab === "stores" && (
              <ProfileStores
                stores={userStores || []}
                isLoading={storesLoading}
              />
            )}

            {activeTab === "settings" && (
              <ProfileSettings
                user={displayUser}
                formData={formData}
                passwordData={passwordData}
                previewImage={previewImage}
                isEditing={isEditing}
                canChangeEmail={canChangeEmail}
                lastEmailChange={lastEmailChange}
                emailError={emailError}
                passwordError={passwordError}
                isChangingPassword={false}
                cooldownSeconds={cooldownSeconds}
                emailCooldownSeconds={emailCooldownSeconds}
                onInputChange={handleInputChange}
                onPasswordChange={handlePasswordChange}
                onImageChange={handleImageChange}
                onChangePassword={handleChangePassword}
                onPasswordChangeSuccess={handlePasswordChangeSuccess}
                onPasswordChangeError={handlePasswordChangeError}
                onEmailChangeSuccess={handleEmailChangeSuccess}
                onEmailChangeError={handleEmailChangeError}
                onSaveProfile={handleSaveProfile}
                onEditToggle={handleEditToggle}
                fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 