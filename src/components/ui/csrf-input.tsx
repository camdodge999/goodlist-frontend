"use client";

import { useCSRFToken } from '@/hooks/useCSRFToken';

interface CSRFInputProps {
  readonly className?: string;
}

/**
 * Hidden input component that automatically includes CSRF token in forms
 * Usage: <CSRFInput /> inside any form
 */
export function CSRFInput({ className }: CSRFInputProps) {
  const { token, isLoading } = useCSRFToken();

  // Don't render anything while loading or if no token
  if (isLoading || !token) {
    return null;
  }

  return (
    <input
      type="hidden"
      name="csrfToken"
      value={token}
      className={className}
      readOnly
    />
  );
}

export default CSRFInput; 