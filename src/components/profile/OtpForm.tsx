import React, { useRef, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OtpFormProps {
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

export default function OtpForm({
  email,
  otpValues,
  error,
  isVerifying,
  isSendingOtp,
  otpSent,
  onOtpChange,
  onKeyDown,
  onVerify,
  onClose,
  onSendOtp
}: OtpFormProps) {
  const inputRefs = Array(6)
    .fill(0)
    .map(() => useRef<HTMLInputElement>(null));

  useEffect(() => {
    if (!otpSent && inputRefs[0]?.current) {
      inputRefs[0].current.focus();
    }
  }, [otpSent]);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onVerify();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">ยืนยัน OTP</h3>
        <p className="text-sm text-gray-600 mb-6">
          {otpSent
            ? `กรุณากรอกรหัส OTP ที่ส่งไปยัง ${email}`
            : `คลิกส่ง OTP เพื่อรับรหัสยืนยันทาง ${email}`}
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          {otpSent ? (
            <>
              <div className="flex justify-center space-x-2 mb-6">
                {otpValues.map((value, index) => (
                  <Input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength={1}
                    aria-label={`OTP digit ${index + 1}`}
                    className="w-12 h-12 text-center text-lg"
                    value={value}
                    onChange={(e) => onOtpChange(index, e.target.value)}
                    onKeyDown={(e) => onKeyDown(index, e)}
                    disabled={isVerifying}
                  />
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isVerifying}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isVerifying || otpValues.some((v) => !v)}
                >
                  {isVerifying ? "กำลังยืนยัน..." : "ยืนยัน"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                onClick={onSendOtp}
                disabled={isSendingOtp}
              >
                {isSendingOtp ? "กำลังส่ง OTP..." : "ส่ง OTP"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 