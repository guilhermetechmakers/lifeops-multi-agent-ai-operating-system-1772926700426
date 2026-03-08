import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QuickLinkCardProps {
  label: string;
  icon: LucideIcon;
  destinationPath: string;
  className?: string;
}

/**
 * Accessible quick link card for 404 and recovery flows.
 * Renders as a link; destinationPath is guarded (non-empty string required).
 */
export function QuickLinkCard({
  label,
  icon: Icon,
  destinationPath,
  className,
}: QuickLinkCardProps) {
  const path = destinationPath?.trim() ?? "";
  if (!path) return null;

  return (
    <Link
      to={path}
      className={cn("block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg", className)}
      aria-label={label}
    >
      <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover border-white/[0.03]">
        <CardContent className="flex flex-col items-center justify-center gap-2 p-4 md:p-5 min-h-[80px]">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
