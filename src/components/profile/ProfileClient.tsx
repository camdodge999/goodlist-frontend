"use client";

import { useState, useEffect, useRef } from "react";
import { profileTabs } from "@/consts/profileTab";
import UnderlineTab from "@/components/ui/underline-tab";
import { useUser } from "@/contexts/UserContext";

// Components
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStores from "@/components/profile/ProfileStores";
import ProfileSettings from "@/components/profile/ProfileSettings";
import OtpModal from "@/components/profile/OtpModal";
import StatusDialog from "@/components/common/StatusDialog";
import useShowDialog from "@/hooks/useShowDialog";

// Types
import { ProfileFormSchema, PasswordFormSchema } from "@/validators/profile.schema";
import { User } from "@/types/users";

interface ProfileClientProps {
  user: User;
}

// ProfileClient component handles user profile management
export default function ProfileClient({ user }: ProfileClientProps) {
  const { userStores, fetchUserProfile, currentUser, updateUser, refreshUser, storesLoading, signOut } = useUser();
  const [activeTab, setActiveTab] = useState("stores");
  const [isEditing, setIsEditing] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [lastEmailChange, setLastEmailChange] = useState<Date | null>(null);
  const [canChangeEmail, setCanChangeEmail] = useState(true);
  const [tempEmail, setTempEmail] = useState("");

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
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      } catch (error) {
        console.error("Error fetching user profile:", error);
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
      setTempEmail(displayUser.email || "");
    };

    updateFormWithUserData();

    // Check last email change date from localStorage
    const lastChange = localStorage.getItem("lastEmailChange");
    if (lastChange) {
      const lastChangeDate = new Date(lastChange);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      if (lastChangeDate > oneMonthAgo) {
        setCanChangeEmail(false);
        setLastEmailChange(lastChangeDate);
      }
    }
  }, [user.id, fetchUserProfile, displayUser]);

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
      setTempEmail(displayUser.email || "");
    }
  }, [displayUser]);

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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValues = value.split("").slice(0, 6);
      const newOtpValues = [...otpValues];
      pastedValues.forEach((val, i) => {
        if (i < 6) {
          newOtpValues[i] = val;
        }
      });
      setOtpValues(newOtpValues);
      setOtp(newOtpValues.join(""));

      // Focus the last input
      const lastInputIndex = Math.min(pastedValues.length - 1, 5);
      if (inputRefs.current[lastInputIndex]) {
        inputRefs.current[lastInputIndex]?.focus();
      }
      return;
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    setOtp(newOtpValues.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      // Move to previous input on backspace
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }

    if (otp !== "000000") {
      setError("OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Here you would typically make an API call to update the email
      // For now, we'll just update the local state
      setFormData((prev) => ({ ...prev, email: tempEmail }));
      localStorage.setItem("lastEmailChange", new Date().toISOString());
      setCanChangeEmail(false);
      setShowOtpModal(false);
      setIsEditing(false);

      // Reset OTP states
      setOtp("");
      setOtpValues(["", "", "", "", "", ""]);
      setOtpSent(false);
    } catch {
      // Handle error without variable
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setError("");

    try {
      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtpSent(true);
    } catch {
      // Handle error without variable
      setError("เกิดข้อผิดพลาดในการส่ง OTP กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setOtp("");
    setOtpValues(["", "", "", "", "", ""]);
    setOtpSent(false);
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "email") {
      setTempEmail(value);
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
      displayErrorDialog("An error occurred while updating your profile");
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
    setIsChangingPassword(true);
    setPasswordError("");

    try {
      // Here you would typically make an API call to verify and change password
      // For now, we'll just simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset password fields
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      setIsEditing(false);
    } catch {
      // Handle error without variable
      setPasswordError("รหัสผ่านเดิมไม่ถูกต้อง");
      setIsChangingPassword(false);
    }
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
      setTempEmail(displayUser?.email || "");
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

      {showOtpModal && (
        <OtpModal
          email={tempEmail}
          otpValues={otpValues}
          error={error}
          isVerifying={isVerifying}
          isSendingOtp={isSendingOtp}
          otpSent={otpSent}
          onOtpChange={handleOtpChange}
          onKeyDown={handleKeyDown}
          onVerify={handleVerifyOtp}
          onClose={handleCloseOtpModal}
          onSendOtp={handleSendOtp}
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
                isChangingPassword={isChangingPassword}
                onInputChange={handleInputChange}
                onPasswordChange={handlePasswordChange}
                onImageChange={handleImageChange}
                onChangePassword={handleChangePassword}
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