# CSP Best Practices for Next.js - Nonce-First Strategy

## Overview

This document outlines our **nonce-first CSP implementation** following Next.js best practices. This approach provides strong security without relying on pre-computed hashes that often fail in production.

## Key Features

- ✅ **Nonce-first strategy** for maximum compatibility
- ✅ **Dynamic hash capture** from actual CSP violations
- ✅ **Development-friendly** CSP logging
- ✅ **Production-ready** enforcement without unsafe-inline
- ✅ **Automatic violation analysis** and hash suggestions

## How It Works

### Development Mode
- CSP allows `'unsafe-inline'` for hot reload compatibility
- Comprehensive logging of CSP policy and violations
- Automatic guidance for fixing violations

### Production Mode
- **Nonce-based approach** for inline scripts and styles
- Minimal essential hashes for common patterns
- Reports violations with actionable guidance
- Dynamic hash extraction from real violations

## The Nonce-First Approach

### Why Nonces Over Hashes?

1. **Reliability**: Nonces work for any content, hashes must match exactly
2. **Maintainability**: No need to pre-compute and maintain hash lists
3. **Dynamic Content**: Perfect for server-rendered content
4. **Framework Compatibility**: Works seamlessly with Next.js SSR

### Using Nonces in Components

```tsx
// Server Component with nonce for inline styles
import { getNonce, getStyleProps, getScriptProps } from '@/lib/nonce';

export default async function MyComponent() {
  const nonce = await getNonce();
  
  return (
    <>
      {/* Method 1: Direct nonce usage */}
      <style nonce={nonce}>
        {`.custom-style { color: red; }`}
      </style>
      
      {/* Method 2: Using utility props */}
      <style {...await getStyleProps()}>
        {`.my-class { display: flex; }`}
      </style>
      
      {/* Inline script with nonce */}
      <script {...await getScriptProps()}>
        console.log('This script has a nonce');
      </script>
    </>
  );
}
```

### Clean CSS-in-JS Patterns

```tsx
// ✅ Server Component with dynamic styles (no dangerouslySetInnerHTML)
import { getNonce } from '@/lib/nonce';

export default async function DynamicComponent({ 
  color, 
  isVisible 
}: { 
  color: string; 
  isVisible: boolean; 
}) {
  const nonce = await getNonce();
  
  // Generate CSS dynamically
  const dynamicCSS = `
    .dynamic-element {
      color: ${color};
      opacity: ${isVisible ? 1 : 0};
      transition: opacity 0.3s ease;
    }
  `;
  
  return (
    <div>
      <style nonce={nonce}>
        {dynamicCSS}
      </style>
      <div className="dynamic-element">
        Dynamic content with safe inline styles
      </div>
    </div>
  );
}
```

### Using Next.js Script Component

```tsx
import Script from 'next/script';
import { getNonceProps } from '@/lib/nonce';

export default async function Page() {
  return (
    <>
      <Script
        {...await getNonceProps()}
        src="https://example.com/script.js"
        strategy="afterInteractive"
      />
    </>
  );
}
```

## Static vs Dynamic Routes CSP Handling

### Understanding Route Types

**Dynamic Routes (SSR)**
- Pages that render on each request
- Have access to middleware-generated nonces
- Can use inline styles with nonces safely
- Examples: `/api/users/[id]`, pages with `getServerSideProps`

**Static Routes (SSG)**
- Pages pre-rendered at build time
- No access to request-time nonces
- Must rely on CSS classes and essential hashes
- Examples: Static pages, pages with `getStaticProps`

### Route-Specific Solutions

#### Dynamic Routes - Nonce-First Approach ✅

```tsx
// Dynamic page with nonce support
import { getNonce, getRouteType, getStyleProps } from '@/lib/nonce';

export default async function DynamicPage({ params }: { params: { id: string } }) {
  const nonce = await getNonce();
  const routeType = await getRouteType(); // Will be 'dynamic'
  
  return (
    <div>
      {/* ✅ Use nonces for inline styles in dynamic routes */}
      <style {...await getStyleProps()}>
        {`.dynamic-content-${params.id} { 
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          transform: translateX(${Math.random() * 100}px);
        }`}
      </style>
      
      <div className={`dynamic-content-${params.id}`}>
        Dynamic content with inline styles
      </div>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
```

