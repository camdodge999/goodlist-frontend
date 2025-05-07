"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

/**
 * Creates a server action for form handling with Zod validation
 * @param schema The Zod schema to validate the form data
 * @param action The action function to execute if validation passes
 */
export async function createServerAction<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T,
  action: (validData: z.infer<T>) => Promise<ActionResponse>
): Promise<ActionResponse> {
  // Convert FormData to plain object
  const data = Object.fromEntries(formData.entries());
  
  // Parse with Zod schema
  const result = schema.safeParse(data);
  
  if (!result.success) {
    // Return validation errors
    return {
      status: "error",
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Validation error",
    };
  }
  
  try {
    // Execute the action with validated data
    return await action(result.data);
  } catch (error) {
    // Handle any errors from the action
    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Creates a server action with zod validation
 */
export async function createFormAction<T extends z.ZodTypeAny>(
  schema: T,
  actionFn: (validData: z.infer<T>) => Promise<ActionResponse>
) {
  return async function(formData: FormData): Promise<ActionResponse> {
    return createServerAction(formData, schema, actionFn);
  }
}

/**
 * Custom hook for handling form submission with server actions
 * @param action The server action created with createFormAction
 * @param options Additional options like redirection
 */
export async function useServerAction<T>(
  action: (formData: FormData) => Promise<ActionResponse>,
  options?: {
    onSuccess?: (data: any) => void;
    redirectTo?: string;
  }
) {
  const execute = async (formData: FormData) => {
    const response = await action(formData);
    
    if (response.status === "success") {
      if (options?.onSuccess) {
        options.onSuccess(response.data);
      }
      
      if (options?.redirectTo) {
        redirect(options.redirectTo);
      }
    }
    
    return response;
  };
  
  return { execute };
}

/**
 * Types for action responses
 */
export type ActionResponse = 
  | {
      status: "success";
      data?: any;
      message?: string;
    }
  | {
      status: "error";
      errors?: Record<string, string[]>;
      message: string;
    }; 