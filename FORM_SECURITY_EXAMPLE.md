# Form Security Implementation Example

This document shows how to convert your existing forms to use the new secure form component with comprehensive security features.

## Before: Traditional Form (Vulnerable)

```tsx
// Old vulnerable form
export default function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Direct submission without security measures
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <input 
        type="password" 
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## After: Secure Form (Protected)

```tsx
// New secure form with comprehensive protection
import { SecureForm } from '@/components/ui/secure-form';
import { useState } from 'react';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSecureSubmit = async (formData: FormData, csrfToken: string) => {
    try {
      setError('');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData, // Already sanitized by SecureForm
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result = await response.json();
      setSuccess('Login successful!');
      
      // Redirect or handle success
      window.location.href = '/dashboard';
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div>
      <SecureForm 
        onSecureSubmit={handleSecureSubmit}
        rateLimitKey="login"
        sanitizationConfig={{
          email: { 
            type: 'email', 
            required: true, 
            maxLength: 255 
          },
          password: { 
            type: 'text', 
            required: true, 
            maxLength: 128 
          },
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            name="email"
            type="email" 
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            name="password"
            type="password" 
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button 
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </SecureForm>

      {error && (
        <div className="mt-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-2 bg-green-50 border border-green-200 text-green-600 rounded">
          {success}
        </div>
      )}
    </div>
  );
}
```

## Converting Your Verification Form

Here's how to convert your existing `VerificationForm` to use secure practices:

```tsx
// Updated VerificationForm with security
import { SecureForm } from '@/components/ui/secure-form';
import { FileInput } from './FileInput';

export default function VerificationForm({ onSubmit }: { onSubmit: (data: FormData) => Promise<void> }) {
  const handleSecureSubmit = async (formData: FormData, csrfToken: string) => {
    // Add CSRF token to headers when calling your API
    await fetch('/api/user/verify', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData, // Already sanitized
    });
  };

  return (
    <SecureForm
      onSecureSubmit={handleSecureSubmit}
      rateLimitKey="verification"
      sanitizationConfig={{
        storeName: { type: 'text', required: true, maxLength: 100 },
        email: { type: 'email', required: true, maxLength: 255 },
        bankAccount: { type: 'text', required: true, maxLength: 50 },
        taxPayerId: { type: 'text', maxLength: 50 },
        description: { type: 'text', required: true, maxLength: 1000 },
        'contactInfo.line': { type: 'text', required: true, maxLength: 50 },
        'contactInfo.facebook': { type: 'text', required: true, maxLength: 100 },
        'contactInfo.phone': { type: 'phone', required: true, maxLength: 20 },
        'contactInfo.address': { type: 'text', required: true, maxLength: 500 },
        'contactInfo.other': { type: 'text', maxLength: 200 },
      }}
      className="space-y-6"
    >
      {/* Your existing form fields */}
      <input name="storeName" type="text" required />
      <input name="email" type="email" required />
      <input name="bankAccount" type="text" required />
      <input name="taxPayerId" type="text" />
      <textarea name="description" required />
      
      {/* Contact info fields */}
      <input name="contactInfo.line" type="text" required />
      <input name="contactInfo.facebook" type="text" required />
      <input name="contactInfo.phone" type="tel" required />
      <textarea name="contactInfo.address" required />
      <input name="contactInfo.other" type="text" />
      
      {/* File inputs */}
      <FileInput name="imageStore" accept="image/*" required />
      <FileInput name="imageIdCard" accept="image/*" required />
      <FileInput name="certIncrop" accept=".pdf" />
      
      <button type="submit">Submit Verification</button>
    </SecureForm>
  );
}
```

## API Route Security (Enhanced)

Your API routes should implement all security measures:

```tsx
// /api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFMiddleware } from '@/lib/csrf';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { sanitizeFormData } from '@/lib/input-sanitizer';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResult = checkRateLimit(request, RATE_LIMITS.LOGIN, 'login');
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { message: `Too many login attempts. Try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    // 2. Get request data
    const formData = await request.formData();
    const csrfToken = request.headers.get('x-csrf-token');

    // 3. CSRF validation
    if (!validateCSRFMiddleware(csrfToken)) {
      return NextResponse.json(
        { message: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // 4. Honeypot check
    if (formData.get('website')) {
      return NextResponse.json(
        { message: 'Invalid request' },
        { status: 400 }
      );
    }

    // 5. Input sanitization
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const sanitizationResult = sanitizeFormData(rawData, {
      email: { type: 'email', required: true, maxLength: 255 },
      password: { type: 'text', required: true, maxLength: 128 },
    });

    if (!sanitizationResult.isValid) {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 }
      );
    }

    // 6. Process login with sanitized data
    const { email, password } = sanitizationResult.sanitized;
    
    // Your authentication logic here
    const result = await authenticateUser(email, password);

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Security Benefits

### What We've Added:

1. **CSRF Protection** - Prevents cross-site request forgery
2. **Rate Limiting** - Stops brute force and spam attacks  
3. **Input Sanitization** - Prevents XSS and injection attacks
4. **Bot Protection** - Honeypot fields catch automated submissions
5. **Validation** - Ensures data integrity and format
6. **Error Handling** - Secure error messages without information leakage

### Key Improvements:

- ✅ **Automatic security** - No manual token handling needed
- ✅ **Input sanitization** - All form data is automatically cleaned
- ✅ **Rate limiting** - Built-in protection against abuse
- ✅ **Type safety** - TypeScript support for all security features
- ✅ **User feedback** - Clear error messages and loading states
- ✅ **Accessibility** - Proper ARIA labels and semantic HTML

## Migration Checklist

For each form in your application:

- [ ] Replace `<form>` with `<SecureForm>`
- [ ] Update submit handler to use `onSecureSubmit`
- [ ] Configure sanitization rules for each field
- [ ] Add rate limiting key for the form type
- [ ] Update API route to validate CSRF tokens
- [ ] Add rate limiting to API route
- [ ] Test security features work correctly
- [ ] Update form validation to work with sanitized data

## Testing Your Secure Forms

1. **Test CSRF Protection:**
   ```bash
   # Try submitting without CSRF token
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

2. **Test Rate Limiting:**
   ```bash
   # Submit multiple requests rapidly
   for i in {1..10}; do
     curl -X POST http://localhost:3000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","password":"wrong"}'
   done
   ```

3. **Test Input Sanitization:**
   ```bash
   # Try submitting malicious payload
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"<script>alert(1)</script>","password":"password"}'
   ```

All these tests should fail with appropriate error messages, confirming your security measures are working. 