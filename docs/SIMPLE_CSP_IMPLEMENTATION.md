# Simple CSP Implementation Guide

## Overview

This guide demonstrates a **simplified CSP approach** using **middleware CSP headers** with **nonces and SHA256 hashes** for Next.js App Router applications, without complex document-level management.

## **[COMPLETE]** Implementation Status

✅ **Middleware CSP Headers** - `src/middleware.ts`  
✅ **Nonce Utilities** - `src/lib/nonce.ts`  
✅ **SHA256 Hash Utilities** - `src/lib/sha256-utils.ts`  
✅ **Simple CSP Utilities** - `src/lib/document-csp.tsx`  
✅ **Layout Integration** - `src/app/layout.tsx`  
✅ **Test Page** - `src/app/simple-csp-test/page.tsx`  
✅ **Hash Generator CLI** - `scripts/generate-csp-hash.mjs`  

---

## Architecture: Middleware-First Approach

### 🔧 **Middleware Layer** (Primary)
- Generates fresh nonces for each request
- Sets CSP headers with both nonces and hashes
- Provides early security enforcement
- Handles SSRF protection and security monitoring

### 📄 **Layout Layer** (Supporting)
- Injects critical CSS with pre-computed hashes
- Sets webpack nonce for dynamic imports
- Provides basic debug information in development
- Simple head management without complexity

### 🛠️ **Utilities Layer** (Helper)
- Basic CSP status checking
- Hash generation and validation
- Simple client-side hooks
- Meta tag fallback when needed

---

## Core Implementation

### 1. Middleware Configuration

Your middleware handles all CSP enforcement:

```typescript
// src/middleware.ts
const STATIC_STYLE_HASHES = [
  "'sha256-ZDrxqUOB4m/L0JWL/+gS52g1CRH0l/qwMhjTw5Z/Fsc='", // display: none;
  "'sha256-F2FphXOLeRXcUSI4c0ybgkNqofQaEHWI1kHbjr9RHxw='", // critical CSS from layout
  // ... more hashes
];

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  const cspHeader = `
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${STATIC_SCRIPT_HASHES.join(' ')};
    style-src 'self' 'nonce-${nonce}' ${STATIC_STYLE_HASHES.join(' ')};
    /* ... other directives */
  `;
  
  // Set headers and continue...
}
```

### 2. Layout Configuration

Simple layout without complex document management:

```tsx
// src/app/layout.tsx
import { getNonce } from '@/lib/nonce';

export default async function RootLayout({ children }) {
  const nonce = await getNonce();

  return (
    <html>
      <head>
        {/* Webpack nonce script */}
        {nonce && (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `window.__webpack_nonce__ = "${nonce}"`
            }}
          />
        )}

        {/* Critical CSS with pre-computed hash */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      </head>
      
      <body>{children}</body>
    </html>
  );
}
```

### 3. Page Usage

Simple patterns for dynamic and static content:

```tsx
// Dynamic content with nonces
import { getNonce } from '@/lib/nonce';

export default async function MyPage() {
  const nonce = await getNonce();
  
  return (
    <>
      <style nonce={nonce}>
        {`
          .dynamic-${Date.now()} {
            background: ${userColor};
          }
        `}
      </style>
      <div>Content</div>
    </>
  );
}

// Static content with hashes (pre-computed in middleware)
export default function StaticPage() {
  return (
    <>
      <style>
        {`
          .static-class {
            display: none;
          }
        `}
      </style>
      <div>Static content</div>
    </>
  );
}
```

---

## Usage Patterns

### Pattern 1: Dynamic Content (Nonces)

For content that changes per request:

```tsx
const nonce = await getNonce();

// User-specific styles
<style nonce={nonce}>
  {`.user-theme-${userId} { background: ${userTheme}; }`}
</style>

// Timestamp-based content
<style nonce={nonce}>
  {`.animation-${Date.now()} { /* unique animation */ }`}
</style>

// External scripts
<Script {...await getNonceProps()} src="external-script.js" />
```

### Pattern 2: Static Content (Hashes)

For content that never changes:

```tsx
// Step 1: Generate hash
// node scripts/generate-csp-hash.mjs "display: none;"
// Result: 'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='

// Step 2: Add to middleware STATIC_STYLE_HASHES

// Step 3: Use in components (no nonce needed)
<style>
  {`.loading { display: none; }`}
</style>
```

### Pattern 3: Critical CSS

For CSS that must load immediately:

```tsx
// In layout.tsx
const criticalCSS = `
  .loading-fallback { display: none; /* ... */ }
  .error-boundary { display: none; /* ... */ }
`;

// Generate hash and add to middleware
// node scripts/generate-csp-hash.mjs "$(cat critical.css)"

// Use in layout head
<style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
```

---

## Utility Functions

### Check CSP Status

```tsx
import { getCSPStatus } from '@/lib/document-csp';

const status = await getCSPStatus();
console.log(status);
// {
//   middleware: { hasNonce: true, nonceValue: "ABC123..." },
//   hashes: { styleCount: 10, scriptCount: 2, total: 12 },
//   security: { noncesEnabled: true, hashesEnabled: true, hybridApproach: true }
// }
```

