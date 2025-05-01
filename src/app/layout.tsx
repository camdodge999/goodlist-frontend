import NavBar from "@/components/layout/NavBar";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import "./globals.css";
import React from "react";
import localFont from "next/font/local";

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


export const metadata = {
  metadataBase: new URL("https://goodlist.com"),
  title: "Goodlist Seller",
  description: "Platform for verified online stores",
  openGraph:{
    title: "Goodlist Seller",
    description: "Platform for verified online stores",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 600,
        alt: "Goodlist Seller Logo",
      },
    ],
  },
  icons: {
    icon: [{ url: "/images/logo.png", type: "image/png" }],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${prompt.className} antialiased`}>
        <AuthProvider>
          <StoreProvider>
            <NavBar />
            <main className="min-h-screen pt-20">{children}</main>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}