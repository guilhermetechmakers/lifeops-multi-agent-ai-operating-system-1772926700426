/**
 * SectionPanel: Reusable elevated card wrapper for form sections with header and help.
 */

import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface SectionPanelProps {
  title: string;
  description?: string;
  help?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionPanel({
  title,
  description,
  help,
  icon,
  children,
  className,
}: SectionPanelProps) {
  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            {icon}
            {title}
          </CardTitle>
          {help && (
            <span
              title={help}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-help"
              aria-label={help}
            >
              <HelpCircle className="h-4 w-4" />
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
