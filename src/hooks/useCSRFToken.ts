"use client";

import { useState, useEffect } from 'react';
import { getCSRFTokenFromBrowser, CSRF_CONFIG } from '@/lib/csrf-utils';

interface UseCSRFTokenReturn {
  token: string | null;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
  getTokenForRequest: () => string | undefined;
}

/**
 * Hook to manage CSRF tokens in React components
 */
export function useCSRFToken(): UseCSRFTokenReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchToken = async () => {
    try {
      setIsLoading(true);
      
      // Only run on client side to prevent hydration mismatch
      if (typeof window === 'undefined') {
        setToken(null);
        return;
      }

      // Try to get token from browser cookies first
      const browserToken = getCSRFTokenFromBrowser();
      if (browserToken) {
        setToken(browserToken);
        return;
      }

      // If no token in cookies, fetch from API to generate one
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
      } else {
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Use useEffect to prevent hydration mismatch
  useEffect(() => {
    fetchToken();
  }, []);

  const refreshToken = async () => {
    await fetchToken();
  };

  const getTokenForRequest = () => {
    return token || undefined;
  };

  return {
    token,
    isLoading,
    refreshToken,
    getTokenForRequest,
  };
}

/**
 * Hook to automatically include CSRF token in form submissions
 */
export function useCSRFForm() {
  const { token, isLoading, getTokenForRequest } = useCSRFToken();

  const addCSRFToFormData = (formData: FormData): FormData => {
    const csrfToken = getTokenForRequest();
    if (csrfToken) {
      formData.append('csrfToken', csrfToken);
    }
    return formData;
  };

  const addCSRFToJSON = (data: Record<string, unknown>): Record<string, unknown> => {
    const csrfToken = getTokenForRequest();
    if (csrfToken) {
      return { ...data, csrfToken };
    }
    return data;
  };

  const getCSRFHeaders = (): Record<string, string> => {
    const csrfToken = getTokenForRequest();
    if (csrfToken) {
      return { [CSRF_CONFIG.headerName]: csrfToken };
    }
    return {};
  };

  return {
    token,
    isLoading,
    addCSRFToFormData,
    addCSRFToJSON,
    getCSRFHeaders,
    getTokenForRequest,
  };
} 