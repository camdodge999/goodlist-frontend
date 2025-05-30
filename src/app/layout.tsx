import React from "react";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/lib/fontawesome";
import "@/lib/csp-debug";
import NavBar from "@/components/layout/NavBar";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AppProviders } from "@/providers/AppProviders";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";
import { getNonceFromRequest } from "@/lib/nonce";
import { CSPWrapper } from "@/components/CSPWrapper";

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
  params,
}: {
  children: React.ReactNode;
  params: { nonce: string };
}) {
  // Pre-fetch the session on the server for better initial loading experience
  const session = await getServerSession(authOptions);
  const nonce = params.nonce;

  return (
    <html lang="th" className={`${prompt.className} antialiased`}>
      <head>
        {nonce && <meta name="csp-nonce" content={nonce} />}
      </head>
      <body>
        <CSPWrapper>
          <NextAuthProvider session={session as unknown as Session}>
            <AppProviders session={session as unknown as Session}>
              <NavBar session={session as unknown as Session} />
              <main className="min-h-[calc(100vh-64px)] pt-20">{children}</main>
              <ToastProvider />
            </AppProviders>
          </NextAuthProvider>
        </CSPWrapper>
      </body>
    </html>
  );
}