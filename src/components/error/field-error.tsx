import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message: string;
  /** Optional field name for aria */
  fieldId?: string;
}

export function FieldError({ message, fieldId, className, ...props }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      id={fieldId ? `${fieldId}-error` : undefined}
      role="alert"
      aria-live="polite"
      className={cn("text-sm text-destructive mt-1.5", className)}
      {...props}
    >
      {message}
    </p>
  );
}
