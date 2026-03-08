/**
 * CommunityLinksPanel — External community channels with icons and descriptions.
 * Data: channels array; guarded with (channels ?? []).
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle } from "./section-title";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Channel } from "@/types/about-help";

interface CommunityLinksPanelProps {
  channels?: Channel[] | null;
  className?: string;
}

export function CommunityLinksPanel({ channels, className }: CommunityLinksPanelProps) {
  const list = Array.isArray(channels) ? channels : (channels ?? []);

  return (
    <Card
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] shadow-card transition-all duration-200",
        className
      )}
    >
      <CardHeader className="pb-3">
        <SectionTitle>Community</SectionTitle>
        <p className="text-sm text-muted-foreground">
          Join discussions, get help, and share feedback.
        </p>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        <ul className="space-y-2" role="list">
          {list.map((ch) => (
            <li key={ch.id}>
              <a
                href={ch.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-white/[0.03] bg-card/50 p-3 transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-white/[0.06] hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label={`Join ${ch.name}`}
              >
                <span className="text-xl" aria-hidden>
                  {ch.emoji ?? "•"}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">
                    {ch.name ?? "Community"}
                  </span>
                  {ch.description ? (
                    <p className="text-xs text-muted-foreground">
                      {ch.description}
                    </p>
                  ) : null}
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No community links configured.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
