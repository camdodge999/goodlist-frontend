import { metadataPages } from "@/consts/metadata";
import VerifyPageClient from "./VerifyPageClient";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

// Metadata - properly handled in server component
export const metadata = {
  title: metadataPages.verify.title,
  description: metadataPages.verify.description,
};

// Server component that wraps the client component with providers
export default async function VerifyPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // Simple redirect - security headers handled by middleware
    redirect("/login");
  }
  return (
    <VerifyPageClient session={session} />
  );
} 