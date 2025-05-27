export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  profile_image?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OtpModalProps {
  email: string;
  otpValues: string[];
  inputRefs: React.RefObject<HTMLInputElement>[];
  error: string;
  isVerifying: boolean;
  isSendingOtp: boolean;
  otpSent: boolean;
  onOtpChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  onClose: () => void;
  onSendOtp: () => void;
}

export interface ProfileTabProps {
  id: string;
  name: string;
} 