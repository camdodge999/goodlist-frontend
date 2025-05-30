"use client";

import React, { useEffect, useState, FormEvent } from 'react';
import { generateCSRFToken } from '@/lib/csrf';
import { sanitizeFormData } from '@/lib/input-sanitizer';

interface SecureFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSecureSubmit: (sanitizedData: FormData, csrfToken: string) => Promise<void>;
  sanitizationConfig?: Record<string, {
    maxLength?: number;
    allowHtml?: boolean;
    type?: 'text' | 'email' | 'phone' | 'filename';
    required?: boolean;
  }>;
  rateLimitKey?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SecureForm({
  onSecureSubmit,
  sanitizationConfig = {},
  rateLimitKey,
  children,
  disabled = false,
  ...formProps
}: SecureFormProps) {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting || disabled) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Convert FormData to object for sanitization
      const formObject: Record<string, string | File> = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          formObject[key] = value;
        } else if (value instanceof File) {
          formObject[key] = value; // Keep files as-is
        }
      }

      // Sanitize form data
      const sanitizationResult = sanitizeFormData(formObject, sanitizationConfig);
      
      if (!sanitizationResult.isValid) {
        const errorMessages = Object.values(sanitizationResult.errors)
          .flat()
          .join(', ');
        throw new Error(`Form validation failed: ${errorMessages}`);
      }

      // Create new FormData with sanitized values
      const sanitizedFormData = new FormData();
      for (const [key, value] of Object.entries(sanitizationResult.sanitized)) {
        if (value instanceof File) {
          sanitizedFormData.append(key, value);
        } else {
          sanitizedFormData.append(key, String(value));
        }
      }

      // Add CSRF token
      sanitizedFormData.append('_csrf', csrfToken);

      // Add rate limit key if provided
      if (rateLimitKey) {
        sanitizedFormData.append('_rateLimitKey', rateLimitKey);
      }

      await onSecureSubmit(sanitizedFormData, csrfToken);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form {...formProps} onSubmit={handleSubmit}>
        {/* Hidden CSRF token field */}
        <input type="hidden" name="_csrf" value={csrfToken} />
        
        {/* Honeypot field for bot detection */}
        <input
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          className="absolute -left-[9999px] opacity-0 pointer-events-none"
          aria-hidden="true"
        />
        
        {children}
        
        {error && (
          <div className="text-sm text-red-600 mt-2 p-2 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
      </form>
      
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook to get CSRF token for manual form handling
 */
export function useCSRFToken() {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
  }, []);

  return csrfToken;
} 