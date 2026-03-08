/**
 * ActionPanel — Card with Home CTA and module quick links.
 */

import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  FileText,
  Wallet,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuickLinkCard } from "./quick-link-card";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Projects", icon: FolderKanban, destinationPath: "/dashboard/projects" },
  { label: "Cronjobs", icon: Clock, destinationPath: "/dashboard/cronjobs" },
  { label: "Content", icon: FileText, destinationPath: "/dashboard/content" },
  { label: "Finance", icon: Wallet, destinationPath: "/dashboard/finance" },
  { label: "Health", icon: Heart, destinationPath: "/dashboard/health" },
] as const;

export interface ActionPanelProps {
  className?: string;
}

export function ActionPanel({ className }: ActionPanelProps) {
  const links = Array.isArray(QUICK_LINKS) ? QUICK_LINKS : [];

  return (
    <Card
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] p-5 sm:p-6",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.03),0_2px_8px_rgba(0,0,0,0.2)]",
        "transition-all duration-200 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_4px_12px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <CardHeader className="p-0 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Quick navigation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Return to the dashboard or jump to a module
        </p>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard" className="contents">
            <Button
              size="lg"
              className="bg-teal hover:bg-teal/90 text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              aria-label="Go to Home Dashboard"
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(links ?? []).map((item) => (
            <QuickLinkCard
              key={item.destinationPath}
              label={item.label}
              icon={item.icon}
              destinationPath={item.destinationPath}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
