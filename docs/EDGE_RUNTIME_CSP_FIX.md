# Edge Runtime CSP Fix Guide

## Problem: Edge Runtime Crypto Error

When using Next.js middleware with CSP, you may encounter this error:

```
Error: The edge runtime does not support Node.js 'crypto' module.
```

This happens because Next.js middleware runs in the **Edge Runtime**, which has limited Node.js API support and doesn't include the Node.js `crypto` module.

---

## ✅ **Solution: Web Crypto API**

We've fixed this by using the **Web Crypto API** which is supported in Edge Runtime.

### **Fixed Middleware** (`src/middleware.ts`)

```typescript
/**
 * Generate a secure nonce using Web Crypto API (Edge Runtime compatible)
 */
function generateNonce(): string {
  // Use crypto.randomUUID() which is supported in Edge Runtime
  const uuid = crypto.randomUUID();
  
  // Convert UUID to base64 for nonce
  const encoder = new TextEncoder();
  const data = encoder.encode(uuid);
  
  // Convert to base64 manually since Buffer is not available
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  
  return btoa(binary);
}

export function middleware(request: NextRequest) {
  // Generate nonce using Edge Runtime compatible method
  const nonce = generateNonce();
  // ... rest of middleware
}
```

---

## 🔧 **Edge Runtime Compatible Utilities**

### **New Edge Crypto Utils** (`src/lib/edge-crypto-utils.ts`)

```typescript
/**
 * Generate SHA256 hash using Web Crypto API (Edge Runtime compatible)
 */
export async function generateSHA256HashEdge(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Convert to base64 manually (Edge Runtime compatible)
  let binary = '';
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  
  return `'sha256-${btoa(binary)}'`;
}
```

### **Edge Hash Generator CLI** (`scripts/generate-edge-hash.mjs`)

```bash
# Generate hash using Edge Runtime compatible method
node scripts/generate-edge-hash.mjs "display: none;"

# Generate common patterns
node scripts/generate-edge-hash.mjs --common

# Interactive mode
node scripts/generate-edge-hash.mjs --interactive

# Verify Edge Runtime compatibility
node scripts/generate-edge-hash.mjs --verify "content"
```

---

## 🔄 **Migration from Node.js Crypto**

### **Before (Node.js Crypto - ❌ Breaks in Edge Runtime)**

```typescript
import { createHash } from 'crypto';

// ❌ This breaks in Edge Runtime
function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

// ❌ This breaks in Edge Runtime
function generateHash(content: string): string {
  const hash = createHash('sha256');
  hash.update(content, 'utf8');
  return `'sha256-${hash.digest('base64')}'`;
}
```

### **After (Web Crypto API - ✅ Works in Edge Runtime)**

```typescript
// ✅ Edge Runtime compatible
function generateNonce(): string {
  const uuid = crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(uuid);
  
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  
  return btoa(binary);
}

// ✅ Edge Runtime compatible
async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  
  let binary = '';
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  
  return `'sha256-${btoa(binary)}'`;
}
```

---

## 🎯 **Available APIs in Edge Runtime**

### **✅ Supported (Use These)**

- `crypto.randomUUID()` - Generate random UUIDs
- `crypto.subtle.digest()` - SHA256 hashing
- `crypto.getRandomValues()` - Generate random bytes
- `TextEncoder` / `TextDecoder` - Text encoding
- `btoa()` / `atob()` - Base64 encoding
- `fetch()` - HTTP requests
- Basic JavaScript APIs

### **❌ Not Supported (Avoid These)**

- `crypto` module from Node.js
- `Buffer` - Use `TextEncoder` instead
- `fs` module - File system operations
- `path` module - Path operations
- Most Node.js built-in modules

---

## 🛠️ **Practical Usage**

### **1. Generate Hashes for Static Content**

```bash
# Use Edge Runtime compatible hash generator
node scripts/generate-edge-hash.mjs "display: none;"

# Output:
# 'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='
```

### **2. Add Hashes to Middleware**

```typescript
const STATIC_STYLE_HASHES = [
  "'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='", // display: none;
  "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='", // empty style
  // Add more hashes as needed
];
```

### **3. Dynamic Content Still Uses Nonces**

