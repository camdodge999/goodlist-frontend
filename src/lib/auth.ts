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
          // Early validation of required fields
          if (!credentials?.email || !credentials?.password || !credentials?.csrfToken) { 
            throw new Error("MISSING_CREDENTIALS");
          }

          // Proceed with authentication
          const response = await fetch(
            `${process.env.NEXTAUTH_BACKEND_URL!}/api/auth/login`,
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

          // Check if the response is ok (status 200-299)
          if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            throw new Error(`SERVER_ERROR_${response.status}`);
          }
          
          const result = await response.json();
          console.log("Auth response:", result);

          if (result.statusCode === 401) {
            console.error("Authentication failed:", result.error);
            throw new Error("INVALID_CREDENTIALS");
          } else if (result.statusCode === 500) {
            console.error("Internal server error:", result.error);
            throw new Error("SERVER_ERROR_500");
          } else if (result.statusCode && result.statusCode !== 200) {
            console.error(`Server error ${result.statusCode}:`, result.error);
            throw new Error(`SERVER_ERROR_${result.statusCode}`);
          }

          // Handle successful authentication
          const userData = result.data;

          if (!userData || !userData.token) {
            throw new Error("INVALID_RESPONSE_FORMAT");
          }

          const userDataDecoded = jwt.decode(userData.token) as JWTToken;

          if (!userDataDecoded) {
            throw new Error("INVALID_TOKEN_FORMAT");
          }

          // Ensure the returned object matches the ExtendedUser type
          const user: ExtendedUser = {
            id: userDataDecoded.id?.toString() || credentials.email, // Ensure id is always a string
            token: userData.token,
            email: credentials.email,
            role: userDataDecoded.role as UserRole,
            displayName: userDataDecoded.displayName || undefined, // Optional name
            logo_url: userDataDecoded.logo_url || undefined,
          };

          return user;

        } catch (error) {
          console.error("Auth error details:", error);
          
          if (error instanceof Error) {
            // Handle specific fetch/network errors
            if (error.message.includes('fetch')) {
              throw new Error("NETWORK_ERROR");
            } else if (error.message.includes('ECONNREFUSED')) {
              throw new Error("CONNECTION_REFUSED");
            } else if (error.message.includes('timeout')) {
              throw new Error("TIMEOUT_ERROR");
            } else {
              // Re-throw the error with the specific error code for NextAuth to handle
              throw new Error(error.message);
            }
          } else {
            // Handle unknown error types
            console.error("Unknown auth error:", error);
            throw new Error("UNKNOWN_ERROR");
          }
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

          if (decoded && decoded.id) {
            token.id = decoded.id;
          }
          if (decoded && decoded.displayName) {
            token.displayName = decoded.displayName;
          }
          if (decoded && decoded.role) {
            token.role = decoded.role;
          }
          
        } catch (error) {
          console.error("Failed to decode token:", error);
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
      } catch (error) {
        console.error("Error processing session:", error);
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle error redirects
      if (url.startsWith('/api/auth/error')) {
        return `${baseUrl}/login?error=${encodeURIComponent(url.split('error=')[1] || 'Unknown error')}`;
      }
      
      // Handle callback URLs
      if (url.includes('callbackUrl=')) {
        const callbackUrl = new URL(url).searchParams.get('callbackUrl');
        if (callbackUrl) {
          // Check if it's an absolute URL
          try {
            const urlObj = new URL(callbackUrl);
            // If it's same origin or a relative path, allow it
            if (urlObj.origin === baseUrl || callbackUrl.startsWith('/')) {
              return callbackUrl;
            }
          } catch {
            // If URL parsing fails, it's likely a relative path
            if (callbackUrl.startsWith('/')) {
              return `${baseUrl}${callbackUrl}`;
            }
          }
        }
      }
      
      // Redirect to baseUrl if url is relative
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allow redirects to same host
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
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
