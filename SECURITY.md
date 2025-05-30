# Security Implementation Guide

## Content Security Policy (CSP)

This project implements a comprehensive Content Security Policy to protect against:
- Cross-Site Scripting (XSS) attacks
- Code injection attacks
- Clickjacking
- Data injection
- Other malicious content

### CSP Implementation

The CSP is implemented in `src/middleware.ts` using nonces for dynamic content. The policy includes:

```
default-src 'self';
script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live;
style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' blob: data: https://images.unsplash.com https://api.goodlist2.chaninkrew.com;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://api.goodlist2.chaninkrew.com ${NEXT_PUBLIC_BACKEND_URL};
media-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
frame-src 'none';
upgrade-insecure-requests;
```

### Using Nonces in Components

For components that need to include inline scripts or styles, use the nonce utility:

```tsx
import { getNonce, getNonceProps } from '@/lib/nonce';
import Script from 'next/script';

// Using nonce with Next.js Script component
export default async function MyPage() {
  const nonce = await getNonce();
  
  return (
    <div>
      <Script
        src="https://example.com/script.js"
        strategy="afterInteractive"
        nonce={nonce}
      />
      
      {/* For inline styles */}
      <style {...await getNonceProps()} jsx>{`
        .my-class { color: red; }
      `}</style>
    </div>
  );
}
```

## Form Security

### CSRF Protection

All forms are protected against Cross-Site Request Forgery (CSRF) attacks using signed tokens.

**Implementation:**
- Automatic token generation in `SecureForm` component
- Token validation in API routes
- Token expiry (1 hour by default)

**Usage:**
```tsx
import { SecureForm } from '@/components/ui/secure-form';

function MyForm() {
  const handleSecureSubmit = async (formData: FormData, csrfToken: string) => {
    // Form data is automatically sanitized
    // CSRF token is validated
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    });
  };

  return (
    <SecureForm 
      onSecureSubmit={handleSecureSubmit}
      rateLimitKey="myform"
      sanitizationConfig={{
        email: { type: 'email', required: true, maxLength: 255 },
        name: { type: 'text', required: true, maxLength: 50 },
      }}
    >
      <input name="email" type="email" required />
      <input name="name" type="text" required />
      <button type="submit">Submit</button>
    </SecureForm>
  );
}
```

### Professional Rate Limiting

**🚀 Enhanced with [`limiter` Package](https://www.npmjs.com/package/limiter)**

Protection against spam and brute force attacks using enterprise-grade token bucket algorithms:

**Features:**
- ✅ **Token Bucket Algorithm** - More sophisticated than simple counters
- ✅ **5.6M+ Weekly Downloads** - Production-tested reliability  
- ✅ **Built-in TypeScript Support** - Full type safety
- ✅ **Burst Protection** - Allows short bursts while maintaining sustained limits
- ✅ **Async/Sync Methods** - Flexible usage patterns

**Default Limits:**
- **Login**: 5 attempts per minute
- **Registration**: 3 attempts per hour  
- **Password Reset**: 3 attempts per hour
- **Verification**: 2 attempts per hour
- **Reports**: 5 attempts per hour
- **Profile Updates**: 10 attempts per hour
- **General API**: 100 requests per minute

**API Route Implementation:**
```tsx
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  // Professional rate limiting with token bucket algorithm
  const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.LOGIN, 'login');
  
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { message: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.` },
      { status: 429 }
    );
  }
  
  // Process request...
}
```

**Advanced Features:**
```tsx
// Burst rate limiting - allows short bursts
import { createBurstRateLimiter } from '@/lib/rate-limiter';

const burstLimiter = createBurstRateLimiter(
  { tokensPerInterval: 10, interval: 'minute' },  // Sustained rate
  { tokensPerInterval: 20, interval: 10000 },     // Burst rate
  'api-endpoint'
);

// Synchronous (non-blocking) rate limiting for middleware
import { checkRateLimitSync } from '@/lib/rate-limiter';

const result = checkRateLimitSync(request, RATE_LIMITS.API_GENERAL);
```

### Input Sanitization

Automatic sanitization prevents XSS and injection attacks:

**Features:**
- HTML entity escaping
- SQL injection pattern detection
- XSS pattern detection
- Type-specific sanitization (email, phone, filename)
- Length validation

**Manual Usage:**
```tsx
import { sanitizeFormData, validateAndSanitizeInput } from '@/lib/input-sanitizer';

