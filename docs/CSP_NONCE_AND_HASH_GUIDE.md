# CSP Implementation: Nonces + SHA256 Hashes

## Overview

This guide demonstrates a **hybrid CSP approach** that combines both **nonces** and **SHA256 hashes** for maximum security and flexibility in your Next.js application.

## **[COMPLETE]** Implementation Status

✅ **Middleware with Both Approaches** - `src/middleware.ts`  
✅ **Nonce Utilities** - `src/lib/nonce.ts`  
✅ **SHA256 Hash Utilities** - `src/lib/sha256-utils.ts`  
✅ **Hash Generator CLI** - `scripts/generate-csp-hash.mjs`  
✅ **Test Page** - `src/app/csp-test/page.tsx`  
✅ **CSP Debug Component** - `src/lib/csp-debug.tsx`  

---

## Core Concept: When to Use What

### 🔄 **Nonces** (Dynamic Content)
Use for content that **changes on each request**:
- User-specific styles/scripts
- Dynamic animations with timestamps
- External scripts (always use nonces)
- Development hot-reload content
- Content with variables or user data

### 🔒 **SHA256 Hashes** (Static Content)
Use for content that **never changes**:
- Common utility styles (`display: none`, etc.)
- Static loading animations
- Critical CSS that must always work
- Emergency fallback styles
- Static analytics snippets

---

## Implementation Details

### 1. Middleware Configuration

Your middleware now supports both approaches:

```typescript
// Pre-computed SHA256 hashes for static content
const STATIC_STYLE_HASHES = [
  "'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='", // display: none;
  "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='", // empty style
  // ... more hashes
];

const STATIC_SCRIPT_HASHES = [
  "'sha256-4RS22DYeB7U14dra4KcQYxmwt5HkOInieXK1NUMBmQI='", // webpack nonce
];

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // CSP with both nonces and hashes
  const cspHeader = `
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${STATIC_SCRIPT_HASHES.join(' ')};
    style-src 'self' 'nonce-${nonce}' ${STATIC_STYLE_HASHES.join(' ')};
  `;
}
```

### 2. Using in Components

#### Dynamic Content (with Nonces)
```tsx
import { getNonce } from '@/lib/nonce';

export default async function MyComponent() {
  const nonce = await getNonce();
  
  return (
    <>
      {/* Dynamic content that changes per request */}
      <style nonce={nonce}>
        {`
          .dynamic-${Date.now()} {
            animation: pulse-${nonce?.substring(0, 8)} 2s infinite;
          }
        `}
      </style>
      
      <script nonce={nonce}>
        {`console.log('User session: ' + Date.now());`}
      </script>
    </>
  );
}
```

#### Static Content (with SHA256 Hashes)
```tsx
import { generateSHA256Hash } from '@/lib/sha256-utils';

export default function StaticComponent() {
  // Static content - hash must be pre-computed and in CSP policy
  return (
    <>
      {/* Static styles - no nonce needed, uses SHA256 hash */}
      <style>
        {`
          .loading-spinner {
            display: none;
          }
        `}
      </style>
    </>
  );
}
```

### 3. Generating Hashes

#### CLI Tool Usage
```bash
# Generate hash for inline CSS
node scripts/generate-csp-hash.mjs "display: none;"

# Generate hash from file
node scripts/generate-csp-hash.mjs --file src/styles/critical.css

# Interactive mode
node scripts/generate-csp-hash.mjs --interactive

# Get all common pattern hashes
node scripts/generate-csp-hash.mjs --common
```

#### Programmatic Usage
```typescript
import { generateSHA256Hash, getOrGenerateHash } from '@/lib/sha256-utils';

// Generate new hash
const hash = generateSHA256Hash('opacity: 0;');
// Returns: 'sha256-/uAJu74u5xVXg1o0rPNy33Hc2fxBQh/btht8PqSxqyU='

// Use existing hash or generate new one
const knownHash = getOrGenerateHash('display: none;');
// Returns known hash if exists, generates new one if not
```

---

## Practical Examples

### Example 1: User Dashboard with Mixed Content

```tsx
import { getNonce } from '@/lib/nonce';

export default async function Dashboard({ user }: { user: User }) {
  const nonce = await getNonce();
  
  return (
    <div>
      {/* Static emergency styles (using SHA256 hash) */}
      <style>
        {`
          .error-fallback {
            display: none;
            color: red;
          }
        `}
      </style>
      
      {/* Dynamic user-specific styles (using nonce) */}
      <style nonce={nonce}>
        {`
          .user-theme-${user.id} {
            background-color: ${user.themeColor};
            border: 2px solid ${user.accentColor};
          }
        `}
      </style>
      
      <div className={`user-theme-${user.id}`}>
        Welcome, {user.name}!
      </div>
    </div>
  );
}
```

