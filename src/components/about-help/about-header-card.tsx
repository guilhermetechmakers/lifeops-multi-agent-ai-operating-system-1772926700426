/**
 * AboutHeaderCard — Top summary block with mission, version, and company info.
 * Guards all data access; uses data ?? {} and arrays as needed.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
import type { AboutInfo } from "@/types/about-help";
import { cn } from "@/lib/utils";

export interface AboutHeaderCardProps {
  data?: AboutInfo | null;
  onOpenChangelog?: () => void;
  className?: string;
}

export function AboutHeaderCard({
  data,
  onOpenChangelog,
  className,
}: AboutHeaderCardProps) {
  const info = data ?? {};
  const version = info.version ?? "0.0.0";
  const company = info.company ?? "LifeOps";
  const mission = info.mission ?? "";
  const privacyUrl = info.privacyUrl;
  const termsUrl = info.termsUrl;

  return (
    <Card
      className={cn(
        "card-health border-white/[0.03] overflow-hidden",
        className
      )}
      role="region"
      aria-labelledby="about-header-title"
    >
      <div className="bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="about-header-title"
                className="text-xl font-semibold text-foreground"
              >
                {company}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Version {version}
              </p>
            </div>
            {onOpenChangelog && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenChangelog}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="View changelog"
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mission ? (
            <p className="text-sm leading-relaxed text-foreground/90">
              {mission}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {privacyUrl ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-white/[0.03]"
              >
                <a
                  href={privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  Privacy
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : null}
            {termsUrl ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-white/[0.03]"
              >
                <a
                  href={termsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  Terms
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
