import React from "react";
import OtpForm from "./OtpForm";

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
  onKeyDown,
  onVerify,
  onClose,
  onSendOtp
}: OtpModalProps) {
  return (
    <OtpForm
      email={email}
      otpValues={otpValues}
      error={error}
      isVerifying={isVerifying}
      isSendingOtp={isSendingOtp}
      otpSent={otpSent}
      onOtpChange={onOtpChange}
      onKeyDown={onKeyDown}
      onVerify={onVerify}
      onClose={onClose}
      onSendOtp={onSendOtp}
    />
  );
} 