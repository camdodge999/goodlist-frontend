# Professional Rate Limiting with `limiter` Package

This document shows how we've integrated the professional [`limiter` npm package](https://www.npmjs.com/package/limiter) for enterprise-grade rate limiting with token bucket algorithms.

## Features of the `limiter` Package

✅ **Token Bucket Algorithm** - More sophisticated than simple counters  
✅ **Built-in TypeScript Support** - Type-safe implementation  
✅ **Configurable Intervals** - Support for seconds, minutes, hours, days  
✅ **Burst Protection** - Allows short bursts while maintaining sustained limits  
✅ **Async/Sync Methods** - Flexible usage patterns  
✅ **Production Ready** - 5.6M+ weekly downloads, battle-tested  

## Basic Usage

### Simple Rate Limiting

```tsx
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  // Check rate limit using token bucket algorithm
  const rateLimitResult = await checkRateLimit(
    request, 
    RATE_LIMITS.LOGIN, 
    'login'
  );
  
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { 
        message: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.` 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        }
      }
    );
  }

  // Process request...
}
```

### Synchronous Rate Limiting (Non-blocking)

```tsx
import { checkRateLimitSync, RATE_LIMITS } from '@/lib/rate-limiter';

export function middleware(request: NextRequest) {
  // Non-blocking check - perfect for middleware
  const rateLimitResult = checkRateLimitSync(
    request, 
    RATE_LIMITS.API_GENERAL
  );
  
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { message: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}
```

## Advanced Features

### 1. Burst Rate Limiting

Allows short bursts while maintaining sustained limits:

```tsx
import { createBurstRateLimiter } from '@/lib/rate-limiter';

// Allow 10 requests per minute sustained, but up to 20 in a 10-second burst
const burstLimiter = createBurstRateLimiter(
  { tokensPerInterval: 10, interval: 'minute' },  // Sustained rate
  { tokensPerInterval: 20, interval: 10000 },     // Burst rate (10 seconds)
  'api-endpoint'
);

export async function POST(request: NextRequest) {
  const result = await burstLimiter(request);
  
  if (result.limited) {
    return NextResponse.json(
      { message: 'Burst limit exceeded' },
      { status: 429 }
    );
  }

  // Process request...
}
```

### 2. Custom Rate Limiting Middleware

```tsx
import { createRateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limiter';

// Create reusable middleware
const loginRateLimit = createRateLimitMiddleware(
  RATE_LIMITS.LOGIN,
  'login',
  {
    async: true,
    onLimitExceeded: (retryAfter) => {
      console.log(`Rate limit exceeded, retry after ${retryAfter} seconds`);
    }
  }
);

export async function POST(request: NextRequest) {
  const result = await loginRateLimit(request);
  
  if (result.limited) {
    return NextResponse.json(
      { message: 'Too many login attempts' },
      { status: 429 }
    );
  }

  // Process login...
}
```

### 3. Different Limits for Different Operations

```tsx
// Different rate limits for different operations
const CUSTOM_LIMITS = {
  SENSITIVE_OPERATION: { 
    tokensPerInterval: 1, 
    interval: 'hour' as const 
  },
  BULK_OPERATION: { 
    tokensPerInterval: 5, 
    interval: 'minute' as const 
  },
  REAL_TIME_API: { 
    tokensPerInterval: 100, 
    interval: 'second' as const 
  },
};

export async function POST(request: NextRequest) {
  const operation = request.headers.get('x-operation-type');
  
  let config;
  switch (operation) {
    case 'sensitive':
      config = CUSTOM_LIMITS.SENSITIVE_OPERATION;
      break;
    case 'bulk':
      config = CUSTOM_LIMITS.BULK_OPERATION;
      break;
    default:
      config = CUSTOM_LIMITS.REAL_TIME_API;
  }
  
  const result = await checkRateLimit(request, config, operation);
  
  if (result.limited) {
    return NextResponse.json(
      { message: `${operation} rate limit exceeded` },
      { status: 429 }
    );
  }

  // Process based on operation type...
}
```

### 4. User-Specific Rate Limiting

```tsx
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  
  // Different limits for authenticated vs anonymous users
  const config = userId 
    ? { tokensPerInterval: 100, interval: 'hour' as const }  // Authenticated
    : { tokensPerInterval: 10, interval: 'hour' as const };  // Anonymous
  
  const result = await checkRateLimit(
    request, 
    config, 
    userId ? `user:${userId}` : 'anonymous'
  );
  
  if (result.limited) {
    return NextResponse.json(
      { 
        message: userId 
          ? 'User rate limit exceeded' 
          : 'Anonymous rate limit exceeded. Please sign in for higher limits.' 
      },
      { status: 429 }
    );
  }

  // Process request...
}
```

## Rate Limiting Configuration

### Pre-configured Limits

```tsx
export const RATE_LIMITS = {
  // Authentication (stricter limits)
  LOGIN: { tokensPerInterval: 5, interval: 'minute' },
  REGISTRATION: { tokensPerInterval: 3, interval: 'hour' },
  PASSWORD_RESET: { tokensPerInterval: 3, interval: 'hour' },
  
  // Forms (moderate limits)
  VERIFICATION: { tokensPerInterval: 2, interval: 'hour' },
  REPORT: { tokensPerInterval: 5, interval: 'hour' },
  PROFILE_UPDATE: { tokensPerInterval: 10, interval: 'hour' },
  
  // API (generous limits)
  API_GENERAL: { tokensPerInterval: 100, interval: 'minute' },
  
  // Sensitive operations (very strict)
  OTP_SEND: { tokensPerInterval: 3, interval: 'hour' },
  PASSWORD_CHANGE: { tokensPerInterval: 5, interval: 'hour' },
};
```

### Custom Configuration

```tsx
// Fine-grained control with milliseconds
const customConfig = {
  tokensPerInterval: 10,
  interval: 5000, // 5 seconds in milliseconds
  fireImmediately: true // Don't wait, return immediately if limited
};

// Time-based intervals
const timeBasedConfigs = {
  perSecond: { tokensPerInterval: 10, interval: 'second' },
  perMinute: { tokensPerInterval: 100, interval: 'minute' },
  perHour: { tokensPerInterval: 1000, interval: 'hour' },
  perDay: { tokensPerInterval: 10000, interval: 'day' },
};
```

## Monitoring and Management

### Get Rate Limit Status

```tsx
import { getRemainingTokens, getActiveLimiters } from '@/lib/rate-limiter';

// Check remaining tokens for a user
export async function GET(request: NextRequest) {
  const remaining = getRemainingTokens(
    request, 
    RATE_LIMITS.API_GENERAL, 
    'api-check'
  );
  
  return NextResponse.json({
    remaining,
    limit: RATE_LIMITS.API_GENERAL.tokensPerInterval
  });
}

// Admin endpoint to view all active rate limiters
export async function GET() {
  const activeLimiters = getActiveLimiters();
  
  return NextResponse.json({
    totalLimiters: activeLimiters.length,
    limiters: activeLimiters
  });
}
```

### Reset Rate Limits (Admin)

```tsx
import { resetRateLimit } from '@/lib/rate-limiter';

// Admin function to reset rate limits
export async function POST(request: NextRequest) {
  const { ip, identifier } = await request.json();
  
  // Verify admin privileges here
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  resetRateLimit(ip, identifier);
  
  return NextResponse.json({ message: 'Rate limit reset successfully' });
}
```

### Cleanup Inactive Limiters

```tsx
import { cleanupInactiveLimiters } from '@/lib/rate-limiter';

// Scheduled job to clean up inactive limiters
export async function cleanupJob() {
  cleanupInactiveLimiters();
  console.log('Cleaned up inactive rate limiters');
}

// Run every hour
setInterval(cleanupJob, 60 * 60 * 1000);
```

## Integration with Forms

### Using with SecureForm Component

```tsx
import { SecureForm } from '@/components/ui/secure-form';

function LoginForm() {
  const handleSecureSubmit = async (formData: FormData, csrfToken: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    });

    // Rate limiting is handled automatically in the API route
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Too many attempts. Please try again in ${retryAfter} seconds.`);
    }

    // Handle other responses...
  };

  return (
    <SecureForm 
      onSecureSubmit={handleSecureSubmit}
      rateLimitKey="login" // This helps with monitoring
    >
      {/* Form fields */}
    </SecureForm>
  );
}
```

## Best Practices

### 1. **Choose Appropriate Intervals**
```tsx
// Good: Reasonable limits
{ tokensPerInterval: 5, interval: 'minute' }

// Too strict: May block legitimate users
{ tokensPerInterval: 1, interval: 'hour' }

// Too loose: Won't prevent abuse
{ tokensPerInterval: 1000, interval: 'second' }
```

### 2. **Use Different Identifiers**
```tsx
// Different limits for different contexts
await checkRateLimit(request, config, 'login');
await checkRateLimit(request, config, 'api');
await checkRateLimit(request, config, `user:${userId}`);
```

### 3. **Provide Clear Error Messages**
```tsx
if (result.limited) {
  return NextResponse.json(
    { 
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter
    },
    { 
      status: 429,
      headers: {
        'Retry-After': result.retryAfter?.toString() || '60'
      }
    }
  );
}
```

### 4. **Monitor and Log**
```tsx
if (result.limited) {
  console.warn('Rate limit exceeded', {
    ip: getClientIP(request),
    endpoint: request.url,
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });
}
```

## Advantages Over Simple Counter-Based Rate Limiting

1. **Token Bucket Algorithm**: More sophisticated than simple counters
2. **Burst Tolerance**: Allows short bursts of activity
3. **Smooth Rate Limiting**: Better user experience
4. **Memory Efficient**: Built-in cleanup mechanisms
5. **Production Ready**: Battle-tested with millions of downloads
6. **TypeScript Support**: Full type safety
7. **Flexible Configuration**: Multiple time intervals and patterns

The [`limiter` package](https://www.npmjs.com/package/limiter) provides enterprise-grade rate limiting that's much more robust than basic implementations. It's perfect for production applications that need reliable, scalable rate limiting. 