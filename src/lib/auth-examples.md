# Authentication Utilities Examples

This document shows how to use the authentication utilities for different access control scenarios.

## Basic Usage Examples

### 1. Admin-Only Pages (like login page pattern)

```typescript
// src/app/admin/page.tsx
import { requireAdmin } from "@/lib/auth-utils";
import AdminComponent from "@/components/AdminComponent";

export default async function AdminPage() {
  // Automatically redirects to /login if not admin
  const session = await requireAdmin();
  
  return <AdminComponent />;
}
```

### 2. Authentication Required (any logged-in user)

```typescript
// src/app/profile/page.tsx
import { requireAuth } from "@/lib/auth-utils";
import ProfileComponent from "@/components/ProfileComponent";

export default async function ProfilePage() {
  // Redirects to /login if not authenticated
  const session = await requireAuth();
  
  return <ProfileComponent user={session.user} />;
}
```

### 3. Specific Roles Required

```typescript
// src/app/moderator/page.tsx
import { requireRoles } from "@/lib/auth-utils";
import ModeratorComponent from "@/components/ModeratorComponent";

export default async function ModeratorPage() {
  // Allows both admin and moderator roles
  const session = await requireRoles(["admin", "moderator"]);
  
  return <ModeratorComponent />;
}
```

### 4. Custom Redirect Location

```typescript
// src/app/special-admin/page.tsx
import { requireAdmin } from "@/lib/auth-utils";
import SpecialAdminComponent from "@/components/SpecialAdminComponent";

export default async function SpecialAdminPage() {
  // Redirects to custom location if not admin
  const session = await requireAdmin("/unauthorized");
  
  return <SpecialAdminComponent />;
}
```

### 5. Advanced Auth Checks

```typescript
// src/app/complex-auth/page.tsx
import { checkAuth } from "@/lib/auth-utils";
import ComplexComponent from "@/components/ComplexComponent";

export default async function ComplexAuthPage() {
  // Complex auth requirements
  const session = await checkAuth({
    requireAuth: true,
    allowRoles: ["admin", "verified", "premium"],
    redirectTo: "/upgrade"
  });
  
  return <ComplexComponent />;
}
```

## Non-Redirecting Checks (for conditional rendering)

### 6. Check Authentication Status

```typescript
// src/app/conditional/page.tsx
import { isAuthenticated, isAdmin, getCurrentUser } from "@/lib/auth-utils";
import PublicComponent from "@/components/PublicComponent";
import AuthenticatedComponent from "@/components/AuthenticatedComponent";
import AdminComponent from "@/components/AdminComponent";

export default async function ConditionalPage() {
  const authenticated = await isAuthenticated();
  const admin = await isAdmin();
  const user = await getCurrentUser();
  
  if (admin) {
    return <AdminComponent user={user} />;
  }
  
  if (authenticated) {
    return <AuthenticatedComponent user={user} />;
  }
  
  return <PublicComponent />;
}
```

## Real-World Examples

### 7. Blog Management (Admin Only)

```typescript
// src/app/blog-management/page.tsx
import { requireAdmin } from "@/lib/auth-utils";
import BlogManagementClient from "@/components/blogs/BlogManagementClient";

export default async function BlogManagementPage() {
  // Server-side admin check - automatically redirects if not admin
  await requireAdmin();

  return <BlogManagementClient />;
}
```

### 8. User Dashboard (Auth Required)

```typescript
// src/app/dashboard/page.tsx
import { requireAuth } from "@/lib/auth-utils";
import DashboardComponent from "@/components/DashboardComponent";

export default async function DashboardPage() {
  const session = await requireAuth();
  
  return <DashboardComponent userId={session.user.id} />;
}
```

### 9. Store Management (Admin or Store Owner)

```typescript
// src/app/store-management/page.tsx
import { checkAuth } from "@/lib/auth-utils";
import StoreManagementComponent from "@/components/StoreManagementComponent";

export default async function StoreManagementPage() {
  const session = await checkAuth({
    requireAuth: true,
    allowRoles: ["admin", "store_owner"],
    redirectTo: "/apply-store"
  });
  
  return <StoreManagementComponent />;
}
```

## Benefits of This Approach

1. **Server-Side Security**: Authentication checks happen on the server before the page renders
2. **Automatic Redirects**: No need to manually handle redirect logic
3. **Consistent Pattern**: Same pattern as your login page
4. **Type Safety**: Full TypeScript support with session types
5. **Flexible**: Support for multiple roles and custom redirect locations
6. **Performance**: No client-side authentication flashing
7. **SEO Friendly**: Proper HTTP redirects instead of client-side navigation

## Migration from Client-Side Checks

### Before (Client-Side)
```typescript
// ❌ Client-side check - can cause flashing and security issues
export default function AdminPage() {
  const { data: session } = useSession();
  
  if (!session || session.user.role !== "admin") {
    router.push("/login");
    return <div>Redirecting...</div>;
  }
  
  return <AdminComponent />;
}
```

### After (Server-Side)
```typescript
// ✅ Server-side check - secure and no flashing
export default async function AdminPage() {
  await requireAdmin();
  return <AdminComponent />;
}
```

## Security Headers

All authentication-related pages automatically get enhanced security headers through your middleware:

- `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
- `Pragma: no-cache`
- `Expires: 0`
- `X-Redirect-Security: minimal-response`
- `X-Auth-Page: true`

This prevents caching of sensitive authentication data and provides additional security for auth-related redirects. 