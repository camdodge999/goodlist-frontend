import { Metadata } from "next";
import { metadataPages } from "@/consts/metadata";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

// Metadata - properly handled in server component
export const metadata: Metadata = {
  title: metadataPages["reset-password"].title,
  description: metadataPages["reset-password"].description,
};

// Server component that renders the client component
export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
} 