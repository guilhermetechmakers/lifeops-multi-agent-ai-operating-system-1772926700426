import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
}

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground sm:text-xl",
        className
      )}
    >
      {children}
    </h2>
  );
}
