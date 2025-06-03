# Document-level CSP Implementation Guide

## Overview

This guide demonstrates a **document-level CSP approach** that coordinates with middleware CSP headers for maximum security and flexibility in Next.js App Router applications.

## **[COMPLETE]** Implementation Status

✅ **Document CSP Utilities** - `src/lib/document-csp.tsx`  
✅ **Document Manager** - `src/app/_document.tsx`  
✅ **Layout Integration** - `src/app/layout.tsx`  
✅ **Middleware Coordination** - `src/middleware.ts`  
✅ **Test Page** - `src/app/document-csp-test/page.tsx`  
✅ **Hash Generator CLI** - `scripts/generate-csp-hash.mjs`  

---

## Architecture: Middleware + Document Coordination

### 🔧 **Middleware Layer** (HTTP Headers)
- Generates fresh nonces for each request
- Sets CSP headers with both nonces and hashes
- Provides early security enforcement
- Handles SSRF protection and security monitoring

### 📄 **Document Layer** (HTML Head/Body)
- Injects critical CSS with pre-computed hashes
- Manages webpack nonce configuration
- Provides runtime CSP utilities
- Handles violation detection and fallbacks
- Offers debug information in development

---

## Core Components

### 1. Document CSP Manager

A singleton class that coordinates CSP configuration between middleware and document:

```typescript
import { DocumentCSPManager } from '@/app/_document';

const manager = DocumentCSPManager.getInstance();
await manager.initialize();
const cspData = manager.getCSPData();
```

### 2. Document Head Component

Manages all CSP-related head elements:

```tsx
import { DocumentHead, CRITICAL_CSS } from '@/app/_document';

<DocumentHead
  enableMetaTags={process.env.CSP_USE_META_TAGS === 'true'}
  criticalCSS={CRITICAL_CSS.all()}
  additionalHashes={[/* component-specific hashes */]}
/>
```

### 3. Document Body Component

Handles CSP-related body elements and runtime utilities:

```tsx
import { DocumentBody } from '@/app/_document';

<DocumentBody enableFallbacks={true}>
  {children}
</DocumentBody>
```

---

## Implementation Steps

### Step 1: Update Layout

Replace your layout's head and body with document components:

```tsx
// src/app/layout.tsx
import { DocumentHead, DocumentBody, CRITICAL_CSS } from '@/app/_document';

export default async function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <DocumentHead
          enableMetaTags={false} // Let middleware handle headers
          criticalCSS={CRITICAL_CSS.all()}
        />
      </head>
      
      <DocumentBody enableFallbacks={true}>
        {children}
      </DocumentBody>
    </html>
  );
}
```

### Step 2: Coordinate with Middleware

Ensure your middleware includes hashes for document-level CSS:

```typescript
// src/middleware.ts
const STATIC_STYLE_HASHES = [
  // ... existing hashes
  "'sha256-F2FphXOLeRXcUSI4c0ybgkNqofQaEHWI1kHbjr9RHxw='", // critical CSS from document
];
```

### Step 3: Generate Critical CSS Hashes

Use the CLI tool to generate hashes for your critical CSS:

```bash
# Generate hash for critical CSS
node scripts/generate-csp-hash.mjs "$(cat critical.css)"

# Add the hash to both:
# 1. STATIC_STYLE_HASHES in middleware.ts
# 2. CRITICAL_CSS in _document.tsx
```

---

## Usage Patterns

### Pattern 1: Dynamic Content with Nonces

For content that changes per request:

```tsx
import { getNonce } from '@/lib/nonce';

export default async function DynamicPage() {
  const nonce = await getNonce();
  
  return (
    <>
      <style nonce={nonce}>
        {`
          .user-specific-${Date.now()} {
            background: ${userThemeColor};
          }
        `}
      </style>
      <div>Dynamic content</div>
    </>
  );
}
```

### Pattern 2: Static Content with Hashes

For content that never changes:

```tsx
// Hash must be pre-computed and in middleware STATIC_STYLE_HASHES
<style>
  {`
    .loading-spinner {
      animation: spin 1s linear infinite;
    }
  `}
</style>
```

### Pattern 3: Critical CSS Injection

For CSS that must load immediately:

```tsx
// In _document.tsx CRITICAL_CSS
export const CRITICAL_CSS = {
  loading: `
    .loading-fallback {
      display: none;
      position: fixed;
      /* ... critical styles */
    }
  `,
  
  all() {
    return this.loading + this.errors + this.utilities;
  }
};
```

---

## Runtime CSP Utilities

The document layer provides client-side utilities:

```javascript
// Available in browser console or client components
window.__CSP_UTILS__.hasNonce()        // Check if nonces are available
window.__CSP_UTILS__.getNonce()        // Get current nonce
window.__CSP_UTILS__.validateHash()    // Validate hash
window.__CSP_UTILS__.injectStyle()     // Safely inject styles

window.__CSP_HASHES__.styles           // Available style hashes
window.__CSP_HASHES__.scripts          // Available script hashes
```

