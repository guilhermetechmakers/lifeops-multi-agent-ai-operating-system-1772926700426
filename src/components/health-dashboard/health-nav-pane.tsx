/**
 * HealthNavPane — Left sidebar for Health Dashboard, Habits Tracker, Training & Meal Planner.
 * Collapsible to icons only; active state pill with accent #FF3B30.
 */

import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard/health", label: "Health Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/health/habits", label: "Habits Tracker", icon: Target, end: false },
  { to: "/dashboard/health/training-meals", label: "Training & Meal Planner", icon: UtensilsCrossed, end: false },
];

export interface HealthNavPaneProps {
  collapsed?: boolean;
  className?: string;
}

export function HealthNavPane({ collapsed = false, className }: HealthNavPaneProps) {
  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Health section">
      {(navItems ?? []).map(({ to, label, icon: Icon, end }) => (
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
