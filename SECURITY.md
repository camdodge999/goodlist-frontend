# Security Documentation

## SSRF (Server-Side Request Forgery) Protection

This document outlines the comprehensive SSRF protection measures implemented in this Next.js application.

### 🚨 Vulnerabilities Addressed

1. **Image Upload Route** (`/api/images/uploads`)
   - **Risk**: High - Arbitrary path parameter could access internal services
   - **Protection**: Path validation, URL allowlisting, secure fetch wrapper

2. **fetchWithAuth Utility** (`/lib/fetch-with-auth.ts`)
   - **Risk**: Medium - No URL validation for external requests
   - **Protection**: URL validation, domain allowlisting, timeout controls

### 🛡️ Protection Measures Implemented

#### 1. URL Validation (`/lib/ssrf-protection.ts`)

- **Protocol Filtering**: Only HTTP/HTTPS allowed
- **Domain Allowlisting**: Restricts requests to trusted domains
- **Private IP Blocking**: Prevents access to internal networks
- **Localhost Restrictions**: Controlled access with port limitations
- **Path Traversal Prevention**: Blocks `../` and similar patterns

#### 2. Secure Fetch Wrapper

```typescript
// Example usage
const response = await secureFetch(url, {
  allowLocalhost: process.env.NODE_ENV === 'development',
  timeout: 30000,
  maxRedirects: 0,
});
```

#### 3. Middleware Protection (`/middleware.ts`)

- **Security Headers**: CSP, X-Frame-Options, etc.
- **Suspicious Request Detection**: Monitors for scanning tools
- **Path Validation**: Early validation in middleware layer
- **Request Logging**: Tracks potential attack attempts

#### 4. Centralized Configuration (`/lib/security-config.ts`)

- **Allowlisted Domains**: Centrally managed trusted domains
- **Security Policies**: CSP directives and security headers
- **Rate Limiting**: Request throttling configuration
- **File Upload Restrictions**: MIME type and size limits

### 🔧 Configuration

#### Environment Variables

Add these to your `.env.local`:

```bash
# Trusted domains (comma-separated)
TRUSTED_DOMAINS=api.goodlist.chaninkrew.com,api.goodlist2.chaninkrew.com

# Backend URL (validated on startup)
NEXTAUTH_URL =https://api.goodlist.chaninkrew.com

# Enable detailed security logging in development
SECURITY_DEBUG=true
```

#### Allowed Domains

Update the allowlist in `/lib/ssrf-protection.ts`:

```typescript
const ALLOWED_DOMAINS = [
  'api.goodlist.chaninkrew.com',
  'api.goodlist2.chaninkrew.com',
  'images.unsplash.com',
  // Add your trusted domains here
];
```

### 🚀 Usage Examples

#### Protected API Route

```typescript
import { validatePath, secureFetch } from '@/lib/ssrf-protection';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  
  // Validate path parameter
  const pathValidation = validatePath(path);
  if (!pathValidation.isValid) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }
  
  // Make secure request
  const response = await secureFetch(`${baseUrl}/${pathValidation.sanitizedPath}`);
  return response;
}
```

#### Protected External Request

```typescript
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// Automatically protected with SSRF validation
const result = await fetchWithAuth({
  request,
  url: 'https://api.goodlist.chaninkrew.com/data',
  method: 'GET'
});
```

### 📊 Security Monitoring

#### Log Patterns to Monitor

```bash
# SSRF attempts
🚨 SSRF attempt blocked: [reason] - Path: [path]

# Suspicious requests
🚨 Suspicious API request detected: [endpoint] from [ip]

# Protection triggers
🚨 SSRF Protection triggered: [message] - Reason: [reason]
```

#### Metrics to Track

- Number of blocked SSRF attempts
- Suspicious user agent detections
- Failed URL validations
- Timeout occurrences

### 🔍 Testing SSRF Protection

#### Test Cases

1. **Path Traversal**
   ```bash
   curl "http://localhost:4200/api/images/uploads?path=../../../etc/passwd"
   # Should return: Invalid path parameter
   ```

2. **Internal Network Access**
   ```bash
   curl "http://localhost:4200/api/images/uploads?path=http://127.0.0.1:22"
   # Should return: Request blocked for security reasons
   ```

3. **Blocked Protocol**
   ```bash
   curl "http://localhost:4200/api/images/uploads?path=file:///etc/passwd"
   # Should return: Invalid path parameter
   ```

### 🛠️ Maintenance

#### Regular Tasks

1. **Review Allowlisted Domains**: Quarterly review of trusted domains
2. **Update Security Patterns**: Monitor for new attack vectors
3. **Log Analysis**: Weekly review of security logs
4. **Dependency Updates**: Keep security libraries updated

#### Security Checklist

- [ ] All external requests use `secureFetch` or `fetchWithAuth`
- [ ] Path parameters are validated with `validatePath`
- [ ] Environment URLs are validated on startup
- [ ] Security headers are properly configured
- [ ] Suspicious requests are logged and monitored
- [ ] Rate limiting is implemented for API endpoints

### 🚨 Incident Response

If SSRF attack is detected:

1. **Immediate**: Block the attacking IP
2. **Short-term**: Review and tighten validation rules
3. **Long-term**: Analyze attack patterns and update protection

### 📚 Additional Resources

- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Last Updated**: January 2025  
**Security Review**: Required every 6 months 