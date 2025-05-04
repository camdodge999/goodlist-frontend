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
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                
                // Call the original change handler for each position that changed
                for (let i = 0; i < 6; i++) {
                  if (otpValues[i] !== newOtpValues[i]) {
                    onOtpChange(i, newOtpValues[i] || '');
                  }
                }
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
            <Button
              onClick={onVerify}
              disabled={isVerifying || !otpSent || otpValue.length !== 6}
              variant="primary"
              className="w-full cursor-pointer flex justify-center items-center gap-2"
            >
              {isVerifying && <Spinner className="mr-2" />}
              {isVerifying ? "กำลังตรวจสอบ..." : "ยืนยัน"}
            </Button>

            <Button
              onClick={onSendOtp}
              disabled={isSendingOtp || otpSent}
              variant="outline"
              className="w-full cursor-pointer flex justify-center items-center gap-2"
            >
              {isSendingOtp && <Spinner className="mr-2" />}
              {isSendingOtp
                ? "กำลังส่ง..."
                : otpSent
                ? "ส่งรหัสยืนยันแล้ว"
                : "ส่งรหัสยืนยัน"}
            </Button>
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