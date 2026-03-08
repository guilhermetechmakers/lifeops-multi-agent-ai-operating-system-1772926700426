/**
 * NavPane — Left sidebar for Finance Dashboard, Subscriptions & Billing, Transactions & Categorization.
 * Collapsible to icons only; active state pill with accent color.
 */

import { NavLink } from "react-router-dom";
import { LayoutDashboard, CreditCard, List } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard/finance", label: "Finance Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/finance/subscriptions", label: "Subscriptions & Billing", icon: CreditCard, end: false },
  { to: "/dashboard/finance/transactions", label: "Transactions & Categorization", icon: List, end: false },
];

export interface FinanceNavPaneProps {
  collapsed?: boolean;
  className?: string;
}

export function FinanceNavPane({ collapsed = false, className }: FinanceNavPaneProps) {
  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Finance section"
    >
      {navItems.map(({ to, label, icon: Icon, end }) => (
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
                ? "bg-accent text-accent-foreground shadow-sm"
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
