import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import jwt from "jsonwebtoken";
import { UserRole } from "@/types/users";
// Properly extend the User type to include token and role
interface ExtendedUser extends User {
  token?: string;
  role?: UserRole;
  displayName?: string;
  logo_url?: string;
  phoneNumber?: string;
  address?: string;
}

// Define the token type for better type safety
interface JWTToken {
  id?: number;
  displayName?: string;
  logo_url?: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

// Add this declaration to extend the default session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      token?: string;
      role?: UserRole;
      displayName?: string;
      logo_url?: string;
      email?: string; 
    } 
  }

  interface User {
    token?: string;
    role?: UserRole;
    email?: string;
    displayName?: string;
    logo_url?: string;
  }
}

// Helper functions to reduce cognitive complexity
const validateCredentials = (credentials: Record<string, string> | undefined) => {
  if (!credentials?.email || !credentials?.password || !credentials?.csrfToken) {
    throw new Error("MISSING_CREDENTIALS");
  }
};

const validateResponse = (result: { statusCode?: number }) => {
  if (result.statusCode === 401) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (result.statusCode === 500) {
    throw new Error("SERVER_ERROR_500");
  }
  if (result.statusCode && result.statusCode !== 200) {
    throw new Error(`SERVER_ERROR_${result.statusCode}`);
  }
};

const validateUserData = (userData: { token?: string }) => {
  if (!userData || !userData.token) {
    throw new Error("INVALID_RESPONSE_FORMAT");
  }
  
  const userDataDecoded = jwt.decode(userData.token) as JWTToken;
  if (!userDataDecoded) {
    throw new Error("INVALID_TOKEN_FORMAT");
  }
  
  return userDataDecoded;
};

const handleAuthError = (error: unknown) => {
  if (!(error instanceof Error)) {
    throw new Error("UNKNOWN_ERROR");
  }

  const errorMappings = [
    { pattern: 'fetch', code: 'NETWORK_ERROR' },
    { pattern: 'ECONNREFUSED', code: 'CONNECTION_REFUSED' },
    { pattern: 'timeout', code: 'TIMEOUT_ERROR' }
  ];

  const mapping = errorMappings.find(m => error.message.includes(m.pattern));
  throw new Error(mapping ? mapping.code : error.message);
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
        csrfToken: { label: "csrfToken", type: "hidden" },
      },
      async authorize(credentials) {
        try {
          validateCredentials(credentials);
          
          if (!credentials) {
            return null;
          }

          const response = await fetch(
            `${process.env.NEXTAUTH_URL!}/api/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`SERVER_ERROR_${response.status}`);
          }
          
          const result = await response.json();
          validateResponse(result);

          const userData = result.data;
          const userDataDecoded = validateUserData(userData);

          const user: ExtendedUser = {
            id: userDataDecoded.id?.toString() || credentials.email,
            token: userData.token,
            email: credentials.email,
            role: userDataDecoded.role as UserRole,
            displayName: userDataDecoded.displayName || undefined,
            logo_url: userDataDecoded.logo_url || undefined,
          };

          return user;

        } catch (error) {
          handleAuthError(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Type assertion for user
      const extendedUser = user as ExtendedUser | undefined;
      
      if (extendedUser?.token) {
        token.token = extendedUser.token; // Store the raw token
        token.displayName = extendedUser.displayName;
        token.role = extendedUser.role;

        // Decode the token if it's a JWT
        try {
          const decoded = jwt.decode(extendedUser.token) as JWTToken;

          if (decoded?.id) {
            token.id = decoded.id;
          }
          if (decoded?.displayName) {
            token.displayName = decoded.displayName;
          }
          if (decoded?.role) {
            token.role = decoded.role;
          }
          
        } catch {
        }
      }
      return token;
    },
    async session({ session, token }) {
      try {
        // Safely decode the token and extract user information
        if (token.token) {
          const tokenDecoded = jwt.decode(token.token as string) as JWTToken;
          
          // Update session with token information
          session.user.token = token.token as string;
          session.user.id = token.id as string;
          session.user.displayName = token.displayName as string;
          
          // Only set role if available in the decoded token
          if (tokenDecoded?.role) {
            session.user.role = tokenDecoded.role as UserRole;
          }
        }

        session.expires = new Date(token?.exp as number * 1000).toISOString();

      } catch { 
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle error redirects with minimal response
      if (url.startsWith('/api/auth/error')) {
        const errorParam = url.split('error=')[1] || 'Unknown error';
        return `${baseUrl}/login?error=${encodeURIComponent(errorParam)}`;
      }
      
      // Handle callback URLs with security validation
      if (url.includes('callbackUrl=')) {
        const callbackUrl = new URL(url).searchParams.get('callbackUrl');
        if (callbackUrl) {
          // Validate callback URL to prevent open redirects
          try {
            const urlObj = new URL(callbackUrl);
            // Only allow same origin redirects
            if (urlObj.origin === baseUrl) {
              return callbackUrl;
            }
          } catch {
            // If URL parsing fails, check if it's a safe relative path
            if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
              return `${baseUrl}${callbackUrl}`;
            }
          }
        }
      }
      
      // For relative URLs, ensure they're safe
      if (url.startsWith('/') && !url.startsWith('//')) {
        return `${baseUrl}${url}`;
      }
      
      // For absolute URLs, only allow same origin
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) {
          return url;
        }
      } catch {
        // Invalid URL, fallback to base
      }
      
      // Default fallback - always return to base URL for security
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
    updateAge: 0, // Disable session updates
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET! || "",
    maxAge: 60 * 60 * 24, // 1 day
  },
  // Enhanced security options
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 60 * 60 * 24, // 1 day
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 60 * 60 * 24, // 1 day
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 60 * 60 * 24, // 1 day
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 60 * 60 * 24, // 1 day
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
  },
  // Enhanced security settings
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  useSecureCookies: process.env.NODE_ENV === "production",
};
