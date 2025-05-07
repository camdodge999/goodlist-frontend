"use client";

import { useActionState as reactUseActionState } from "react";
import { useState, useCallback, useRef, useTransition, useEffect } from "react";
import type { ActionResponse } from "./index";

interface UseReactActionStateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  initialState?: T;
  debug?: boolean;
}

// Custom state type for internal handling
type ActionState<T> = {
  data: T | null;
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string[]>;
};

/**
 * A bridge hook that adapts our custom useActionState to React's official useActionState
 * while maintaining API compatibility with our existing code.
 */
export function useReactActionState<T = any>(
  action: ((formData: FormData) => Promise<ActionResponse>) | null | undefined,
  options: UseReactActionStateOptions<T> = {}
) {
  // Store the original action reference
  const actionRef = useRef<((formData: FormData) => Promise<ActionResponse>) | null | undefined>(action);
  
  // Initialize state for errors and messages
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Use React's built-in transition for isPending state
  const [isTransitionPending, startTransition] = useTransition();
  
  // Enable debugging
  const debug = options.debug || false;
  
  // Fallback action when the real one is not available
  const fallbackActionFn = useCallback(async (formData: FormData): Promise<ActionResponse> => {
    return {
      status: "error" as const,
      message: "Form processing is not available right now. Please try again later.",
    };
  }, []);
  
  // Update action reference when it changes, but don't cause re-renders
  useEffect(() => {
    actionRef.current = action;
    if (debug) {
      console.debug("Action reference updated", typeof action === 'function');
    }
  }, [action, debug]);
  
  // Initial state for the action
  const initialState: ActionState<T> = {
    data: options.initialState || null,
    status: 'idle'
  };
  
  // Create a properly typed action wrapper for React's useActionState
  const actionWrapper = useCallback(async (state: ActionState<T>, formData?: FormData) => {
    // Only proceed if we have form data
    if (!formData) {
      return state;
    }
    
    try {
      // Get the current action from ref to avoid closure issues
      const currentAction = actionRef.current;
      
      // Make sure we always have a valid function to call
      if (typeof currentAction !== 'function') {
        if (debug) {
          console.error("Action is not a function", currentAction);
        }
        // Use fallback action instead
        return fallbackActionFn(formData).then(response => {
          return {
            data: state.data,
            status: 'error' as const,
            message: response.message,
          };
        });
      }
      
      // Execute the action and get the response
      const response = await currentAction(formData);
      
      if (debug) {
        console.debug("Action response:", response);
      }
      
      // Process the response similar to our custom hook
      if (response.status === "success") {
        if ('message' in response && response.message) {
          setSuccessMessage(response.message);
        }
        setErrors(null);
        setErrorMessage(null);
        
        const newData = 'data' in response && response.data ? response.data as T : state.data;
        
        // Use a separate effect to handle success callbacks to avoid setState during render
        if (options.onSuccess) {
          // Schedule the callback to run after the render is complete
          setTimeout(() => {
            options.onSuccess?.(newData as T);
          }, 0);
        }
        
        return {
          data: newData,
          status: 'success' as const,
          message: response.message
        };
      } else {
        // Handle the error response, preserving Zod validation errors
        if ('errors' in response && response.errors) {
          setErrors(response.errors);
          if (debug) {
            console.debug("Validation errors:", response.errors);
          }
        }
        if ('message' in response && response.message) {
          setErrorMessage(response.message);
        }
        setSuccessMessage(null);
        
        // Use setTimeout to avoid setState during render for error callbacks
        if (options.onError) {
          setTimeout(() => {
            options.onError?.(response);
          }, 0);
        }
        
        // Important: Return the errors in the state so they can be displayed
        return {
          data: state.data,
          status: 'error' as const,
          message: response.message,
          errors: response.errors
        };
      }
    } catch (error) {
      if (debug) {
        console.error("Error executing action:", error);
      }
      const errorMsg = error instanceof Error ? error.message : "An unknown error occurred";
      setErrorMessage(errorMsg);
      setSuccessMessage(null);
      setErrors(null);
      
      // Use setTimeout to avoid setState during render for error callbacks
      if (options.onError) {
        setTimeout(() => {
          options.onError?.(error);
        }, 0);
      }
      
      return {
        data: state.data,
        status: 'error' as const,
        message: errorMsg
      };
    }
  }, [options, debug, fallbackActionFn]);
  
  // Use React's built-in useActionState with our wrapper
  const [state, formActionCallback, isPending] = reactUseActionState<ActionState<T>>(
    actionWrapper,
    initialState
  );
  
  // Log state changes for debugging
  useEffect(() => {
    if (debug && state) {
      console.debug("Form state updated:", state);
    }
  }, [state, debug]);
  
  // Create a proper formAction function that accepts FormData
  const formAction = useCallback((formData: FormData) => {
    // Just forward to the real formAction function returned by React's useActionState
    // This will be used in the form's action prop
    return formActionCallback();
  }, [formActionCallback]);
  
  // Create an execute function that mimics our old API but properly handles transitions
  const execute = useCallback(
    (formData: FormData) => {
      // Reset state before execution
      setErrors(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Validate FormData
      if (!formData || typeof formData !== 'object' || typeof formData.entries !== 'function') {
        const errorMsg = "Invalid FormData object provided";
        setErrorMessage(errorMsg);
        
        return Promise.resolve({
          status: "error" as const,
          message: errorMsg
        });
      }
      
      if (debug) {
        try {
          // Log form data in a safe way
          const entries = Array.from(formData.entries());
          console.debug("Executing action with formData entries:", entries);
        } catch (err) {
          console.error("Cannot read FormData entries:", err);
        }
      }
      
      // Important: We return a Promise that resolves after the transition is complete
      return new Promise<ActionResponse>((resolve) => {
        // Use startTransition to properly update React state
        startTransition(() => {
          // The execute function was previously calling formAction directly,
          // but we need to pass the formData as a closure variable
          // since React's useActionState doesn't forward arguments
          actionWrapper(state, formData).then((result) => {
            // Create a response object that matches our API
            if (result.status === 'error') {
              const response: ActionResponse = {
                status: "error",
                message: result.message || errorMessage || "An error occurred",
                errors: result.errors || (errors ? { ...errors } : undefined)
              };
              resolve(response);
            } else {
              const response: ActionResponse = {
                status: "success",
                data: result.data as any,
                message: result.message || (successMessage || undefined)
              };
              resolve(response);
            }
          }).catch((err) => {
            if (debug) {
              console.error("Error in execute:", err);
            }
            const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
            const response: ActionResponse = {
              status: "error",
              message: errorMsg,
            };
            
            resolve(response);
          });
        });
      });
    },
    [actionWrapper, state, errors, errorMessage, successMessage, startTransition, debug]
  );
  
  // Reset function to clear all state
  const reset = useCallback(() => {
    setErrors(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);
  
  // Return the same interface as our custom hook for compatibility
  return {
    execute,
    formAction,
    isPending: isPending || isTransitionPending, // Combine both pending states
    data: state.data,
    // Use type assertion to avoid TypeScript error
    errors: errors, // Prioritize our local errors state
    errorMessage: state.message || errorMessage,
    successMessage,
    reset,
    // For debugging
    _state: debug ? state : undefined,
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