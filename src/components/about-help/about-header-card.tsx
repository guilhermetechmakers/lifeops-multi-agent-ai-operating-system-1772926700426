/**
 * AboutHeaderCard — Top summary block with mission, version, and company info.
 * Guards all data access; uses data ?? {} for optional fields.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AboutHeaderData } from "@/types/about-help";

interface AboutHeaderCardProps {
  data?: AboutHeaderData | null;
  onOpenChangelog?: () => void;
  className?: string;
}

export function AboutHeaderCard({ data, onOpenChangelog, className }: AboutHeaderCardProps) {
  const safe = (data ?? {}) as Partial<AboutHeaderData>;
  const version = safe.version ?? "—";
  const company = safe.company ?? "LifeOps";
  const mission = safe.mission ?? "";
  const privacyUrl = safe.privacyUrl;
  const termsUrl = safe.termsUrl;

  return (
    <Card
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader className="p-0 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            About {company}
          </h1>
          <div className="flex items-center gap-2">
            {onOpenChangelog ? (
              <button
                type="button"
                onClick={onOpenChangelog}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="View changelog"
              >
                <Info className="h-4 w-4" />
              </button>
            ) : null}
            <span
            className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground"
            aria-label="App version"
          >
            v{version}
          </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {mission ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {mission}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          {privacyUrl ? (
            <Button variant="outline" size="sm" asChild>
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                Privacy <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          ) : null}
          {termsUrl ? (
            <Button variant="outline" size="sm" asChild>
              <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                Terms <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
