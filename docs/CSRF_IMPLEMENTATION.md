# CSRF Token Implementation Guide

This guide explains how to use the comprehensive CSRF protection system implemented in the application.

## Overview

The CSRF protection system automatically generates and validates CSRF tokens for all forms and API requests. It includes:

- Automatic token generation and cookie management
- React hooks for easy integration
- Middleware protection for API routes
- Reusable components for forms

## Components

### 1. CSRF Utilities (`src/lib/csrf-utils.ts`)
Core utilities for token generation, validation, and middleware protection.

### 2. React Hooks (`src/hooks/useCSRFToken.ts`)
- `useCSRFToken()` - Basic token management
- `useCSRFForm()` - Enhanced form integration

### 3. UI Components (`src/components/ui/csrf-input.tsx`)
- `<CSRFInput />` - Hidden input for forms

### 4. API Route (`src/app/api/csrf-token/route.ts`)
- GET: Retrieve or generate token
- POST: Refresh token

## Usage Examples

### Basic Form with CSRF Protection

```tsx
import CSRFInput from "@/components/ui/csrf-input";

function MyForm() {
  return (
    <form onSubmit={handleSubmit}>
      <CSRFInput />
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Advanced Form with Hook

```tsx
import { useCSRFForm } from "@/hooks/useCSRFToken";

function AdvancedForm() {
  const { addCSRFToJSON, getCSRFHeaders, isLoading } = useCSRFForm();

  const handleSubmit = async (data: FormData) => {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCSRFHeaders(),
      },
      body: JSON.stringify(addCSRFToJSON({ email, password })),
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### FormData Example

```tsx
import { useCSRFForm } from "@/hooks/useCSRFToken";

function FileUploadForm() {
  const { addCSRFToFormData } = useCSRFForm();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const protectedFormData = addCSRFToFormData(formData);

    await fetch('/api/upload', {
      method: 'POST',
      body: protectedFormData,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  );
}
```

## API Route Protection

The middleware automatically protects API routes. To skip CSRF for specific routes, add them to the `skipCSRFPaths` array in `middleware.ts`:

```typescript
const skipCSRFPaths = [
  '/api/csrf-token',
  '/api/auth/session',
  '/api/public-endpoint', // Add your public endpoints here
];
```

## Server-Side Usage

```typescript
import { getCSRFTokenFromCookies, validateCSRFToken } from '@/lib/csrf-utils';

export async function POST(request: NextRequest) {
  const cookieToken = getCSRFTokenFromCookies();
  const requestToken = request.headers.get('X-CSRF-Token');
  
  if (!validateCSRFToken(cookieToken, requestToken)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }
  
  // Process request...
}
```

## Configuration

CSRF settings can be modified in `src/lib/csrf-utils.ts`:

```typescript
export const CSRF_CONFIG = {
  tokenName: 'next-auth.csrf-token',
  headerName: 'X-CSRF-Token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
  },
  tokenLength: 32,
} as const;
```

## Security Features

1. **Automatic Token Generation**: Tokens are generated on first visit
2. **Constant-Time Comparison**: Prevents timing attacks
3. **Secure Cookie Settings**: HttpOnly, SameSite, Secure flags
4. **Method-Based Protection**: Only validates for state-changing methods
5. **Multiple Token Sources**: Supports headers, form data, and JSON body

## Integration with NextAuth

The CSRF system integrates seamlessly with NextAuth. The login form automatically includes CSRF protection:

```tsx
// Already implemented in LoginForm component
<form onSubmit={handleSubmit}>
  <CSRFInput />
  {/* Other form fields */}
</form>
```

## Troubleshooting

### Token Not Found
- Ensure cookies are enabled
- Check if the `/api/csrf-token` endpoint is accessible
- Verify middleware configuration

### Validation Failures
- Check if token is included in request (header or body)
- Verify token format and length
- Ensure cookies are being sent with requests

### Development Issues
- CSRF validation is active in all environments
- Check browser developer tools for CSRF-related errors
- Verify middleware is running for your routes

## Best Practices

1. Always use `<CSRFInput />` in forms
2. Use `useCSRFForm()` hook for complex scenarios
3. Include CSRF headers in AJAX requests
4. Test CSRF protection in your API routes
5. Monitor CSRF validation failures in logs 