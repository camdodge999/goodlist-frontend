export interface ResetPasswordFormData {
  email: string;
}

export interface ResetPasswordSuccessProps {
  onBackToLogin: () => void;
}

export interface ResetPasswordFormProps {
  email: string;
  error: string;
  isLoading: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// Auth interfaces
export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  focus?: boolean;
}

export interface OtpModalProps {
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