```tsx
// In your pages/components
import { getNonce } from '@/lib/nonce';

export default async function MyPage() {
  const nonce = await getNonce(); // Gets nonce from Edge Runtime middleware
  
  return (
    <style nonce={nonce}>
      {`
        .dynamic-content {
          background: ${userColor};
        }
      `}
    </style>
  );
}
```

---

## 🧪 **Testing Edge Runtime Compatibility**

### **1. Test Hash Generation**

```bash
# Test that hashes are generated correctly
node scripts/generate-edge-hash.mjs --verify "test content"

# Should output:
# ✅ Edge Runtime Compatibility Verified
# ✅ Web Crypto API: Available
# ✅ TextEncoder: Available
# ✅ crypto.subtle.digest: Working
# ✅ Base64 encoding: Working
```

### **2. Test Middleware**

```bash
# Start development server
npm run dev

# Check console for:
# 🔒 CSP Policy Applied (Edge Runtime Compatible): {
#   nonce: "ABC123...",
#   styleHashCount: 10,
#   scriptHashCount: 1,
#   policy: "default-src 'self'; script-src..."
# }
```

### **3. Verify in Browser**

```javascript
// In browser console
console.log('Nonce available:', !!window.__webpack_nonce__);
console.log('CSP headers:', document.querySelector('meta[http-equiv="Content-Security-Policy"]'));
```

---

## 🚀 **Production Deployment**

### **Pre-deployment Checklist**

- [ ] All hashes generated using Edge Runtime compatible method
- [ ] Middleware uses Web Crypto API (no Node.js crypto imports)
- [ ] Static content hashes added to `STATIC_STYLE_HASHES`
- [ ] Test page working without CSP violations
- [ ] No Edge Runtime errors in build logs

### **Deployment Verification**

```bash
# Build and check for Edge Runtime errors
npm run build

# Should not see any "edge runtime does not support" errors
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"edge runtime does not support Node.js 'crypto' module"**
   - ✅ **Solution**: Use `crypto.randomUUID()` and `crypto.subtle.digest()`
   - ❌ **Don't use**: `import { createHash } from 'crypto'`

2. **"Buffer is not defined"**
   - ✅ **Solution**: Use `TextEncoder` and manual base64 conversion
   - ❌ **Don't use**: `Buffer.from()` or `Buffer.toString()`

3. **"Hash mismatch between development and production"**
   - ✅ **Solution**: Use Edge Runtime compatible hash generator
   - Generate all hashes with `scripts/generate-edge-hash.mjs`

### **Debug Commands**

```bash
# Verify Edge Runtime compatibility
node scripts/generate-edge-hash.mjs --verify "your-content"

# Generate new hashes for middleware
node scripts/generate-edge-hash.mjs --common

# Test specific content
node scripts/generate-edge-hash.mjs "display: none;"
```

---

## 📊 **Comparison: Node.js vs Edge Runtime**

| Feature | Node.js Crypto | Web Crypto API (Edge) | Status |
|---------|----------------|------------------------|--------|
| SHA256 Hashing | `createHash('sha256')` | `crypto.subtle.digest('SHA-256')` | ✅ Fixed |
| Random UUID | `crypto.randomUUID()` | `crypto.randomUUID()` | ✅ Same API |
| Base64 Encoding | `Buffer.toString('base64')` | `btoa(binary)` | ✅ Fixed |
| Text Encoding | `Buffer.from(text, 'utf8')` | `TextEncoder().encode(text)` | ✅ Fixed |
| Performance | Synchronous | Asynchronous | ✅ Works |
| Runtime Support | Node.js only | Edge Runtime ✅ | ✅ Compatible |

---

## 📝 **Summary**

The Edge Runtime CSP fix provides:

1. **✅ Full Edge Runtime Compatibility** - No Node.js crypto dependencies
2. **🔒 Same Security Level** - Web Crypto API is just as secure
3. **⚡ Better Performance** - Edge Runtime is faster for middleware
4. **🛠️ Easy Migration** - Replace crypto imports with Web Crypto API
5. **📊 Hash Compatibility** - Generates identical hashes to Node.js version
6. **🧪 Testing Tools** - Edge Runtime compatible hash generator

**Result**: Your CSP implementation now works perfectly in Next.js Edge Runtime while maintaining all security benefits! 🚀 