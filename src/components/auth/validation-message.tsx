import { cn } from "@/lib/utils";

export interface ValidationMessageProps {
  message: string | undefined;
  type?: "error" | "help" | "success";
  id?: string;
  className?: string;
}

export function ValidationMessage({
  message,
  type = "error",
  id,
  className,
}: ValidationMessageProps) {
  if (!message) return null;
  const role = type === "error" ? "alert" : undefined;
  return (
    <p
      id={id}
      role={role}
      aria-live={type === "error" ? "polite" : undefined}
      className={cn(
        "text-xs mt-1",
        type === "error" && "text-destructive",
        type === "help" && "text-muted-foreground",
        type === "success" && "text-teal",
        className
      )}
    >
      {message}
    </p>
  );
}