### Client-side CSP Hook

```tsx
'use client';
import { useCSP } from '@/lib/document-csp';

function MyClientComponent() {
  const { hasNonce, webpackNonce, hasCspMetaTag } = useCSP();
  
  return (
    <div>
      Nonce available: {hasNonce ? 'Yes' : 'No'}
    </div>
  );
}
```

### Generate Hashes

```bash
# Generate hash for specific content
node scripts/generate-csp-hash.mjs "your-css-here"

# Generate hashes for common patterns
node scripts/generate-csp-hash.mjs --common

# Interactive mode
node scripts/generate-csp-hash.mjs --interactive
```

---

## Testing

### Test Page

Visit `/simple-csp-test` to verify your implementation:

- ✅ Middleware nonce generation
- ✅ Static hash support
- ✅ Dynamic content with nonces
- ✅ Critical CSS loading
- ✅ Hash generation utilities

### Console Verification

```javascript
// Check CSP status
console.log('Webpack nonce:', window.__webpack_nonce__);
console.log('Nonce elements:', document.querySelectorAll('[nonce]').length);
console.log('Style elements:', document.querySelectorAll('style').length);
```

---

## Configuration

### Environment Variables

```bash
# Optional: Use meta tags as fallback (not recommended)
CSP_USE_META_TAGS=false

# Development debugging
NODE_ENV=development
```

### Middleware Hashes

Add your hashes to middleware:

```typescript
const STATIC_STYLE_HASHES = [
  "'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='", // display: none;
  "'sha256-F2FphXOLeRXcUSI4c0ybgkNqofQaEHWI1kHbjr9RHxw='", // critical CSS
  // Add your hashes here
];
```

---

## Security Benefits

### 🛡️ **Strong Security**
- **No unsafe-inline** - All content uses nonces or hashes
- **No unsafe-eval** - Prevents code injection
- **Fresh nonces** - New nonce per request
- **Pre-validated hashes** - Static content is secure

### 🎯 **Simple & Maintainable**
- **Clear separation** - Dynamic (nonces) vs Static (hashes)
- **Middleware-first** - Single source of truth for CSP
- **Easy debugging** - Simple status checking
- **Minimal complexity** - No document-level management

### 📊 **Performance**
- **Early enforcement** - CSP headers set in middleware
- **Efficient hashing** - Pre-computed static hashes
- **Minimal overhead** - Simple nonce generation
- **Critical CSS** - Immediate loading of essential styles

---

## Production Checklist

### Before Deployment

- [ ] All static CSS hashes added to middleware `STATIC_STYLE_HASHES`
- [ ] Critical CSS hash generated and included
- [ ] Dynamic content uses nonces correctly
- [ ] Test page works: `/simple-csp-test`
- [ ] No CSP violations in production build
- [ ] External scripts use `getNonceProps()`

### After Deployment

- [ ] Verify CSP headers in production
- [ ] Monitor CSP violation reports (`/api/csp-report`)
- [ ] Test critical user flows
- [ ] Verify both static and dynamic content loads correctly

---

## Troubleshooting

### Common Issues

1. **"Style blocked by CSP"**
   ```bash
   # Generate hash for your CSS
   node scripts/generate-csp-hash.mjs "your-css-content"
   # Add the hash to middleware STATIC_STYLE_HASHES
   ```

2. **"Script blocked by CSP"**
   ```tsx
   // Use nonce for external scripts
   <Script {...await getNonceProps()} src="external.js" />
   ```

3. **"Nonce not working"**
   - Check middleware is running on your route
   - Verify you're using Server Components
   - Ensure route is not statically generated

### Debug Commands

```bash
# Test hash generation
node scripts/generate-csp-hash.mjs --common

# Check specific content
node scripts/generate-csp-hash.mjs "display: none;"

# Interactive hash generation
node scripts/generate-csp-hash.mjs --interactive
```

---

## Migration from Document-level Approach

If you're migrating from the complex document-level approach:

### What's Removed
- ❌ Document CSP Manager singleton
- ❌ DocumentHead/DocumentBody components
- ❌ Complex runtime utilities
- ❌ Automatic violation handling
- ❌ Meta tag fallback system
- ❌ Advanced debug information

### What's Kept
- ✅ Middleware CSP headers
- ✅ Nonce generation and usage
- ✅ SHA256 hash support
- ✅ Critical CSS with hashes
- ✅ Hash generation CLI
- ✅ Basic status checking

### Migration Steps

1. Remove document imports from layout
2. Simplify head/body structure
3. Keep middleware configuration
4. Use basic CSP utilities only
5. Test with simple test page

---

## Summary

The simplified CSP implementation provides:

1. **🔧 Middleware-First** - Single source of truth for CSP
2. **🔒 Strong Security** - Nonces + hashes without unsafe directives
3. **📄 Simple Layout** - Basic head management without complexity
4. **🛠️ Essential Tools** - Hash generation and status checking
5. **📊 Easy Testing** - Simple test page and verification
6. **🚀 Production Ready** - Proven patterns and deployment checklist

**Result**: A clean, maintainable CSP implementation that's secure, performant, and easy to understand. 