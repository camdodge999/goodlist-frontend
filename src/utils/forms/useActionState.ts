"use client";

import { useState, useCallback, useTransition, startTransition as reactStartTransition } from "react";
import type { ActionResponse } from "./index";

interface UseActionStateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  initialState?: T;
}

/**
 * A custom hook for managing form state with server actions
 */
export function useActionState<T = any>(
  action: (formData: FormData) => Promise<ActionResponse>,
  options: UseActionStateOptions<T> = {}
) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<T | null>(options.initialState || null);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const execute = useCallback(
    async (formData: FormData) => {
      setErrors(null);
      setErrorMessage(null);
      setSuccessMessage(null);

      let response: ActionResponse;
      
      reactStartTransition(() => {
        setData(null);
      });
      
      try {
        response = await action(formData);

        if (response.status === "success") {
          reactStartTransition(() => {
            if ('data' in response && response.data) {
              setData(response.data as T);
            }
            if ('message' in response && response.message) {
              setSuccessMessage(response.message);
            }
          });
          
          if (options.onSuccess) {
            options.onSuccess('data' in response ? response.data as T : null as unknown as T);
          }
        } else {
          reactStartTransition(() => {
            if ('errors' in response && response.errors) {
              setErrors(response.errors);
            }
            if ('message' in response && response.message) {
              setErrorMessage(response.message);
            }
          });
          
          if (options.onError) {
            options.onError(response);
          }
        }

        return response;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "An unknown error occurred";
        
        reactStartTransition(() => {
          setErrorMessage(errorMsg);
        });
        
        if (options.onError) {
          options.onError(error);
        }
        
        return {
          status: "error" as const,
          message: errorMsg,
        };
      }
    },
    [action, options]
  );

  const reset = useCallback(() => {
    setData(options.initialState || null);
    setErrors(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [options.initialState]);

  return {
    execute,
    isPending,
    data,
    errors,
    errorMessage,
    successMessage,
    reset,
  };
}

/**
 * Helper function to extract field error message
 */
export function getFieldError(
  fieldName: string,
  errors: Record<string, string[]> | null
): string | null {
  if (!errors || !errors[fieldName] || errors[fieldName].length === 0) {
    return null;
  }
  return errors[fieldName][0];
} 