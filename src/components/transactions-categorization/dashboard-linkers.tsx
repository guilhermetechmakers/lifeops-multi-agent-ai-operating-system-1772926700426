/**
 * DashboardLinkers — Navigation links to Finance Dashboard sections.
 */

import { Link } from "react-router-dom";
import { ChevronRight, LayoutDashboard, CreditCard, AlertTriangle, TrendingUp, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard/finance", label: "Finance Overview", icon: LayoutDashboard },
  { to: "/dashboard/finance/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/dashboard/finance", label: "Anomalies", icon: AlertTriangle },
  { to: "/dashboard/finance", label: "Forecasting", icon: TrendingUp },
  { to: "/dashboard/finance", label: "Monthly Close", icon: CalendarCheck },
];

export interface DashboardLinkersProps {
  className?: string;
}

export function DashboardLinkers({ className }: DashboardLinkersProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Finance Dashboard
      </p>
      <nav className="flex flex-col gap-1" aria-label="Finance dashboard links">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to + label}
            to={to}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
