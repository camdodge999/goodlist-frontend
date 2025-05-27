"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "default" | "error" | "success"
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "text-sm font-medium mt-1.5 flex items-center",
          variant === "error" && "text-destructive",
          variant === "success" && "text-green-600",
          className
        )}
        {...props}
      >
        {variant === "error" && (
          <FontAwesomeIcon 
            icon={faExclamationCircle} 
            className="mr-1.5 h-3 w-3 flex-shrink-0" 
          />
        )}
        {children}
      </p>
    )
  }
)
FormMessage.displayName = "FormMessage"

export { FormMessage } 