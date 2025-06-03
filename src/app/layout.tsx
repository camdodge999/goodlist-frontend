import React from "react";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AppProviders } from "@/providers/AppProviders";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { MotionCSPProvider } from "@/lib/motion";
import { getNonce } from "@/lib/nonce";
config.autoAddCss = false;

const prompt = localFont({
  src: [
    {
      path: "../../public/fonts/Prompt/Prompt-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Prompt/Prompt-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Prompt/Prompt-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Prompt/Prompt-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-prompt",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

config.autoAddCss = false;

export const metadata: Metadata = {
  metadataBase: new URL("https://goodlist.com"),
  title: "Goodlist Seller",
  description: "Platform for verified online stores",
  openGraph: {
    title: "Goodlist Seller",
    description: "Platform for verified online stores",
    images: [
      {
        url: "/images/logo.webp",
        width: 800,
        height: 600,
        alt: "Goodlist Seller Logo",
      },
    ],
  },
  icons: {
    icon: [{ url: "/images/logo.webp", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pre-fetch the session on the server for better initial loading experience
  const session = await getServerSession(authOptions);
  
  // Get the nonce for CSP compliance
  const nonce = await getNonce();

  return (
    <html lang="th" className={`${prompt.className} antialiased`}>
      <head>
        {/* OPTION: CSP Meta Tag (Alternative to HTTP headers) */}
        {/* Uncomment this if you want to use meta tag instead of middleware headers */}
        
        {/* {nonce && (
          <meta
            httpEquiv="Content-Security-Policy"
            content={`
              default-src 'self';
              script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
              style-src 'self' 'nonce-${nonce}' 'unsafe-hashes' 'sha256-ZDrxqUOB4m/L0JWL/+gS52g1CRH0l/qwMhjTw5Z/Fsc=' 'sha256-8ilcya6PJ2mDcuNFfcZaaOL85o/T7b8cPlsalzaJVOs=' 'sha256-t4I2teZN5ZH+VM+XOiWlaPbsjQHe+k9d6viXPpKpNWA=' 'sha256-PhrR5O1xWiklTp5YfH8xWeig83Y/rhbrdb5whLn1pSg=' 'sha256-MtxTLcyxVEJFNLEIqbVTaqR4WWr0+lYSZ78AzGmNsuA=' 'sha256-1OjyRYLAOH1vhXLUN4bBHal0rWxuwBDBP220NNc0CNU=' 'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk=' 'sha256-68ahHyH65aqS202beKyu22MkdAEr0fBCN3eHnbYX+wg=' 'sha256-dz0IlE6Ej+Pf9WeZ57sEyXgzZOvzM4Agzl2f0gpN7fs=' 'sha256-F2FphXOLeRXcUSI4c0ybgkNqofQaEHWI1kHbjr9RHxw=';
              img-src 'self' data: blob: https://api.goodlist2.chaninkrew.com https://images.unsplash.com;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://api.goodlist2.chaninkrew.com ${process.env.NEXT_PUBLIC_BACKEND_URL || ''} ${process.env.NEXTAUTH_URL || ''};
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
            `.replace(/\s+/g, ' ').trim()}
          />
        )} */}
       
        
        {/* Webpack nonce script (following the Next.js CSP documentation) */}
        {nonce && (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `window.__webpack_nonce__ = "${nonce}"`
            }}
          />
        )}
        {/* Development debug information */}
        {process.env.NODE_ENV === 'development' && nonce && (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
                console.log('🔒 CSP Status:', {
                  nonce: '${nonce.substring(0, 8)}...',
                  webpackNonce: !!window.__webpack_nonce__,
                  criticalCSS: 'loaded',
                  middleware: 'active'
                });
              `
            }}
          />
        )}
      </head>
      
      <body>
        <MotionCSPProvider>
          <NextAuthProvider session={session as unknown as Session}>
            <AppProviders session={session as unknown as Session} nonce={nonce}>
              <NavBar session={session as unknown as Session} />
              <main className="min-h-[calc(100vh-64px)] pt-20">{children}</main>
              <ToastProvider />
            </AppProviders>
          </NextAuthProvider>
        </MotionCSPProvider>
      </body>
    </html>
  );
}