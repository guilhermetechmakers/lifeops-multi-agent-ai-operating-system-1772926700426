import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Code2,
  Plug,
  Bot,
  FileCode,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  { id: "overview", label: "Overview", href: "/docs", icon: BookOpen },
  { id: "api", label: "API Reference", href: "/docs/api", icon: Code2 },
  { id: "connectors", label: "Connectors", href: "/docs/connectors", icon: Plug },
  { id: "templates", label: "Agent Templates", href: "/docs/templates", icon: Bot },
  { id: "workflow", label: "Workflow Schema", href: "/docs/workflow-schema", icon: FileCode },
];

interface DocsSidebarProps {
  className?: string;
}

export function DocsSidebar({ className }: DocsSidebarProps) {
  return (
    <aside
      className={cn(
        "w-[240px] shrink-0 border-r border-white/[0.03] bg-card/50 p-4 overflow-y-auto",
        className
      )}
      role="navigation"
      aria-label="Documentation navigation"
    >
      <nav className="space-y-1">
        {(navSections ?? []).map((section) => (
          <NavLink
            key={section.id}
            to={section.href}
            end={section.href === "/docs"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-120",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary -ml-0.5 pl-3.5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )
            }
          >
            <section.icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{section.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 ml-auto opacity-50" aria-hidden />
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
