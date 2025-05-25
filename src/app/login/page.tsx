import { Metadata } from "next";
import LoginClientPage from "./client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { metadataPages } from "@/consts/metadata";

export const metadata: Metadata = {
  title: metadataPages.login.title, 
  description: metadataPages.login.description,
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }
  return <LoginClientPage />;
} 