import React, { ReactNode } from 'react';

interface ContentWidthProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export default function ContentWidth({ children, fullWidth = false }: ContentWidthProps) {
  if (fullWidth) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  );
}
