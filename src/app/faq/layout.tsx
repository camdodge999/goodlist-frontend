import React from "react";
import { Footer } from "@/components/landing/Footer";

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 min-h-screen">
      {children}
      <Footer />
    </div>
  );
} 