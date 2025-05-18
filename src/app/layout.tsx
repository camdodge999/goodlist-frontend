import React from "react";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
  openGraph:{
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
  
  return (
    <html lang="th" className={`${prompt.className} antialiased`}>
      <body>
          <NextAuthProvider session={session}>
            <AuthProvider>
              <NavBar />
                <main className="min-h-[calc(100vh-64px)] pt-20">{children}</main>
              <ToastProvider />
            </AuthProvider>
          </NextAuthProvider>
      </body>
    </html>
  );
}