---

## Configuration Options

### Environment Variables

```bash
# Use CSP meta tags instead of headers (not recommended for production)
CSP_USE_META_TAGS=true

# Enable development debugging
NODE_ENV=development
```

### Document CSP Config

```typescript
interface DocumentCSPConfig {
  enableMetaTags?: boolean;           // Enable meta tag fallback
  enableNonceInjection?: boolean;     // Inject webpack nonce
  enableHashInjection?: boolean;      // Include all pre-computed hashes
  additionalStyleHashes?: string[];   // Component-specific hashes
  additionalScriptHashes?: string[];  // Component-specific script hashes
  reportUri?: string;                 // CSP violation reporting endpoint
}
```

---

## Testing and Debugging

### Test Pages

1. **Document CSP Test**: `/document-csp-test`
   - Document-level CSP status
   - Middleware coordination testing
   - Runtime utilities verification

2. **Original CSP Test**: `/csp-test`
   - Basic nonce and hash functionality
   - External script loading
   - General CSP compliance

### Debug Mode

Add `?debug=true` to see detailed debug information:

```
/document-csp-test?debug=true
```

### Console Verification

```javascript
// Check document CSP status
console.log('Document CSP Status:', await DocumentCSPStatus());

// Verify runtime utilities
console.log('CSP Utils Available:', !!window.__CSP_UTILS__);
console.log('Hash Registry:', window.__CSP_HASHES__);
```

---

## Security Benefits

### 🛡️ **Layered Security**
- **Middleware**: Early HTTP header enforcement
- **Document**: Runtime protection and fallbacks
- **Combined**: Defense in depth approach

### 🎯 **Flexible Control**
- **Critical CSS**: Always loads with hashes
- **Dynamic Content**: Uses fresh nonces
- **Fallbacks**: Meta tags when headers fail
- **Runtime**: Client-side CSP utilities

### 📊 **Monitoring**
- **Violation Detection**: Real-time CSP violation handling
- **Debug Information**: Development-time diagnostics
- **Status Reporting**: Runtime CSP status checks

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Critical CSS hashes generated and added to middleware
- [ ] Document components integrated in layout
- [ ] Test pages working: `/document-csp-test`
- [ ] No CSP violations in production build
- [ ] Runtime utilities functional
- [ ] Violation reporting endpoint configured

### Performance Considerations

1. **Critical CSS**: Inlined in document head for immediate loading
2. **Hash Registry**: Minimal runtime overhead
3. **Nonce Generation**: Server-side, no client computation
4. **Fallbacks**: Only enabled when needed

---

## Troubleshooting

### Common Issues

1. **"Critical CSS not loading"**
   ```bash
   # Generate hash for your critical CSS
   node scripts/generate-csp-hash.mjs "$(cat your-critical.css)"
   # Add to middleware STATIC_STYLE_HASHES
   ```

2. **"Runtime utilities not available"**
   - Check if `DocumentBody` is properly wrapping your app
   - Verify nonce is available from middleware

3. **"CSP violations in console"**
   - Check if content hashes are in middleware
   - Verify nonces are being used for dynamic content

### Debug Commands

```bash
# Generate common pattern hashes
node scripts/generate-csp-hash.mjs --common

# Test specific content
node scripts/generate-csp-hash.mjs "your-css-here"

# Interactive hash generation
node scripts/generate-csp-hash.mjs --interactive
```

---

## Migration Guide

### From Basic CSP to Document-level

1. **Install document components**:
   ```tsx
   // Replace in layout.tsx
   - <head>/* manual head elements */</head>
   + <head><DocumentHead /></head>
   
   - <body>{children}</body>
   + <DocumentBody>{children}</DocumentBody>
   ```

2. **Move critical CSS**:
   ```tsx
   // Move from layout styles to CRITICAL_CSS
   - <style>{criticalCSS}</style>
   + // Add to _document.tsx CRITICAL_CSS
   ```

3. **Update middleware**:
   ```typescript
   // Add document hashes to middleware
   const STATIC_STYLE_HASHES = [
     // ... existing hashes
     "'sha256-CRITICAL_CSS_HASH='", // from document
   ];
   ```

---

## Summary

The document-level CSP approach provides:

1. **🔧 Middleware Integration** - Coordinates with existing CSP headers
2. **📄 Document Control** - Fine-grained head/body management  
3. **🔒 Critical CSS** - Immediate loading with hashes
4. **🛠️ Runtime Utilities** - Client-side CSP management
5. **📊 Debug Tools** - Development and production monitoring
6. **🛡️ Enhanced Security** - Layered protection approach

**Result**: A production-ready document-level CSP implementation that works seamlessly with middleware for optimal security and performance. 