### Example 2: Loading States

```tsx
import { getNonce } from '@/lib/nonce';

export default async function LoadingComponent() {
  const nonce = await getNonce();
  
  return (
    <>
      {/* Static loading spinner (SHA256 hash) */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .spinner {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
      
      {/* Dynamic loading message (nonce) */}
      <style nonce={nonce}>
        {`
          .loading-message::after {
            content: "Loading... (${new Date().toLocaleTimeString()})";
          }
        `}
      </style>
      
      <div className="spinner loading-message"></div>
    </>
  );
}
```

---

## Development Workflow

### 1. Adding New Static Styles

1. **Write your CSS**:
   ```css
   .new-utility {
     position: fixed;
     top: 0;
     left: 0;
   }
   ```

2. **Generate the hash**:
   ```bash
   node scripts/generate-csp-hash.mjs ".new-utility { position: fixed; top: 0; left: 0; }"
   ```

3. **Add to middleware**:
   ```typescript
   const STATIC_STYLE_HASHES = [
     // ... existing hashes
     "'sha256-YOUR_NEW_HASH_HERE='", // .new-utility styles
   ];
   ```

### 2. Debugging CSP Issues

1. **Check the test page**: `/csp-test`
2. **Use the debug component**: `<CSPDebugInfo />`
3. **Monitor violations**: Check `/api/csp-report`
4. **Generate missing hashes**: Use CLI tool on violation content

---

## Browser DevTools Verification

### 1. Check CSP Headers
```bash
# Network tab should show:
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-ABC123...' 'strict-dynamic' 'sha256-hash1' 'sha256-hash2'; style-src 'self' 'nonce-ABC123...' 'sha256-hash3'
```

### 2. Console Verification
```javascript
// Check nonce availability
document.querySelectorAll('[nonce]').length; // Should be > 0 for dynamic pages

// Check specific elements
document.querySelector('style[nonce]'); // Dynamic styles
document.querySelector('style:not([nonce])'); // Static styles (using hashes)
```

---

## Production Checklist

### ✅ Before Deployment

- [ ] All static content has pre-computed hashes in `STATIC_STYLE_HASHES`
- [ ] Dynamic content uses nonces correctly
- [ ] No CSP violations in production build (`npm run build`)
- [ ] Test page works: `/csp-test`
- [ ] External scripts use `getNonceProps()`
- [ ] Webpack nonce is set in layout: `window.__webpack_nonce__`

### ✅ After Deployment

- [ ] Verify CSP headers in production
- [ ] Monitor CSP violation reports
- [ ] Test critical user flows
- [ ] Verify both static and dynamic content loads

---

## Security Benefits

### 🛡️ **Enhanced Security**
- **No `unsafe-inline`** - All content uses nonces or hashes
- **No `unsafe-eval`** - Prevents code injection
- **Fresh nonces** - New nonce per request prevents replay attacks
- **Pre-validated hashes** - Static content is cryptographically verified

### 🎯 **Best of Both Worlds**
- **Performance** - Static content doesn't need server roundtrip
- **Flexibility** - Dynamic content adapts to user/context
- **Reliability** - Critical styles always work via hashes
- **Maintainability** - Clear separation between static/dynamic content

---

## Troubleshooting

### Common Issues

1. **"Style blocked by CSP"**
   - Generate hash: `node scripts/generate-csp-hash.mjs "your-css-here"`
   - Add to `STATIC_STYLE_HASHES` in middleware

2. **"Script blocked by CSP"**
   - Use nonce for external scripts: `<Script {...await getNonceProps()} />`
   - Use hash for static inline scripts

3. **"Nonce not found"**
   - Ensure you're using Server Components
   - Check middleware is running
   - Verify route is dynamic (not static generated)

### Debug Commands

```bash
# Test hash generation
node scripts/generate-csp-hash.mjs --common

# Check CSP headers
curl -I http://localhost:3000

# Interactive hash generation
node scripts/generate-csp-hash.mjs --interactive
```

---

## Summary

Your CSP implementation now provides:

1. **🔄 Dynamic Security** - Nonces for changing content
2. **🔒 Static Security** - SHA256 hashes for fixed content  
3. **🛠️ Developer Tools** - CLI for hash generation
4. **📊 Monitoring** - Violation reporting and debugging
5. **📚 Documentation** - Complete implementation guide

This hybrid approach gives you **maximum security** with **optimal performance** while maintaining **developer productivity**.

**Result**: A production-ready CSP implementation that follows security best practices while being practical to maintain and debug. 