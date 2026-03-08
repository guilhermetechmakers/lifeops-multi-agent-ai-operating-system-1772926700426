import { Link } from "react-router-dom";
import { Activity, LayoutGrid, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SuggestedActionItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface SuggestedActionsProps {
  items?: SuggestedActionItem[];
  className?: string;
}

const DEFAULT_SUGGESTED_ACTIONS: SuggestedActionItem[] = [
  { label: "View Recent Activity", icon: Activity, path: "/dashboard" },
  { label: "Browse Modules", icon: LayoutGrid, path: "/dashboard" },
  { label: "Contact Support", icon: HelpCircle, path: "/dashboard/about-help" },
];

/**
 * Compact suggested actions panel for 404 page. Safely maps over items array.
 */
export function SuggestedActions({
  items,
  className,
}: SuggestedActionsProps) {
  const list = Array.isArray(items) && items.length > 0 ? items : DEFAULT_SUGGESTED_ACTIONS;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Suggested actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {(list ?? []).map((item, index) => {
          const path = item?.path?.trim() ?? "";
          if (!path) return null;
          const Icon = item?.icon;
          if (!Icon) return null;
          return (
            <Link
              key={`suggested-${index}-${(item?.label ?? "").replace(/\s+/g, "-")}-${path}`}
              to={path}
              className="inline-flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/80 px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={item?.label ?? "Go"}
            >
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              {item?.label ?? ""}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
