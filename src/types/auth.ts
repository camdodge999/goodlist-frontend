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