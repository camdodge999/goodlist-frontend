import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

interface ReasonTextareaProps {
  value: string;
  onChange: (value: string) => void;
  validationError?: string;
  schema: z.ZodString;
  placeholder?: string;
  rows?: number;
}

export default function ReasonTextarea({
  value,
  onChange,
  validationError,
  schema,
  placeholder = "อธิบายรายละเอียด...",
  rows = 4
}: ReasonTextareaProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    try {
      schema.parse(value);
      setError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      }
    }
  };

  return (
    <div>
      <Textarea
        rows={rows}
        className={cn("resize-none", (validationError || error) && "border-red-300 focus-visible:ring-red-500")}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {(validationError || error) && (
        <p className="mt-1 text-sm text-red-600">{validationError || error}</p>
      )}
    </div>
  );
} 