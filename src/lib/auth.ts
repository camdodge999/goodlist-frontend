import CredentialsProvider from "next-auth/providers/credentials";
import type { DefaultSession, NextAuthOptions, User } from "next-auth";
import jwt from "jsonwebtoken";
import { UserRole } from "@/types/users";
// Properly extend the User type to include token and role
interface ExtendedUser extends User {
  token?: string;
  role?: UserRole;
  displayName?: string;
  image?: string;
  phoneNumber?: string;
  address?: string;
}

// Define the token type for better type safety
interface JWTToken {
  id?: number;
  displayName?: string;
  image?: string;
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
    } & DefaultSession["user"]
  }

  interface User {
    token?: string;
    role?: UserRole;
    email?: string;
    displayName?: string;
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
            throw new Error("Missing required credentials");
          }

          // Proceed with authentication
          const response = await fetch(
            `${process.env.NEXTAUTH_BACKEND_URL!}/auth/login`,
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

          
          const result = await response.json();

          if (result.statusCode !== 200) {
            console.error(result.message && "Authentication failed");
            return null;
          }

          // Handle successful authentication
          const userData = result.data;

          const userDataDecoded = jwt.decode(userData.token) as JWTToken;

          // Ensure the returned object matches the ExtendedUser type
          const user: ExtendedUser = {
            id: userDataDecoded.id?.toString() || credentials.email, // Ensure id is always a string
            token: userData.token,
            email: credentials.email,
            role: userDataDecoded.role as UserRole,
            displayName: userDataDecoded.displayName || undefined, // Optional name
            image: userDataDecoded.image || undefined,
          };

          return user;

        } catch (error) {
          console.error(error && "Auth error");
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("User", user);
      console.log("Token", token);
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
      console.log("Session Token", token);

      const tokenDecoded = jwt.decode(token.token as string) as JWTToken;

      console.log("Token Decoded", tokenDecoded);


      if (token) {

        session.user.token = token.token as string;
        session.user.role = tokenDecoded.role as UserRole;
        session.user.id = token.id as string;
        session.user.displayName = token.displayName as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle error redirects
      if (url.startsWith('/api/auth/error')) {
        return `${baseUrl}/login?error=${encodeURIComponent(url.split('error=')[1] || 'Unknown error')}`;
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
