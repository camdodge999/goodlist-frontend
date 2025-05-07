# Using React's `useActionState` with Next.js Server Actions

This guide explains how to use React's official `useActionState` hook with Next.js Server Actions and Zod validation.

## What is `useActionState`?

React's `useActionState` is a built-in hook that updates state based on the result of a form action. It provides:

1. Server-side validation with client-side state updates
2. Form state management (pending, errors, success)
3. Progressive enhancement (forms work without JavaScript)

## Our Implementation

We've created two approaches for using `useActionState` in this project:

### 1. Direct Use of React's `useActionState`

This approach uses React's built-in hook directly:

```tsx
"use client";

import { useActionState } from "react";
import { useState, useEffect } from "react";

export default function LoginForm() {
  const [action, setAction] = useState<any>(null);

  // Dynamically import the action to avoid Promise issues
  useEffect(() => {
    const loadAction = async () => {
      const { loginAction } = await import("@/app/api/auth/actions");
      setAction(loginAction);
    };
    loadAction();
  }, []);

  // Create a server action wrapper function
  const processFormAction = async (prevState: any, formData: FormData) => {
    if (!action) return prevState;
    
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
      message: response.message || "Success",
      data: response.data
    };
  };
  
  // Use React's built-in hook
  const [state, formAction, isPending] = useActionState(
    processFormAction, 
    { success: false, message: "", errors: {} }
  );
  
  return (
    <form action={formAction}>
      {/* Form fields */}
      <button type="submit" disabled={isPending || !action}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### 2. Bridge Hook for Backwards Compatibility

We've created a bridge hook called `useReactActionState` that maintains our existing API while using React's official hook internally:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useReactActionState } from "@/utils/forms/useReactActionState";

export default function LoginForm() {
  const [action, setAction] = useState<any>(null);

  // Dynamically import the action to avoid Promise issues
  useEffect(() => {
    const loadAction = async () => {
      const { loginAction } = await import("@/app/api/auth/actions");
      setAction(loginAction);
    };
    loadAction();
  }, []);

  const { 
    execute, 
    isPending, 
    errors, 
    errorMessage,
    successMessage 
  } = useReactActionState(action || (async () => ({ status: "error", message: "Action not loaded" })), {
    onSuccess: (data) => {
      // Handle success
    },
    onError: () => {
      // Handle error
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!action) return;
    
    const formData = new FormData(e.currentTarget);
    await execute(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isPending || !action}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## Common Issues and Solutions

### 1. Async Function Warning

If you see this warning:

```
An async function with useActionState was called outside of a transition. This is likely not what you intended (for example, isPending will not update correctly). Either call the returned function inside startTransition, or pass it to an `action` or `formAction` prop.
```

This occurs because React transitions are designed for synchronous state updates, but we need to handle async operations in our server actions. The solution is:

1. Use the `startTransition` function properly with async operations
2. Return a Promise from the execute function that resolves when the transition completes

### 2. Promise of a Function Issue

If you see an error like:

```
Argument of type 'Promise<(formData: FormData) => Promise<ActionResponse>>' is not assignable to parameter of type '(formData: FormData) => Promise<ActionResponse>'.
```

This occurs because importing server actions directly can return a Promise of a function rather than the function itself. To fix this:

1. Don't import server actions at the module level in client components
2. Use dynamic imports with useEffect to get the actual action function
3. Store the imported action in component state
4. Use a fallback action when the actual action is not loaded yet

## Server Actions Configuration

Our server actions are built with Zod validation:

```ts
"use server";

import { z } from "zod";
import { createFormAction } from "@/utils/forms";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const loginAction = createFormAction(
  loginSchema,
  async (data) => {
    try {
      // Authentication logic
      return {
        status: "success",
        message: "Login successful",
        data: { redirect: "/dashboard" }
      };
    } catch (error) {
      return {
        status: "error",
        message: "Authentication failed",
      };
    }
  }
);
```

## Key Benefits

1. **Type Safety**: Full type safety with Zod schema validation
2. **Server-Side Validation**: Data is validated on the server
3. **Progressive Enhancement**: Forms work without JavaScript
4. **Built-in State Management**: Pending states, error handling, etc.
5. **React Official API**: Using React's recommended pattern

## Migrating from Custom useActionState

If you're migrating from our custom `useActionState` hook to React's official hook:

1. Import `useReactActionState` instead of `useActionState`
2. Keep the same function signature and options
3. Dynamically import server actions to avoid Promise issues
4. Everything else remains the same

```diff
- import { useActionState } from "@/utils/forms/useActionState";
+ import { useReactActionState } from "@/utils/forms/useReactActionState";
+ import { useState, useEffect } from "react";

+ const [action, setAction] = useState(null);
+ 
+ useEffect(() => {
+   const loadAction = async () => {
+     const { someAction } = await import("@/app/actions");
+     setAction(someAction);
+   };
+   loadAction();
+ }, []);

const { 
  execute, 
  isPending, 
  errors 
- } = useActionState(someAction, {
+ } = useReactActionState(action || fallbackAction, {
  onSuccess: () => { /* ... */ },
  onError: () => { /* ... */ }
});
```

## Further Reading

- [React useActionState Documentation](https://react.dev/reference/react/useActionState)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Zod Documentation](https://zod.dev/) 