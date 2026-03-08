/**
 * Analytics left rail navigation — links to Admin Dashboard and Admin & Compliance.
 * Active state pill #FF3B30; collapsible to icons only.
 */

import { NavLink } from "react-router-dom";
import { BarChart3, LayoutDashboard, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { to: "/dashboard/analytics-reports", label: "Overview", icon: BarChart3, end: true },
  { to: "/dashboard/admin", label: "Admin dashboard", icon: LayoutDashboard, end: false },
  { to: "/dashboard/admin/compliance", label: "Compliance", icon: FileCheck, end: false },
] as const;

export interface AnalyticsNavPaneProps {
  collapsed?: boolean;
  className?: string;
}

export function AnalyticsNavPane({ collapsed = false, className }: AnalyticsNavPaneProps) {
  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Analytics sections"
    >
      {(SECTIONS ?? []).map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              collapsed ? "justify-center lg:px-2" : "gap-3",
              isActive
                ? "bg-[#FF3B30] text-white shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )
          }
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          {!collapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
