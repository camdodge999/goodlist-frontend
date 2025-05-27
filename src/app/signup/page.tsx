import SignupForm from "@/components/auth/SignupForm";
import { JSX } from "react";
import { metadataPages } from "@/consts/metadata";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: metadataPages.signup.title,
  description: metadataPages.signup.description,
};

export default function SignupPage(): JSX.Element {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SignupForm />  
    </div>
  );
} 