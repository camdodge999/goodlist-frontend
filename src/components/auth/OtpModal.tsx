"use client";

import { motion } from "framer-motion";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";

interface OtpModalProps {
  email: string;
  otpValues: string[];
  error: string;
  isVerifying: boolean;
  isSendingOtp: boolean;
  otpSent: boolean;
  onOtpChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onVerify: () => Promise<void>;
  onClose: () => void;
  onSendOtp: () => Promise<void>;
}

export default function OtpModal({
  email,
  otpValues,
  error,
  isVerifying,
  isSendingOtp,
  otpSent,
  onOtpChange,
  onVerify,
  onClose,
  onSendOtp
}: OtpModalProps): React.ReactElement {
  const otpValue = otpValues.join("");
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">ยืนยันตัวตน</h3>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            โปรดกรอกรหัสยืนยัน (OTP) ที่ส่งไปยัง {email}
          </p>

          <div className="flex justify-center">
            <InputOTP 
              maxLength={6}
              value={otpValue}
              onChange={(value) => {
                // Convert the new value to array of characters
                const newOtpValues = value.split('');
                // Pad array with empty strings if it's shorter than 6
                while (newOtpValues.length < 6) {
                  newOtpValues.push('');
                }
                // Call the original change handler for each position
                newOtpValues.forEach((val, index) => {
                  onOtpChange(index, val);
                });
              }}
              containerClassName="gap-2 justify-center"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <p className="text-sm text-center text-red-500">{error}</p>
          )}

          <div className="flex flex-col space-y-3">
            <button
              onClick={onVerify}
              disabled={isVerifying || !otpSent}
              className="w-full py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? "กำลังตรวจสอบ..." : "ยืนยัน"}
            </button>

            <button
              onClick={onSendOtp}
              disabled={isSendingOtp || otpSent}
              className="w-full py-2.5 px-4 text-sm font-medium rounded-lg text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingOtp
                ? "กำลังส่ง..."
                : otpSent
                ? "ส่งรหัสยืนยันแล้ว"
                : "ส่งรหัสยืนยัน"}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            หากไม่ได้รับรหัส โปรดตรวจสอบในโฟลเดอร์อีเมลขยะ
            หรือกดปุ่มส่งรหัสยืนยันอีกครั้ง
          </p>
        </div>
      </motion.div>
    </div>
  );
} 