// Sanitize individual input
const result = validateAndSanitizeInput(userInput, {
  type: 'email',
  maxLength: 255
});

// Sanitize form data object
const formResult = sanitizeFormData(formData, {
  email: { type: 'email', required: true },
  description: { maxLength: 500, allowHtml: false }
});
```

### Bot Protection

**Honeypot Fields:**
- Hidden fields that bots typically fill out
- Automatic rejection of submissions with filled honeypots

**Implementation:** Automatically included in `SecureForm` component.

## Additional Security Headers

The following security headers are also implemented:

- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **Permissions-Policy**: Restricts access to browser features
- **Strict-Transport-Security** (Production): Enforces HTTPS connections

## Environment Variables

Add these security-related environment variables:

```bash
# Security
CSRF_SECRET=your-csrf-secret-here-change-this-in-production

# Make sure these are also set
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_BACKEND_URL=https://your-backend-api.com
```

## Troubleshooting Security Issues

### Common CSP Violations and Solutions:

1. **Inline Script Violations**
   ```
   Error: Refused to execute inline script because it violates CSP directive
   ```
   **Solution**: Use the nonce in your script tags or move scripts to external files.

2. **Style Violations**
   ```
   Error: Refused to apply inline style because it violates CSP directive
   ```
   **Solution**: Use the nonce for inline styles or move styles to CSS files.

3. **External Resource Violations**
   ```
   Error: Refused to load resource because it violates CSP directive
   ```
   **Solution**: Add the domain to the appropriate CSP directive in middleware.ts.

### CSRF Token Issues:

1. **Token Expired**
   ```
   Error: Invalid or missing CSRF token
   ```
   **Solution**: Tokens expire after 1 hour. Refresh the page to get a new token.

2. **Missing Token in API**
   ```
   Error: CSRF validation failed
   ```
   **Solution**: Ensure you're using `SecureForm` or manually include CSRF token in headers.

### Rate Limiting Issues:

1. **Too Many Requests**
   ```
   Error: Rate limit exceeded
   ```
   **Solution**: Wait for the specified retry-after time or contact support if legitimate.

2. **Token Bucket Exhausted**
   ```
   Error: No tokens available
   ```
   **Solution**: The token bucket algorithm ensures smooth rate limiting. Wait for tokens to refill.

## Updating CSP for New Resources

When adding new external resources, update the CSP in `src/middleware.ts`:

```typescript
// For new image sources
img-src 'self' blob: data: https://images.unsplash.com https://new-image-domain.com;

// For new API endpoints
connect-src 'self' https://api.goodlist2.chaninkrew.com https://new-api-domain.com;

// For new font sources
font-src 'self' https://fonts.gstatic.com https://new-font-domain.com;
```

## Security Testing

Test your security implementation:

1. **CSP Testing**
   - Open browser developer tools
   - Check Console for CSP violations
   - Verify all resources load correctly

2. **CSRF Testing**
   - Try submitting forms without tokens
   - Test with expired tokens
   - Verify protection works

3. **Rate Limiting Testing**
   - Submit forms rapidly to trigger limits
   - Verify proper error responses
   - Check rate limit headers
   - Test token bucket refill behavior

4. **Input Sanitization Testing**
   - Try submitting malicious payloads
   - Test XSS attempts
   - Verify sanitization works

5. **Security Scanners**
   - OWASP ZAP
   - Mozilla Observatory
   - CSP Evaluator

## Best Practices

1. **Always use `SecureForm`** for user-facing forms
2. **Implement rate limiting** on all API endpoints
3. **Validate and sanitize** all user inputs
4. **Monitor security violations** in production
5. **Regularly update** security dependencies
6. **Use HTTPS** in production
7. **Set strong CSRF secrets** in production
8. **Monitor rate limit logs** for abuse patterns
9. **Use appropriate rate limit intervals** for different operations
10. **Leverage token bucket algorithms** for smoother user experience

## Production Checklist

- [ ] Set strong `CSRF_SECRET` environment variable
- [ ] Enable HTTPS and HSTS headers
- [ ] Configure production rate limits with `limiter` package
- [ ] Set up security monitoring and logging
- [ ] Test all security measures thoroughly
- [ ] Document security procedures for team
- [ ] Train team on security practices
- [ ] Monitor rate limiting metrics and adjust as needed

## Resources

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Limiter Package Documentation](https://www.npmjs.com/package/limiter) 