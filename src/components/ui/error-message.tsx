"use client"

import React from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { cn } from "@/lib/utils"

interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className, ...props }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div 
      className={cn(
        "mb-6 rounded-md border border-destructive/50 bg-destructive/5 p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-start">
        <FontAwesomeIcon 
          icon={faExclamationCircle} 
          className="mr-3 h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" 
        />
        <div className="text-sm text-destructive">{message}</div>
      </div>
    </div>
  );
} 