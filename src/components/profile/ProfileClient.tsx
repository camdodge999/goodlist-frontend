"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// Components
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStores from "@/components/profile/ProfileStores";
import ProfileSettings from "@/components/profile/ProfileSettings";
import OtpModal from "@/components/profile/OtpModal";
import StatusDialog from "@/components/common/StatusDialog";
import { useShowDialog } from "@/hooks/useShowDialog";

// Types
import { Store } from "@/types/stores";
import { ProfileFormSchema, PasswordFormSchema } from "@/validators/profile.schema";
import { User } from "@/types/users";
import { signOut } from "next-auth/react";
import { profileTabs } from "@/consts/profileTab";
import UnderlineTab from "@/components/ui/underline-tab";
interface ProfileClientProps {
  user: User;
}

// ProfileClient component handles user profile management
export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [userStores, setUserStores] = useState<Store[]>([]);
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
    displayErrorDialog 
  } = useShowDialog();

  // Create individual refs for each OTP input
  const inputRefs = Array(6).fill(0).map(() => useRef<HTMLInputElement>(null));

  const [formData, setFormData] = useState<ProfileFormSchema>({
    name: "",
    email: "",
    phone: "",
    address: "",
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

  const logout = async () => {
    await signOut({ redirect: false });
  };

  useEffect(() => {
    // Fetch user stores from API
    const fetchUserStores = async () => {
      try {
        // In a real app, this would be an API call
        // For now using mock data
        const mockStores: Store[] = [
          {
            id: 1,
            userId: Number(user.id),
            storeName: "Example Store",
            bankAccount: "XXX-X-XXXXX-X",
            contactInfo: {
              line: "@examplestore",
              facebook: "ExampleStorePage",
              phone: "08-1234-5678",
              address: "123 Example St., Bangkok, Thailand",
            },
            description: "This is an example store",
            isVerified: true,
            isBanned: false,
            createdAt: "2023-02-15T08:30:00Z",
            updatedAt: "2023-02-15T08:30:00Z",
            imageUrl: "/images/logo.webp",
          }
        ];

        // Filter stores owned by the current user
        const stores = mockStores.filter((store) => store.userId === Number(user.id));
        setUserStores(stores);
      } catch (err) {
        console.error("Error fetching user stores:", err);
      }
    };

    fetchUserStores();

    // Initialize form data and tempEmail
    setFormData({
      name: user.displayName || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setTempEmail(user.email || ""); // Initialize tempEmail with current email

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
  }, [user, router]);

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
    if (email === user?.email) {
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
      inputRefs[lastInputIndex]?.current?.focus();
      return;
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    setOtp(newOtpValues.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs[index - 1]?.current?.focus();
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
    } catch (err) {
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
    } catch (err) {
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
    if (tempEmail !== user?.email && !validateEmail(tempEmail)) {
      return;
    }

    if (tempEmail !== user?.email) {
      // Trigger OTP verification for email change
      setShowOtpModal(true);
      return;
    }

    try {
      // Here you would make an API call to update the profile
      // For a mock, we're just updating the local state
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
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
    } catch (err) {
      setPasswordError("รหัสผ่านเดิมไม่ถูกต้อง");
      setIsChangingPassword(false);
    }
  };



  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data if canceling edit
      setFormData({
        name: user?.displayName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
      });
      setTempEmail(user?.email || "");
      setPreviewImage(null);
      setProfileImage(null);
      setEmailError("");
      setPasswordError("");
    }
    
    setIsEditing(!isEditing);
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
        {/* Profile Header */}
        <ProfileHeader 
          user={user} 
          previewImage={previewImage} 
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
              <ProfileStores stores={userStores} />
            )}

            {activeTab === "settings" && (
              <ProfileSettings
                user={user}
                formData={formData}
                passwordData={passwordData}
                tempEmail={tempEmail}
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
                fileInputRef={fileInputRef as unknown as React.RefObject<HTMLInputElement>}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 