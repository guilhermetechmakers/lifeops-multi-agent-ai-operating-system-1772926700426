/**
 * Settings left rail navigation.
 * Active state pill #FF3B30; collapsible to icons only.
 */

import { NavLink } from "react-router-dom";
import {
  Sliders,
  User,
  Plug,
  Shield,
  CreditCard,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_SECTIONS = [
  { to: "/dashboard/settings", label: "Global settings", icon: Sliders, end: true },
  { to: "/dashboard/settings/profile", label: "User profile", icon: User, end: false },
  { to: "/dashboard/settings/integrations", label: "Integrations", icon: Plug, end: false },
  { to: "/dashboard/settings/data-security", label: "Data & security", icon: Shield, end: false },
  { to: "/dashboard/settings/billing", label: "Billing", icon: CreditCard, end: false },
  { to: "/dashboard/settings/exports", label: "Exports", icon: FileDown, end: false },
] as const;

export interface SettingsNavPaneProps {
  collapsed?: boolean;
  className?: string;
}

export function SettingsNavPane({ collapsed = false, className }: SettingsNavPaneProps) {
  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Settings sections"
    >
      {(SETTINGS_SECTIONS ?? []).map(({ to, label, icon: Icon, end }) => (
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
