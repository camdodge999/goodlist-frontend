import { Metadata } from "next";
import { NextResponse } from "next/server";
import LoginClientPage from "./client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { metadataPages } from "@/consts/metadata";

export const metadata: Metadata = {
  title: metadataPages.login.title,
  description: metadataPages.login.description,
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    // Return a minimal redirect response with no body to prevent information leakage
    return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"), {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Redirect-Security': 'minimal-response'
      }
    });
  }
  return <LoginClientPage />;
} 