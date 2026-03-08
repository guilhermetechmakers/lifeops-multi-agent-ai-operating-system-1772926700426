/**
 * TypographyBlock — Consistent heading/body/meta text per design system.
 * LifeOps typography: H1/H2 600–700, body 400 12–14px, micro 300–400 11–12px.
 */

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TypographyVariant = "h1" | "h2" | "h3" | "body" | "meta" | "micro";

interface TypographyBlockProps {
  variant: TypographyVariant;
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  id?: string;
}

/* LifeOps: H1/H2 600–700, 20–28px; body 400 12–14px; micro 300–400 11–12px */
const variantClasses: Record<TypographyVariant, string> = {
  h1: "text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-foreground",
  h2: "text-xl sm:text-2xl font-semibold tracking-tight text-foreground",
  h3: "text-base font-medium text-foreground",
  body: "text-sm text-foreground leading-relaxed",
  meta: "text-sm text-muted-foreground",
  micro: "text-xs text-muted-foreground",
};

export function TypographyBlock({
  variant,
  children,
  className,
  as,
  id,
}: TypographyBlockProps) {
  const Tag = as ?? (variant === "h1" ? "h1" : variant === "h2" ? "h2" : variant === "h3" ? "h3" : "p");
  return (
    <Tag id={id} className={cn(variantClasses[variant], className)}>
      {children}
    </Tag>
  );
}
