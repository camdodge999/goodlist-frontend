import React from "react";
import { Label } from "@/components/ui/label";

interface FormSectionProps {
  number: number;
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function FormSection({
  number,
  label,
  description,
  required = true,
  children
}: FormSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label
          className="flex items-center"
        >
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
            {number}
          </span>
          <span>{label} {required && '*'}</span>
        </Label>
        {required && <span className="text-xs text-red-500">* จำเป็น</span>}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mb-2">
          {description}
        </p>
      )}
      <div className="mt-1">
        {children}
      </div>
    </div>
  );
} 