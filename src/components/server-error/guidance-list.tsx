/**
 * GuidanceList — Self-help steps and potential causes for the 500 error page.
 * Renders list items with icons; all array operations are null-safe.
 */

import { RefreshCw, Clock, Wifi, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuidanceItem } from "@/types/server-error";

const DEFAULT_GUIDANCE_ITEMS: GuidanceItem[] = [
  {
    id: "refresh",
    label: "Refresh the page and try your action again",
    icon: "refresh",
  },
  {
    id: "wait",
    label: "Wait a few moments — we may be applying a fix",
    icon: "clock",
  },
  {
    id: "connection",
    label: "Check your internet connection",
    icon: "wifi",
  },
  {
    id: "support",
    label: "If the problem persists, contact support with the reference ID below",
    icon: "support",
  },
];

const iconMap = {
  refresh: RefreshCw,
  clock: Clock,
  wifi: Wifi,
  support: Headphones,
};

export interface GuidanceListProps {
  items?: GuidanceItem[] | null;
  className?: string;
}

export function GuidanceList({ items, className }: GuidanceListProps) {
  const list = Array.isArray(items) ? items : DEFAULT_GUIDANCE_ITEMS;
  const safeList = list ?? [];

  return (
    <ul
      className={cn("space-y-3 text-sm text-muted-foreground", className)}
      role="list"
      aria-label="Suggested actions"
    >
      {(safeList ?? []).map((item) => {
        const IconComponent =
          item?.icon && item.icon in iconMap
            ? iconMap[item.icon as keyof typeof iconMap]
            : RefreshCw;
        return (
          <li
            key={item?.id ?? item?.label ?? Math.random()}
            className="flex items-start gap-3"
          >
            <span
              className="mt-0.5 shrink-0 text-destructive/80"
              aria-hidden
            >
              <IconComponent className="h-4 w-4" />
            </span>
            <span>{item?.label ?? ""}</span>
          </li>
        );
      })}
    </ul>
  );
}
