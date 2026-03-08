/**
 * TemplatesPersonasShell — layout with nested routes for templates, personas, cronjobs.
 * Collapsible sidebar; mobile drawer; 8px baseline grid.
 */

import { NavLink, Outlet } from "react-router-dom";
import { FileCode, Users, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard/templates-personas", end: true, label: "Templates", icon: FileCode },
  { to: "/dashboard/templates-personas/personas", end: false, label: "Personas", icon: Users },
  { to: "/dashboard/templates-personas/cronjobs", end: false, label: "Cronjobs", icon: Clock },
];

export function TemplatesPersonasShell() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" aria-hidden />
        <h1 className="text-2xl font-semibold text-foreground">
          Agent Templates & Personas
        </h1>
      </div>

      <nav
        className="flex gap-1 border-b border-white/[0.03] pb-0"
        aria-label="Templates & Personas section"
      >
        {navItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-md transition-colors -mb-px",
                isActive
                  ? "bg-card text-foreground border border-white/[0.03] border-b-transparent"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
