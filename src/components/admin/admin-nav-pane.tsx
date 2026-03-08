/**
 * Admin left rail navigation.
 * Active state pill #FF3B30; collapsible to icons only.
 */

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Plug,
  FileCheck,
  CreditCard,
  Clock,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_SECTIONS = [
  { to: "/dashboard/admin", label: "Admin", icon: LayoutDashboard, end: true },
  { to: "/dashboard/admin/users", label: "Users", icon: Users, end: false },
  { to: "/dashboard/admin/organizations", label: "Organizations", icon: Building2, end: false },
  { to: "/dashboard/admin/roles", label: "Roles & access", icon: Shield, end: false },
  { to: "/dashboard/admin/integrations", label: "Integrations", icon: Plug, end: false },
  { to: "/dashboard/admin/compliance", label: "Compliance", icon: FileCheck, end: false },
  { to: "/dashboard/admin/billing", label: "Billing", icon: CreditCard, end: false },
  { to: "/dashboard/admin/cronjobs", label: "Cronjobs", icon: Clock, end: false },
  { to: "/dashboard/admin/reports", label: "Reports", icon: BarChart3, end: false },
] as const;

export interface AdminNavPaneProps {
  collapsed?: boolean;
  className?: string;
}

export function AdminNavPane({ collapsed = false, className }: AdminNavPaneProps) {
  const sections = ADMIN_SECTIONS ?? [];
  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Admin sections"
    >
      {sections.map(({ to, label, icon: Icon, end }) => (
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
