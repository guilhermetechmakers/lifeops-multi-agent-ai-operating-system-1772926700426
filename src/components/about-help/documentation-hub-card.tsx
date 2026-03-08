/**
 * DocumentationHubCard — Grid/list of documentation links and tutorials.
 * Guards all array operations with (docs ?? []).map(...)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import type { Doc } from "@/types/about-help";
import { cn } from "@/lib/utils";

export interface DocumentationHubCardProps {
  docs?: Doc[] | null;
  className?: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  guide: BookOpen,
  api: BookOpen,
  reference: BookOpen,
};

export function DocumentationHubCard({
  docs,
  className,
}: DocumentationHubCardProps) {
  const items = Array.isArray(docs) ? docs : (docs ?? []);

  return (
    <Card
      className={cn(
        "card-health border-white/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
      role="region"
      aria-labelledby="docs-hub-title"
    >
      <CardHeader>
        <CardTitle id="docs-hub-title" className="text-base font-semibold">
          Documentation & tutorials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {(items ?? []).map((doc) => {
            const Icon =
              TYPE_ICONS[doc?.type ?? ""] ?? BookOpen;
            const tags = Array.isArray(doc?.tags) ? doc.tags : [];
            return (
              <a
                key={doc?.id ?? `doc-${Math.random()}`}
                href={doc?.url ?? "#"}
                className={cn(
                  "group flex flex-col gap-2 rounded-lg border border-white/[0.03] bg-secondary/30 p-4 transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-white/[0.06] hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary">
                      {doc?.title ?? "Untitled"}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {doc?.description ?? ""}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </a>
            );
          })}
        </div>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No documentation available yet.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
