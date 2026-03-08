/**
 * ConsentControlsLink — Accessible link to consent management area.
 * Can link to /dashboard/settings/data-security (privacy) or /cookies (cookie policy).
 */

import { Link } from "react-router-dom";
import { Settings2, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";

const CONSENT_CONTROLS_PATH = "/dashboard/settings/data-security";
const COOKIE_POLICY_PATH = "/cookies";

interface ConsentControlsLinkProps {
  className?: string;
  variant?: "link" | "button";
  target?: "privacy" | "cookies";
}

export function ConsentControlsLink({
  className,
  variant = "link",
  target = "privacy",
}: ConsentControlsLinkProps) {
  const path = target === "cookies" ? COOKIE_POLICY_PATH : CONSENT_CONTROLS_PATH;
  const isCookie = target === "cookies";

  if (variant === "button") {
    return (
      <Link
        to={path}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-white/[0.03] bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200",
          "hover:bg-secondary/80 hover:border-white/[0.06] hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        aria-label={
          isCookie
            ? "Manage your cookie preferences"
            : "Manage your privacy preferences and consent controls"
        }
      >
        {isCookie ? (
          <Cookie className="h-4 w-4" aria-hidden />
        ) : (
          <Settings2 className="h-4 w-4" aria-hidden />
        )}
        {isCookie ? "Manage cookie preferences" : "Manage your privacy preferences"}
      </Link>
    );
  }

  return (
    <Link
      to={path}
      className={cn(
        "inline-flex items-center gap-2 text-teal hover:text-teal/90 underline underline-offset-2 font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
        className
      )}
      aria-label={
        isCookie
          ? "Manage your cookie preferences"
          : "Manage your privacy preferences and consent controls"
      }
    >
      {isCookie ? (
        <Cookie className="h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <Settings2 className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {isCookie ? "Cookie preferences" : "Consent controls"}
    </Link>
  );
}
