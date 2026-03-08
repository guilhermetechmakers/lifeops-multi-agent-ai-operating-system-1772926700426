/**
 * DocumentationHubCard — Grid of documentation links and tutorials.
 * Data: docs array; guarded with (docs ?? []) and Array.isArray.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "./section-title";
import { BookOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc } from "@/types/about-help";

interface DocumentationHubCardProps {
  docs?: Doc[] | null;
  className?: string;
}

export function DocumentationHubCard({ docs, className }: DocumentationHubCardProps) {
  const list = Array.isArray(docs) ? docs : (docs ?? []);

  return (
    <Card
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader className="pb-3">
        <SectionTitle>Docs &amp; tutorials</SectionTitle>
        <p className="text-sm text-muted-foreground">
          Getting started guides, templates, and API references.
        </p>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((doc) => (
            <a
              key={doc.id}
              href={doc.url ?? "#"}
              className={cn(
                "group flex flex-col gap-2 rounded-lg border border-white/[0.03] bg-card/50 p-4 transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-white/[0.06] hover:shadow-md"
              )}
              aria-label={`Open ${doc.title}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BookOpen className="h-4 w-4 text-primary" aria-hidden />
                </div>
                {doc.type ? (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {doc.type}
                  </Badge>
                ) : null}
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">
                {doc.title ?? "Untitled"}
              </h3>
              {doc.description ? (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {doc.description}
                </p>
              ) : null}
              <span className="mt-1 inline-flex items-center text-xs text-muted-foreground group-hover:text-foreground">
                Open <ExternalLink className="ml-1 h-3 w-3" />
              </span>
            </a>
          ))}
        </div>
        {list.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 py-6 text-center text-sm text-muted-foreground">
            No documentation links yet.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
