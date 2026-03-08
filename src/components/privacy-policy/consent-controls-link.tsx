/**
 * ConsentControlsLink — Accessible link to consent management area.
 * Navigates to /dashboard/settings/data-security (privacy & consent controls).
 */

import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CONSENT_CONTROLS_PATH = "/dashboard/settings/data-security";

interface ConsentControlsLinkProps {
  className?: string;
  variant?: "link" | "button";
}

export function ConsentControlsLink({ className, variant = "link" }: ConsentControlsLinkProps) {
  if (variant === "button") {
    return (
      <Link
        to={CONSENT_CONTROLS_PATH}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-white/[0.03] bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200",
          "hover:bg-secondary/80 hover:border-white/[0.06] hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        aria-label="Manage your privacy preferences and consent controls"
      >
        <Settings2 className="h-4 w-4" aria-hidden />
        Manage your privacy preferences
      </Link>
    );
  }

  return (
    <Link
      to={CONSENT_CONTROLS_PATH}
      className={cn(
        "inline-flex items-center gap-2 text-teal hover:text-teal/90 underline underline-offset-2 font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
        className
      )}
      aria-label="Manage your privacy preferences and consent controls"
    >
      <Settings2 className="h-4 w-4 shrink-0" aria-hidden />
      Consent controls
    </Link>
  );
}
