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

  const fetchToken = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // First try to get from existing cookies
      const existingToken = getCSRFTokenFromBrowser();
      if (existingToken) {
        setToken(existingToken);
        setIsLoading(false);
        return;
      }

      // If no token exists, fetch from API to generate one
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
      } else {
        console.warn('Failed to fetch CSRF token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    await fetchToken();
  };

  const getTokenForRequest = (): string | undefined => {
    return token ?? getCSRFTokenFromBrowser();
  };

  useEffect(() => {
    fetchToken();
  }, []);

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