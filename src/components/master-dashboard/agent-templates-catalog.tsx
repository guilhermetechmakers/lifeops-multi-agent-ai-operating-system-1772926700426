/**
 * Agent Templates Catalog: domain personas (developer, content, finance, health), preview, instantiate.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { FileCode, FileText, Wallet, Heart, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterTemplates } from "@/hooks/use-master-dashboard";
import type { TemplateDomain } from "@/types/master-dashboard";
import { cn } from "@/lib/utils";

const DOMAIN_ICONS: Record<TemplateDomain, React.ComponentType<{ className?: string }>> = {
  developer: FileCode,
  content: FileText,
  finance: Wallet,
  health: Heart,
};

const DOMAIN_LABELS: Record<TemplateDomain, string> = {
  developer: "Developer",
  content: "Content",
  finance: "Finance",
  health: "Health",
};

export function AgentTemplatesCatalog() {
  const { items: templates, isLoading } = useMasterTemplates();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const list = templates ?? [];

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Agent templates
        </CardTitle>
        <Link to="/dashboard/templates">
          <Button variant="ghost" size="sm" className="text-xs">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Domain personas — preview & instantiate</p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-md border border-white/[0.03] bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No templates available.
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {(list ?? []).map((t) => {
              const Icon = DOMAIN_ICONS[t.domain];
              const isPreview = previewId === t.id;
              return (
                <li
                  key={t.id}
                  className={cn(
                    "rounded-md border border-white/[0.03] bg-secondary/30 transition-colors",
                    isPreview && "ring-1 ring-primary/20"
                  )}
                >
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{t.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {DOMAIN_LABELS[t.domain]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => setPreviewId(isPreview ? null : t.id)}
                        >
                          {isPreview ? "Hide" : "Preview"}
                        </Button>
                        <Link to={`/dashboard/cronjobs/new?template=${encodeURIComponent(t.id)}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Use
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {isPreview && (
                      <div className="mt-2 pt-2 border-t border-white/[0.03] text-xs text-muted-foreground font-mono bg-background/50 rounded p-2">
                        {t.previewSnippet}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
