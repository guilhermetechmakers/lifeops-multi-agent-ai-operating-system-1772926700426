/**
 * NavPane — Left sidebar for Finance Dashboard, Subscriptions & Billing, Transactions & Categorization.
 * Collapsible to icons only; active state pill with accent color.
 */

import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, CreditCard, List, TrendingUp, History } from "lucide-react";
import { cn } from "@/lib/utils";

const SUBSCRIPTIONS_PATHS = ["/dashboard/finance/subscriptions", "/dashboard/finance/subscriptions-billing"];

const navItems: Array<{
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end: boolean;
  isActive?: (pathname: string) => boolean;
}> = [
  { to: "/dashboard/finance", label: "Finance Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/finance/forecasting", label: "Forecasting & Reports", icon: TrendingUp, end: false },
  {
    to: "/dashboard/finance/subscriptions",
    label: "Subscriptions & Billing",
    icon: CreditCard,
    end: false,
    isActive: (pathname) => SUBSCRIPTIONS_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")),
  },
  { to: "/dashboard/finance/transactions", label: "Transactions & Categorization", icon: List, end: false },
  { to: "/dashboard/finance/history", label: "Order / Transaction History", icon: History, end: false },
];

export interface FinanceNavPaneProps {
  collapsed?: boolean;
  className?: string;
}

export function FinanceNavPane({ collapsed = false, className }: FinanceNavPaneProps) {
  const location = useLocation();
  const pathname = location.pathname ?? "";

  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Finance section"
    >
      {navItems.map(({ to, label, icon: Icon, end, isActive: isActiveFn }) => {
        const isActive = typeof isActiveFn === "function" ? isActiveFn(pathname) : undefined;
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive: navIsActive }) => {
              const active = isActive !== undefined ? isActive : navIsActive;
              return cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center lg:px-2" : "gap-3",
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              );
            }}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}
