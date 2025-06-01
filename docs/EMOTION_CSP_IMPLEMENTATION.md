# Emotion CacheProvider with CSP Nonce Implementation

This document explains how Emotion CacheProvider is integrated with Content Security Policy (CSP) nonce support in this Next.js project.

## Overview

Based on the implementation guide from [CentralCSP - How to setup nonce with NextJS](https://centralcsp.com/articles/how-to-setup-nonce-with-nextjs), we've implemented Emotion's CacheProvider with proper CSP nonce support.

## Implementation Details

### 1. Dependencies Added

```bash
npm install @emotion/react @emotion/cache
```

### 2. EmotionCacheProvider Component

**File**: `src/providers/EmotionCacheProvider.tsx`

```typescript
"use client";

import { ReactNode } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

interface EmotionCacheProviderProps {
  children: ReactNode;
  nonce?: string | null;
}

export function EmotionCacheProvider({ children, nonce }: EmotionCacheProviderProps) {
  const cache = createCache({ 
    key: 'css',
    ...(nonce ? { nonce } : {})
  });

  return (
    <CacheProvider value={cache}>
      {children}
    </CacheProvider>
  );
}
```

### 3. Integration with App Providers

**File**: `src/providers/AppProviders.tsx`

The EmotionCacheProvider is integrated at the top level of the provider tree to ensure all Emotion styles are properly nonced:

```typescript
export function AppProviders({ children, session, nonce }: AppProvidersProps) {
  return (
    <EmotionCacheProvider nonce={nonce}>
      <UserProvider initialSession={session}>
        <StoreProvider>
          <ReportProvider>
            {children}
          </ReportProvider>
        </StoreProvider>
      </UserProvider>
    </EmotionCacheProvider>
  );
}
```

### 4. CSP Configuration

The existing CSP configuration in `src/middleware.ts` already supports Emotion styles:

```typescript
style-src 'self' 'nonce-${nonce}' ${STATIC_STYLE_HASHES.join(' ')};
```

This directive allows:
- Styles from the same origin (`'self'`)
- Styles with the generated nonce (`'nonce-${nonce}'`)
- Pre-computed static style hashes

### 5. Usage Example

**File**: `src/components/examples/EmotionExample.tsx`

```typescript
import { css } from '@emotion/css';

export function EmotionExample() {
  const buttonStyle = css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    color: white;
    padding: 12px 24px;
    // ... more styles
  `;

  return (
    <button className={buttonStyle}>
      Test Emotion Styles
    </button>
  );
}
```

## How It Works

1. **Nonce Generation**: The middleware generates a unique nonce for each request
2. **Nonce Distribution**: The nonce is passed through the provider tree via props
3. **Cache Creation**: EmotionCacheProvider creates an Emotion cache with the nonce
4. **Style Injection**: All Emotion-generated styles are automatically nonced
5. **CSP Validation**: The browser validates styles against the CSP policy

## Benefits

- **Security**: All Emotion styles are properly nonced for CSP compliance
- **Performance**: Emotion's caching is maintained
- **Compatibility**: Works with existing CSP and Next.js setup
- **Flexibility**: Supports both static and dynamic styles

## Testing

To test the implementation:

1. Add the `EmotionExample` component to any page
2. Check browser DevTools for CSP violations (should be none)
3. Verify styles are applied correctly
4. Check that `<style>` tags have the correct nonce attribute

## Development Notes

- The nonce is only available in Server Components initially
- Client Components receive the nonce through the provider tree
- Development logging shows cache configuration details
- Static generation compatibility is maintained (nonce fallback)

## References

- [CentralCSP NextJS Nonce Guide](https://centralcsp.com/articles/how-to-setup-nonce-with-nextjs)
- [Next.js CSP Documentation](https://nextjs.org/docs/app/guides/content-security-policy)
- [Emotion Cache Documentation](https://emotion.sh/docs/cache) 