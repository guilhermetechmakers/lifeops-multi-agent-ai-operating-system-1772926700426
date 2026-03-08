/**
 * Left rail navigation for User Profile sections.
 * Active section indicator, collapsible on narrow viewports.
 */

import { Link, useLocation } from "react-router-dom";
import {
  User,
  Plug,
  Shield,
  Key,
  CreditCard,
  Sliders,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROFILE_SECTIONS = [
  { to: "/dashboard/profile/personal", label: "Personal info", icon: User },
  { to: "/dashboard/profile/integrations", label: "Integrations", icon: Plug },
  { to: "/dashboard/profile/security", label: "Security", icon: Shield },
  { to: "/dashboard/profile/api-keys", label: "API Keys", icon: Key },
  { to: "/dashboard/profile/sessions", label: "Sessions", icon: Monitor },
  { to: "/dashboard/profile/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/profile/preferences", label: "Preferences", icon: Sliders },
] as const;

export function LeftRailNav() {
  const location = useLocation();

  return (
    <nav
      className="flex w-full flex-col gap-1 rounded-lg border border-white/[0.03] bg-card p-2"
      aria-label="Profile sections"
    >
      {(PROFILE_SECTIONS ?? []).map(({ to, label, icon: Icon }) => {
        const isActive =
          location.pathname === to || location.pathname.startsWith(to + "/");
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
