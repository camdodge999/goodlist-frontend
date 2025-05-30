# Content Security Policy (CSP) Solution

## Overview

This document explains the CSP implementation and how to resolve CSP violations in the Goodlist Frontend application.

## What Was Fixed

### 1. CSP Configuration Issues
- **Problem**: CSP had conflicting directives (`'unsafe-inline'` with nonce)
- **Solution**: Removed `'unsafe-inline'` and properly configured nonce-based CSP

### 2. FontAwesome Inline Styles
- **Problem**: FontAwesome was injecting inline styles causing CSP violations
- **Solution**: Configured FontAwesome to disable auto CSS injection and manually imported styles

### 3. Third-party Library Violations
- **Problem**: Libraries like Framer Motion inject inline styles dynamically
- **Solution**: Created `CSPWrapper` component that automatically adds nonce to dynamic elements

## Current CSP Configuration

```typescript
// In src/middleware.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
  style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com data:;
  img-src 'self' blob: data: https://images.unsplash.com https://api.goodlist2.chaninkrew.com https://maps.googleapis.com https://maps.gstatic.com *.googleapis.com *.gstatic.com;
  font-src 'self' https://fonts.gstatic.com data:;
  connect-src 'self' https://api.goodlist2.chaninkrew.com ${process.env.NEXT_PUBLIC_BACKEND_URL} https://maps.googleapis.com;
  media-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'self' https://www.google.com;
  upgrade-insecure-requests;
`;
```

## Key Components

### 1. Nonce Utilities (`src/lib/nonce.ts`)
- `getNonce()`: Get nonce from server headers
- `getNonceProps()`: Get nonce props for JSX elements
- `useNonce()`: Client-side hook for nonce
- `createNonceStyle()`: Create CSP-compliant style elements
- `createNonceScript()`: Create CSP-compliant script elements

### 2. CSP Wrapper (`src/components/CSPWrapper.tsx`)
- Automatically adds nonce to dynamically created style/script elements
- Uses MutationObserver to catch elements added by third-party libraries
- Wraps the entire application in the layout

### 3. FontAwesome Configuration (`src/lib/fontawesome.ts`)
- Disables auto CSS injection to prevent inline styles
- Manually imports FontAwesome CSS in layout

### 4. CSP Debugger (`src/lib/csp-debug.ts`)
- Development-only utility for debugging CSP violations
- Provides helpful suggestions for fixing violations
- Auto-initializes in development mode

## How to Handle New CSP Violations

### 1. Style Violations
If you see: `Refused to apply inline style because it violates CSP directive "style-src"`

**Solutions:**
- For your own inline styles: Use `createNonceStyle()` utility
- For third-party libraries: Ensure `CSPWrapper` is wrapping the component
- For external stylesheets: Add the domain to `style-src` in middleware

### 2. Script Violations
If you see: `Refused to load script because it violates CSP directive "script-src"`

**Solutions:**
- For inline scripts: Use `createNonceScript()` utility
- For external scripts: They should work with `'strict-dynamic'`
- For eval-based scripts: Consider alternatives or add specific hashes

### 3. Image/Font/Connect Violations
Add the blocked domain to the appropriate directive in `src/middleware.ts`

## Development Debugging

The CSP debugger automatically logs violations in development with helpful suggestions:

```javascript
// In browser console, you'll see:
🚨 CSP Violation Detected
💡 CSP Fix Suggestions
📊 CSP Violations Summary
```

## Best Practices

1. **Always use nonce for inline content**
   ```tsx
   const nonce = await getNonce();
   return <style nonce={nonce}>{css}</style>;
   ```

2. **Wrap third-party components**
   ```tsx
   <CSPWrapper>
     <FramerMotionComponent />
   </CSPWrapper>
   ```

3. **Test in development**
   - CSP violations are logged in console
   - Use the debugger to identify issues early

4. **Keep CSP strict**
   - Avoid `'unsafe-inline'` and `'unsafe-eval'`
   - Use nonces and hashes instead
   - Regularly audit and tighten policies

## Testing CSP

1. **Development**: Violations are logged in console
2. **Production**: Monitor CSP reports (can be configured)
3. **Manual**: Use browser dev tools Security tab

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| FontAwesome styles blocked | Auto CSS injection | Import CSS manually, disable autoAddCss |
| Framer Motion styles blocked | Dynamic style injection | Use CSPWrapper |
| Google Fonts blocked | Missing domain in font-src | Add fonts.gstatic.com |
| API calls blocked | Missing domain in connect-src | Add API domain |
| Images blocked | Missing domain in img-src | Add image domain |

## Files Modified

- `src/middleware.ts` - CSP configuration
- `src/lib/nonce.ts` - Nonce utilities
- `src/lib/fontawesome.ts` - FontAwesome config
- `src/components/CSPWrapper.tsx` - Dynamic element handler
- `src/lib/csp-debug.ts` - Development debugger
- `src/app/layout.tsx` - Integration point

## Security Benefits

1. **Prevents XSS attacks** through inline script injection
2. **Blocks unauthorized resource loading** from untrusted domains
3. **Prevents clickjacking** with frame-ancestors directive
4. **Enforces HTTPS** with upgrade-insecure-requests
5. **Provides detailed violation reporting** for monitoring 