import React from "react";

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 min-h-[calc(100vh-100px)]">
      {children}
    </div>
  );
} 