#### Static Routes - Hash & CSS Class Approach ✅

```tsx
// Static page using CSS classes and essential hashes
import { getRouteType, canUseInlineStyles } from '@/lib/nonce';
import styles from './static-page.module.css';

export default async function StaticPage() {
  const routeType = await getRouteType(); // Will be 'static'
  const canInline = await canUseInlineStyles(); // Will be false in production
  
  return (
    <div>
      {/* ✅ Use CSS modules for static routes */}
      <div className={styles.heroSection}>
        Static content with CSS modules
      </div>
      
      {/* ✅ Essential inline styles work via CSP hashes */}
      <div style={{ display: 'none' }} id="hidden-element">
        Hidden element (works via essential hash)
      </div>
      
      {/* ✅ Conditional rendering based on route type */}
      {canInline ? (
        <style>{`.inline-style { color: red; }`}</style>
      ) : (
        <div className="text-red-500">Using CSS class instead</div>
      )}
    </div>
  );
}

// Force static generation
export async function generateStaticParams() {
  return [];
}
```

#### Universal Component Pattern ✅

```tsx
// Component that works in both static and dynamic contexts
import { 
  getSmartStyleProps, 
  canUseInlineStyles, 
  getStyleRecommendation 
} from '@/lib/nonce';

interface UniversalComponentProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default async function UniversalComponent({ 
  color = '#3b82f6', 
  size = 'md' 
}: UniversalComponentProps) {
  const canInline = await canUseInlineStyles();
  const recommendation = await getStyleRecommendation();
  
  if (canInline && recommendation === 'inline-with-nonce') {
    // Dynamic route with nonce - use inline styles
    return (
      <div>
        <style {...await getSmartStyleProps()}>
          {`.universal-component {
            color: ${color};
            font-size: ${size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px'};
            transition: all 0.3s ease;
          }`}
        </style>
        <div className="universal-component">
          Dynamic styling with nonce
        </div>
      </div>
    );
  }
  
  // Static route or no nonce - use CSS classes with CSS custom properties
  return (
    <div 
      className={`universal-fallback universal-${size}`}
      style={{ '--custom-color': color } as React.CSSProperties}
    >
      Static-friendly styling
    </div>
  );
}

// Add this to your global CSS or CSS module:
/*
.universal-fallback {
  color: var(--custom-color, #3b82f6);
  transition: all 0.3s ease;
}
.universal-sm { font-size: 14px; }
.universal-md { font-size: 16px; }
.universal-lg { font-size: 18px; }
*/
```

### CSP Configuration for Mixed Routes

```typescript
// Enhanced CSP configuration in csp-utils.ts
const essentialHashes = [
  // Common Next.js generated styles
  "'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='", // display: none;
  "'sha256-ZdHxw9eWtnxUb3mk6tBS+gIiVUPE3pGM470keHPDFlE='", // display: none (with space)
  "'sha256-1OjyRYLAOH1vhXLUN4bBHal0rWxuwBDBP220NNc0CNU='", // pointer-events: none
  "'sha256-0LPZoaUlRg6skhVDAsOXJDYd0QywFnns8TclTlStHUs='", // pointer-events: none (with space)
  // Position utilities for layout components
  "'sha256-eIUqgPTKhr3+WsA7FtEp+r8ITeTom+YQ/XO6GMvUtjc='", // position: relative
  "'sha256-415p3tp0k2vBVlfOCp3y9A0E7FHpOjI/3UNmbvG9plQ='", // position: fixed
  // Opacity utilities for animations
  "'sha256-hcUjSVUy038f+0X6P07svdIrF4humQP+99vTrfpW7yw='", // opacity: 0
  "'sha256-HR9xQdgQEoSMsYaCHDewSoyTIrWmPuiSgpMBPMlO+8E='", // opacity: 1
];
```

### Testing Both Route Types

```bash
# Test dynamic routes (should have nonces)
curl -I http://localhost:3000/api/users/123
# Look for: Content-Security-Policy: ... 'nonce-abc123' ...

# Test static routes (should work with hashes)
curl -I http://localhost:3000/about
# Should work without CSP violations

# Debug route type detection
npm run dev
# Navigate to any page and check console for route type detection
```

### Troubleshooting Route-Specific Issues

#### Issue: Static pages have CSP violations

**Solution**: Use CSS classes or external CSS instead of inline styles

```tsx
// ❌ Don't do this in static routes
<div style={{ backgroundColor: dynamicColor }}>

// ✅ Do this instead
<div 
  className="dynamic-bg" 
  style={{ '--bg-color': dynamicColor } as React.CSSProperties}
>
```

#### Issue: Dynamic pages not getting nonces

**Solution**: Ensure proper dynamic rendering

```tsx
// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Or use dynamic imports
import dynamic from 'next/dynamic';
const DynamicComponent = dynamic(() => import('./DynamicComponent'), {
  ssr: false
});
```

#### Issue: Mixed static/dynamic content

**Solution**: Use the universal component pattern with smart detection

```tsx
import { getRouteType, canUseInlineStyles } from '@/lib/nonce';

export default async function SmartComponent() {
  const routeType = await getRouteType();
  const canInline = await canUseInlineStyles();
  
  // Adapt rendering based on route type
  if (routeType === 'dynamic' && canInline) {
    return <DynamicVersion />;
  }
  
  return <StaticVersion />;
}
```

## Handling CSP Violations (Updated Process)

### When You See a CSP Violation

1. **Check if nonce can be used** (preferred solution)
2. **If hash is needed**, capture from actual violation
3. **Use our enhanced tools** for hash management

### Enhanced Violation Handling

```bash
# 1. View captured violations and suggested hashes
curl http://localhost:3000/api/csp-report

# 2. Extract hash from CSP error message
node scripts/csp-hash-helper.mjs --extract "Either the 'unsafe-inline' keyword, a hash ('sha256-ABC123='), or a nonce"

# 3. Generate hash from actual content
node scripts/csp-hash-helper.mjs --content "display: none;"

# 4. Analyze built application for inline styles
npm run build
node scripts/capture-inline-styles.mjs
```

### Best Practice Workflow

1. **First**: Try to use nonces for inline content
   ```tsx
   // ✅ Preferred approach
   const nonce = await getNonce();
   return <style nonce={nonce}>{css}</style>;
   ```

2. **If nonces don't work**: Move to external CSS
   ```tsx
   // ✅ Even better approach
   import styles from './component.module.css';
   return <div className={styles.myClass} />;
   ```

3. **Only as last resort**: Use hashes for specific inline styles
   ```tsx
   // ⚠️ Use only when necessary
   // Add hash to essentialHashes in csp-utils.ts
   ```

## Production Strategy

### Minimal Hash Approach

Our production CSP now uses:
- **Primary**: Nonces for dynamic content
- **Secondary**: Only essential, verified hashes
- **Fallback**: External CSS files

```typescript
// Only verified, essential hashes included
const essentialHashes = [
  "'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='", // display: none; - verified
  // Add more only when absolutely necessary
];
```

### Dynamic Hash Capture

The enhanced CSP report endpoint now:
- Analyzes violations in real-time
- Provides specific guidance for each violation
- Suggests nonce usage where applicable
- Logs actionable fix commands

## Development Guidelines

### Avoiding Inline Styles (Recommended)

```tsx
// ❌ Avoid inline styles
<div style={{ display: 'none' }}>Hidden</div>

// ✅ Use CSS classes
<div className="hidden">Hidden</div>

// ✅ Use CSS Modules
import styles from './component.module.css';
<div className={styles.hidden}>Hidden</div>

// ✅ If inline is necessary, use nonce
const nonce = await getNonce();
<div style={{ display: 'none' }} nonce={nonce}>Hidden</div>
```

### Component Patterns

```tsx
// ✅ Server Component with conditional styling
import { getNonce, hasNonce } from '@/lib/nonce';

export default async function ConditionalComponent({ 
  isVisible 
}: { 
  isVisible: boolean 
}) {
  if (!isVisible) {
    return null; // Better than inline display: none
  }
  
  const nonce = await getNonce();
  const nonceAvailable = await hasNonce();
  
  if (!nonceAvailable) {
    // Fallback to CSS classes when nonce not available
    return <div className="dynamic-fallback">Fallback content</div>;
  }
  
  return (
    <div>
      {/* Use nonce for necessary inline styles */}
      <style nonce={nonce}>
        {`.dynamic-style { 
          transform: translateX(${Math.random() * 100}px); 
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        }`}
      </style>
      <div className="dynamic-style">Dynamic content</div>
    </div>
  );
}

// ✅ Clean responsive component with nonces
export default async function ResponsiveComponent({ 
  breakpoint = 'md' 
}: { 
  breakpoint?: 'sm' | 'md' | 'lg' 
}) {
  const nonce = await getNonce();
  
  const breakpoints = {
    sm: '640px',
    md: '768px', 
    lg: '1024px'
  };
  
  const responsiveCSS = `
```

## getStaticProps and CSP Style-src Limitations

### **The Fundamental Problem**

Pages using `getStaticProps` are **pre-rendered at build time** with **zero access to request context**:

- ❌ No middleware execution during build
- ❌ No request headers available 
- ❌ No nonces generated
- ❌ `getNonce()` always returns `null`

```tsx
// ❌ This approach CANNOT work with getStaticProps
export default function StaticPage() {
  const nonce = await getNonce(); // Always null at build time!
  
  return (
    <style nonce={nonce}> {/* Nonce is null - CSP violation! */}
      .my-style { color: red; }
    </style>
  );
}

export async function getStaticProps() {
  // Runs at BUILD TIME - no request context
  return { props: {} };
}
```

### **Solution 1: CSS Classes + Essential Hashes ✅**

**Best approach for static pages** - use CSS classes and rely on essential hashes:

```tsx
// ✅ Static page with CSS classes
import { getRouteType, canUseInlineStyles } from '@/lib/nonce';
import styles from './page.module.css';

export default async function StaticPage({ products }) {
  const routeType = await getRouteType(); // Will detect 'static'
  const canInline = await canUseInlineStyles(); // Will be false in production
  
  return (
    <div>
      {/* ✅ Use CSS modules for styling */}
      <div className={styles.productGrid}>
        {products.map(product => (
          <div key={product.id} className={styles.productCard}>
            <h3>{product.name}</h3>
            
            {/* ✅ Essential inline styles work via CSP hashes */}
            <div style={{ display: product.available ? 'block' : 'none' }}>
              In Stock
            </div>
          </div>
        ))}
      </div>
      
      {/* ✅ Conditional approach based on route type */}
      {!canInline && (
        <div className="text-gray-500">
          Static page - using CSS classes for styling
        </div>
      )}
    </div>
  );
}

export async function getStaticProps() {
  // Fetch data at build time
  const products = await fetchProducts();
  
  return {
    props: { products },
    revalidate: 3600, // Revalidate every hour
  };
}
```

**Corresponding CSS module** (`page.module.css`):
```css
.productGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.productCard {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### **Solution 2: CSS Custom Properties for Dynamic Values ✅**

For cases where you need **dynamic styling** in static pages:

```tsx
import { createSafeCSSProps } from '@/lib/utils';

export default function StaticProductPage({ product }) {
  // ✅ Use CSS custom properties for dynamic values
  const dynamicStyles = createSafeCSSProps({
    brandColor: product.brandColor,
    stockLevel: `${product.stockPercentage}%`,
    priority: product.priority
  });
  
  return (
    <div className="product-container" style={dynamicStyles}>
      {/* ✅ CSS classes consume the custom properties */}
      <div className="product-header">
        <h1>{product.name}</h1>
      </div>
      
      <div className="stock-indicator">
        Stock: {product.stockPercentage}%
      </div>
      
      <div className="priority-badge">
        Priority: {product.priority}
      </div>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const product = await fetchProduct(params.id);
  
  return {
    props: { product }
  };
}

export async function getStaticPaths() {
  const products = await fetchAllProducts();
  
  return {
    paths: products.map(p => ({ params: { id: p.id } })),
    fallback: 'blocking'
  };
}
```

**Global CSS** to consume custom properties:
```css
.product-container {
  --brand-color: #3b82f6; /* Default fallback */
  --stock-level: 50%;
  --priority: medium;
}

.product-header {
  background: linear-gradient(45deg, var(--brand-color), #8b5cf6);
  color: white;
  padding: 1rem;
}

.stock-indicator::after {
  content: '';
  width: var(--stock-level);
  height: 4px;
  background: var(--brand-color);
  display: block;
}

.priority-badge {
  opacity: var(--priority) === 'high' ? 1 : 0.7;
}
```

### **Solution 3: Hybrid Static + Client-side Enhancement ✅**

For complex dynamic styling, use **static base + client enhancement**:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useNonceAvailable } from '@/lib/nonce';
import styles from './interactive-page.module.css';

// ✅ This can work in both static and dynamic contexts
export default function HybridPage({ 
  initialData, 
  staticContent 
}: { 
  initialData: any; 
  staticContent: string; 
}) {
  const [dynamicStyles, setDynamicStyles] = useState<string>('');
  const nonceAvailable = useNonceAvailable();
  
  useEffect(() => {
    // Client-side: generate dynamic styles safely
    if (nonceAvailable) {
      // If nonces are available in DOM, use inline styles
      setDynamicStyles(`
        .dynamic-element {
          transform: translateX(${Math.random() * 100}px);
          background: hsl(${Math.random() * 360}, 70%, 50%);
        }
      `);
    } else {
      // Fallback: use CSS classes with JavaScript
      document.documentElement.style.setProperty(
        '--random-x', 
        `${Math.random() * 100}px`
      );
      document.documentElement.style.setProperty(
        '--random-hue', 
        `${Math.random() * 360}`
      );
    }
  }, [nonceAvailable]);
  
  return (
    <div>
      {/* ✅ Static content works immediately */}
      <div className={styles.staticContent}>
        {staticContent}
      </div>
      
      {/* ✅ Dynamic content enhanced on client */}
      {dynamicStyles && (
        <style>{dynamicStyles}</style>
      )}
      
      <div className="dynamic-element fallback-dynamic">
        Enhanced dynamically
      </div>
    </div>
  );
}

// This can still use getStaticProps for the base content
export async function getStaticProps() {
  return {
    props: {
      initialData: await fetchStaticData(),
      staticContent: 'This content is static and CSP-safe'
    }
  };
}
```

**CSS with fallback variables**:
```css
.fallback-dynamic {
  transform: translateX(var(--random-x, 0px));
  background: hsl(var(--random-hue, 200), 70%, 50%);
  transition: all 0.3s ease;
}
```

### **Solution 4: Convert to SSR for Nonce Support ✅**

If you **really need nonces**, convert from static to dynamic:

```tsx
// ✅ Convert getStaticProps to getServerSideProps for nonce access
import { getNonce, getStyleProps } from '@/lib/nonce';

export default async function DynamicPage({ product }) {
  const nonce = await getNonce(); // Now available!
  
  return (
    <div>
      {/* ✅ Nonces work with SSR */}
      <style {...await getStyleProps()}>
        {`.product-${product.id} {
          background: ${product.brandColor};
          border: 2px solid ${product.accentColor};
        }`}
      </style>
      
      <div className={`product-${product.id}`}>
        {product.name}
      </div>
    </div>
  );
}

// ✅ Use getServerSideProps instead of getStaticProps
export async function getServerSideProps({ params }) {
  const product = await fetchProduct(params.id);
  
  return {
    props: { product }
  };
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
```

### **CSP Configuration for Static Pages**

Ensure your CSP includes essential hashes for static page styles:

```typescript
// In csp-utils.ts - these hashes support static pages
const essentialHashes = [
  // Common static page styles
  "'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='", // display: none;
  "'sha256-ZdHxw9eWtnxUb3mk6tBS+gIiVUPE3pGM470keHPDFlE='", // display: none (spaced)
  "'sha256-1OjyRYLAOH1vhXLUN4bBHal0rWxuwBDBP220NNc0CNU='", // pointer-events: none
  // Add more as needed for your static pages
];
```

### **Best Practices Summary**

1. **✅ Use CSS modules/classes** for static page styling
2. **✅ Leverage CSS custom properties** for dynamic values  
3. **✅ Rely on essential hashes** for basic inline styles
4. **✅ Consider SSR conversion** if nonces are critical
5. **❌ Never expect nonces** in `getStaticProps` pages

The fundamental rule: **Static generation = No nonces**. Plan your styling approach accordingly.

## Static vs Dynamic Routes CSP Handling