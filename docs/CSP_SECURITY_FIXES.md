# CSP Security Fixes Documentation

## Overview

This document outlines the Content Security Policy (CSP) security fixes implemented to address the medium-risk vulnerabilities identified in the security scan report, including the "Content Security Policy (CSP) Header Not Set" issue.

## Issues Fixed

### 1. Content Security Policy (CSP) Header Not Set ✅
**Issue**: CSP headers were not being set on all routes due to middleware matcher configuration
**Fix**: 
- Updated middleware matcher to include all routes (including API routes)
- Implemented proper nonce generation following Next.js best practices
- Added fallback CSP configuration in next.config.ts
- Created nonce utilities for Server Components

### 2. CSP: Failure to Define Directive with No Fallback ✅
**Issue**: Missing `form-action` directive which has no fallback to `default-src`
**Fix**: Added `'form-action': 'self'` to all CSP configurations
**Impact**: Prevents form submissions to unauthorized domains

### 3. CSP: script-src unsafe-eval ✅
**Issue**: Using `'unsafe-eval'` in script-src directive
**Fix**: 
- Removed `'unsafe-eval'` from production CSP
- Only allowed in development environment for hot reload
- Implemented nonce-based script loading for production

### 4. CSP: script-src unsafe-inline ✅
**Issue**: Using `'unsafe-inline'` in script-src directive
**Fix**:
- Removed `'unsafe-inline'` from production CSP
- Only allowed in development environment
- Implemented nonce-based and `'strict-dynamic'` for production

### 5. CSP: style-src unsafe-inline ✅
**Issue**: Using `'unsafe-inline'` in style-src directive
**Fix**:
- Removed `'unsafe-inline'` from production CSP
- Only allowed in development environment
- Implemented nonce-based style loading for production

## Implementation Details

### Files Modified

1. **`next.config.ts`** - Fallback CSP configuration following Next.js best practices
2. **`src/middleware.ts`** - Primary CSP enforcement with proper nonce generation
3. **`src/lib/security-config.ts`** - Centralized security configuration
4. **`src/lib/csp-utils.ts`** - Utility functions for CSP management
5. **`src/lib/nonce.ts`** - New nonce utilities for Server Components
6. **`src/app/api/csp-report/route.ts`** - CSP violation reporting endpoint

### CSP Configuration Structure

Following the [Next.js CSP documentation](https://nextjs.org/docs/app/guides/content-security-policy):

```typescript
// Development (permissive for hot reload)
const developmentCSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  // ... other directives
`;

// Production (strict security with nonces)
const productionCSP = `
  default-src 'self';
  script-src 'self' 'nonce-{nonce}' 'strict-dynamic';
  style-src 'self' 'nonce-{nonce}' https://fonts.googleapis.com;
  // ... other directives
`;
```

### Key Security Improvements

1. **Proper Header Setting**: CSP headers now set on all routes including API routes
2. **Environment-Aware CSP**: Different policies for development vs production
3. **Nonce-Based Security**: Cryptographically secure nonces for inline scripts/styles
4. **Violation Reporting**: Endpoint to monitor and debug CSP violations
5. **Strict Dynamic**: Enhanced security for dynamically loaded scripts
6. **Fallback Configuration**: Next.js config provides fallback if middleware fails

## Usage Guidelines

### For Developers

#### Using Nonces in Server Components
```typescript
import { getNonce, getNonceProps } from '@/lib/nonce';
import Script from 'next/script';

export default async function Page() {
  const nonce = await getNonce();
  
  return (
    <>
      {/* For Next.js Script component */}
      <Script
        {...await getNonceProps()}
        src="https://example.com/script.js"
        strategy="afterInteractive"
      />
      
      {/* For inline scripts */}
      <script nonce={nonce}>
        console.log('This script has a nonce');
      </script>
      
      {/* For inline styles */}
      <style nonce={nonce}>
        {`.custom-style { color: red; }`}
      </style>
    </>
  );
}
```

#### Adding External Scripts (Production)
```typescript
import Script from 'next/script';
import { getNonceProps } from '@/lib/nonce';

export default async function MyComponent() {
  return (
    <Script
      {...await getNonceProps()}
      src="https://www.googletagmanager.com/gtag/js"
      strategy="afterInteractive"
    />
  );
}
```

#### Checking CSP Headers
```bash
# Check if CSP headers are set
curl -I https://your-domain.com

# Should return:
# Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-...' 'strict-dynamic'; ...
```

### Best Practices

1. **Use Server Components**: Nonces are only available in Server Components
2. **Avoid Inline Scripts/Styles**: Move to external files when possible
3. **Use Next.js Script Component**: It automatically handles nonces when available
4. **Test Both Environments**: Ensure functionality works in both dev and production
5. **Monitor Violations**: Check `/api/csp-report` logs regularly

## Monitoring and Maintenance

### CSP Header Verification
You can verify CSP headers are properly set:

```bash
# Check main page
curl -I https://your-domain.com

# Check API routes
curl -I https://your-domain.com/api/health

# Check static assets (should not have CSP)
curl -I https://your-domain.com/_next/static/...
```

### CSP Violation Reports
The system includes automatic CSP violation reporting:
- Violations logged with structured data
- Common patterns automatically analyzed
- Reports include source file, line number, and violation type

### Regular Maintenance Tasks
1. **Review Violation Reports**: Check `/api/csp-report` logs regularly
2. **Update Nonce Usage**: Ensure new components use nonces properly
3. **Audit External Resources**: Ensure all external resources are whitelisted
4. **Test CSP Changes**: Always test in report-only mode before enforcing

## Testing CSP Implementation

### Development Testing
```bash
# Start development server
npm run dev

# CSP will be in report-only mode
# Check browser console for violations
# Headers should show: Content-Security-Policy-Report-Only
```

### Production Testing
```bash
# Build and start production server
npm run build
npm start

# CSP will be enforced
# Headers should show: Content-Security-Policy
# Monitor /api/csp-report for violations
```

### Manual CSP Testing
1. Open browser developer tools
2. Check Network tab → Response Headers for CSP
3. Check Console tab for CSP violations
4. Test all interactive features
5. Verify nonces are present in script/style tags

## Troubleshooting

### Common Issues

#### CSP Headers Not Appearing
- **Cause**: Middleware not running or misconfigured
- **Solution**: Check middleware matcher configuration and ensure it includes your routes

#### Script/Style Not Loading in Production
- **Cause**: Missing nonce or incorrect nonce usage
- **Solution**: Use `getNonce()` or `getNonceProps()` utilities

#### Development vs Production Differences
- **Cause**: Different CSP policies for different environments
- **Solution**: Test in both environments, use environment-appropriate debugging

#### Nonce Not Available
- **Cause**: Trying to use nonce in Client Component
- **Solution**: Only use nonces in Server Components

### Debug Commands
```bash
# Check CSP headers
curl -I https://your-domain.com | grep -i "content-security-policy"

# Test specific routes
curl -I https://your-domain.com/api/test

# Check middleware logs
npm run dev # and watch console output
```

## Security Benefits

The implemented CSP fixes provide:

1. **Complete Coverage**: CSP headers set on all routes
2. **XSS Protection**: Prevents execution of unauthorized scripts
3. **Data Injection Prevention**: Blocks unauthorized resource loading
4. **Clickjacking Protection**: Prevents embedding in unauthorized frames
5. **Form Hijacking Prevention**: Controls form submission destinations
6. **Compliance**: Meets security scanning requirements

## References

- [Next.js CSP Documentation](https://nextjs.org/docs/app/guides/content-security-policy)
- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) 