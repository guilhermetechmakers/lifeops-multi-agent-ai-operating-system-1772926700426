/**
 * NavPane — Left sidebar for Finance Dashboard, Subscriptions & Billing, Transactions & Categorization.
 * Expandable sections, active state pill with accent color.
 */

import { NavLink } from "react-router-dom";
import { LayoutDashboard, CreditCard, List } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard/finance", label: "Finance Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/finance/subscriptions", label: "Subscriptions & Billing", icon: CreditCard, end: false },
  { to: "/dashboard/finance/transactions", label: "Transactions & Categorization", icon: List, end: false },
];

export function FinanceNavPane({ className }: { className?: string }) {
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
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
