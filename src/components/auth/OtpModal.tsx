"use client";

import { motion } from "framer-motion";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

interface OtpModalProps {
  email: string;
  otpValue: string;
  error: string;
  isVerifying: boolean;
  isSendingOtp: boolean;
  refNumber: string;
  cooldownSeconds: number;
  onOtpChange: (value: string) => void;
  onVerify: () => Promise<void>;
  onClose: () => void;
  onSendOtp: () => Promise<void>;
}

export default function OtpModal({
  email,
  otpValue,
  error,
  isVerifying,
  isSendingOtp,
  refNumber,
  cooldownSeconds,
  onOtpChange,
  onVerify,
  onClose,
  onSendOtp,
}: OtpModalProps): React.ReactElement {

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle OTP value changes (including paste)
  const handleOtpChange = (value: string) => {
    // Only allow numbers - filter out non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Limit to 6 digits maximum
    const limitedValue = numericValue.slice(0, 6);
    
    // Call the parent's onChange handler with the processed value
    onOtpChange(limitedValue);
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-opacity-50 flex backdrop-blur-sm items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">ยืนยันตัวตน</h3>
          <Button
            onClick={onClose}
            aria-label="ปิด"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            โปรดกรอกรหัสยืนยัน (OTP) ที่ส่งไปยัง <span className="font-bold">{email}</span><br />
            หากยังไม่ได้รับรหัส โปรดตรวจสอบในโฟลเดอร์อีเมลขยะ
            หรือกดปุ่ม &quot;ส่งรหัส OTP&quot; อีกครั้ง
          </p>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={handleOtpChange}
              containerClassName="gap-2 justify-center"
              pattern="[0-9]*"
              inputMode="numeric"
              autoComplete="one-time-code"
              pasteTransformer={(pastedText) => pastedText.replace(/[^0-9]/g, '').slice(0, 6)}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {
            refNumber && (
              <p className="text-sm text-center text-gray-500">
                รหัสอ้างอิง: {refNumber}
              </p>
            )
          }

          {error && (
            <p className="text-sm text-center text-red-500">{error}</p>
          )}

          <div className="flex flex-col space-y-3">
            <Button
              onClick={onVerify}
              disabled={isVerifying || otpValue.length !== 6}
              variant="primary"
              className="w-full cursor-pointer flex justify-center items-center gap-2"
            >
              {isVerifying && <Spinner className="mr-2" />}
              {isVerifying ? "กำลังตรวจสอบ..." : "ยืนยัน"}
            </Button>

            <Button
              onClick={onSendOtp}
              disabled={isSendingOtp || cooldownSeconds > 0}
              variant="outline"
              className="w-full cursor-pointer flex justify-center items-center gap-2"
            >
              {isSendingOtp && <Spinner className="mr-2" />}
              {isSendingOtp
                ? "กำลังส่ง..."
                : cooldownSeconds > 0
                  ? `รอ ${formatTime(cooldownSeconds)} เพื่อส่งใหม่`
                  : "ส่งรหัส OTP อีกครั้ง"}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            หากไม่ได้รับรหัส โปรดตรวจสอบในโฟลเดอร์อีเมลขยะ
            หรือกดปุ่ม &quot;ส่งรหัส OTP&quot; อีกครั้ง
            {cooldownSeconds > 0 && ` (รอ ${formatTime(cooldownSeconds)})`}
          </p>
        </div>
      </motion.div>
    </div>
  );
} 