# Form Actions Utilities

This directory contains utilities for handling form submissions using Next.js Server Actions with Zod validation.

## Overview

The utilities in this directory allow you to:

1. Create type-safe server actions with Zod validation
2. Handle form state (loading, validation errors, success/error messages)
3. Easily integrate server-side validation with your forms

## Files

- `index.ts`: Core utilities for creating server actions
- `useActionState.ts`: Client-side hook for managing form state

## Usage

### 1. Define Your Zod Schemas

First, define your Zod validation schemas in a separate file:

```ts
// validators/user.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

### 2. Create Server Actions

Create server actions using the `createFormAction` utility:

```ts
// app/api/auth/actions.ts
"use server";

import { createFormAction } from "@/utils/forms";
import { loginSchema } from "@/validators/user.schema";

export const loginAction = createFormAction(
  loginSchema,
  async (data) => {
    try {
      // Your authentication logic here
      const result = await serverSignIn({
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        return {
          status: "error",
          message: "Invalid email or password",
        };
      }

      return {
        status: "success",
        message: "Login successful",
      };
    } catch (error) {
      return {
        status: "error",
        message: "An error occurred",
      };
    }
  }
);
```

### 3. Use the Action in Your Form

Use the `useActionState` hook to manage form state:

```tsx
// components/LoginForm.tsx
"use client";

import { useActionState, getFieldError } from "@/utils/forms/useActionState";
import { loginAction } from "@/app/api/auth/actions";

export default function LoginForm() {
  const { 
    execute, 
    isPending, 
    errors, 
    errorMessage,
    successMessage
  } = useActionState(loginAction, {
    onSuccess: () => {
      // Handle success
    },
    onError: () => {
      // Handle error
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await execute(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input 
          id="email" 
          name="email" 
          className={getFieldError("email", errors) ? "error" : ""}
        />
        {getFieldError("email", errors) && (
          <p className="error">{getFieldError("email", errors)}</p>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input 
          id="password" 
          name="password" 
          type="password"
          className={getFieldError("password", errors) ? "error" : ""}
        />
        {getFieldError("password", errors) && (
          <p className="error">{getFieldError("password", errors)}</p>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## Common Issues and Solutions

### "Server Actions must be async functions"

Next.js Server Actions require that the exported functions be async functions. This means you need to properly structure your server action exports.

**Solution:**

Our utility creates proper async functions by:

1. Using `createServerAction` as an async function that handles the validation and action execution
2. Using `createFormAction` as a factory function that returns an async function

```ts
// This is how our utilities work:
export async function createServerAction<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T,
  action: (validData: z.infer<T>) => Promise<ActionResponse>
): Promise<ActionResponse> {
  // Validation and execution logic...
}

export function createFormAction<T extends z.ZodTypeAny>(
  schema: T,
  actionFn: (validData: z.infer<T>) => Promise<ActionResponse>
) {
  return async function(formData: FormData): Promise<ActionResponse> {
    return createServerAction(formData, schema, actionFn);
  }
}
```

### Client Components vs Server Actions

Remember that:

1. You can't import a Server Action directly into a client component from a `"use server"` file
2. You must make sure all Server Actions are properly async functions
3. Client-side libraries like `next-auth/react` can't be used in Server Actions

## Benefits

1. **Type Safety**: Full type safety with Zod schema validation
2. **Server-Side Validation**: Data is validated on the server
3. **Better UX**: Proper loading states and error handling
4. **Reduced Client-Side Code**: Move validation logic to the server
5. **Progressive Enhancement**: Forms work without JavaScript 