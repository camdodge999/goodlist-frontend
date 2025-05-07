"use client";

import { useState, FormEvent, useEffect } from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";

/**
 * Example component demonstrating the use of React's useActionState hook
 * with Next.js Server Actions directly
 */
export default function DirectReactActionStateExample() {
  const [action, setAction] = useState<any>(null);

  // Dynamically import the action to avoid the Promise issue
  useEffect(() => {
    const loadAction = async () => {
      const { loginAction } = await import("@/app/api/auth/actions");
      setAction(loginAction);
    };
    loadAction();
  }, []);
  
  // Define a function that processes the form data and passes it to the server action
  const processFormWithAction = async (prevState: any, formData: FormData) => {
    if (!action) {
      return {
        success: false,
        message: "Action not loaded",
        errors: {}
      };
    }
    
    const response = await action(formData);
    
    if (response.status === "error") {
      return {
        success: false,
        message: response.message,
        errors: response.errors || {}
      };
    }
    
    return {
      success: true,
      message: response.message || "Login successful",
      data: response.data
    };
  };
  
  // Use React's useActionState hook
  const [state, formAction, isPending] = useActionState(
    processFormWithAction, 
    { success: false, message: "", errors: {} }
  );
  
  // Get the error message for a field
  const getFieldError = (fieldName: string): string | null => {
    if (!state?.errors || !state.errors[fieldName] || state.errors[fieldName].length === 0) {
      return null;
    }
    return state.errors[fieldName][0];
  };
  
  return (
    <div className="max-w-md w-full bg-white/90 p-8 rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">React useActionState Example</h2>
      
      {state?.message && (
        <div className={`p-3 mb-4 rounded ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {state.message}
        </div>
      )}
      
      <form action={formAction}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className={getFieldError("email") ? "border-red-500" : ""}
          />
          {getFieldError("email") && (
            <p className="mt-1 text-sm text-red-500">{getFieldError("email")}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            className={getFieldError("password") ? "border-red-500" : ""}
          />
          {getFieldError("password") && (
            <p className="mt-1 text-sm text-red-500">{getFieldError("password")}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isPending || !action} 
          variant="primary"
          className="w-full"
        >
          {isPending && <Spinner className="mr-2" />}
          {isPending ? "Logging in..." : "Login"}
        </Button>
        
        {state?.success && state?.data?.redirect && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Redirect to: {state.data.redirect}
          </p>
        )}
      </form>
    </div>
  );
} 