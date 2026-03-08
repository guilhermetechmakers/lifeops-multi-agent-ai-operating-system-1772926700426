/**
 * TemplateDetailDrawer — side panel with metadata, connectors, versions, test results.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Link2, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentTemplate, TemplateVersion } from "@/types/templates-personas";

const DOMAIN_LABELS: Record<string, string> = {
  developer: "Developer",
  content: "Content",
  finance: "Finance",
  health: "Health",
};

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export interface TemplateDetailDrawerProps {
  template: AgentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions?: TemplateVersion[];
  onTest?: (id: string) => void;
  onPublish?: (id: string) => void;
  onCreateCronjob?: (id: string) => void;
}

export function TemplateDetailDrawer({
  template,
  open,
  onOpenChange,
  versions = [],
  onTest,
  onPublish,
  onCreateCronjob,
}: TemplateDetailDrawerProps) {
  if (!template) return null;

  const tags = template.tags ?? [];
  const connectors = template.connectors ?? [];
  const permissions = template.permissions ?? [];
  const versionList = Array.isArray(versions) ? versions : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={true}
        className={cn(
          "fixed left-auto right-0 top-0 h-full max-h-none w-full max-w-md translate-y-0 rounded-l-xl rounded-r-none border-l border-white/[0.03] p-0 transition-transform duration-200",
          "translate-x-full data-[state=open]:translate-x-0"
        )}
      >
        <DialogHeader className="border-b border-white/[0.03] px-6 py-4">
          <DialogTitle className="text-lg font-semibold pr-8">
            {template.name ?? "Untitled"}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="capitalize">
              {DOMAIN_LABELS[template.domain] ?? template.domain}
            </Badge>
            <Badge variant={template.status === "published" ? "default" : "outline"}>
              {template.status}
            </Badge>
            {template.version != null && (
              <Badge variant="outline">v{template.version}</Badge>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-8rem)]">
          <div className="px-6 py-4 space-y-6">
            <p className="text-sm text-muted-foreground">
              {template.description ?? "No description."}
            </p>

            <div className="flex flex-wrap gap-2">
              {(tags ?? []).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {onTest && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTest(template.id)}
                  className="gap-1"
                >
                  <Play className="h-3.5 w-3.5" />
                  Test
                </Button>
              )}
              {onPublish && template.status !== "published" && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onPublish(template.id)}
                >
                  Publish
                </Button>
              )}
              {onCreateCronjob && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateCronjob(template.id)}
                  className="gap-1"
                >
                  Use in cronjob
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
                <TabsTrigger value="config">Config</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="text-xs text-muted-foreground">
                  <p>Created: {formatDate(template.createdAt)}</p>
                  <p>Updated: {formatDate(template.updatedAt)}</p>
                </div>
              </TabsContent>
              <TabsContent value="versions" className="space-y-2 pt-4">
                {versionList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No version history.</p>
                ) : (
                  <ul className="space-y-2" role="list">
                    {versionList.map((v) => (
                      <li
                        key={v.id}
                        className="rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2 text-sm"
                      >
                        <div className="font-medium">v{v.versionNumber}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {v.changes ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(v.createdAt)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="config" className="space-y-4 pt-4">
                {connectors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Link2 className="h-4 w-4" />
                      Connectors
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {connectors.map((c) => (
                        <li key={c.id}>{c.connectorName}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {permissions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      Permissions
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {permissions.map((p) => (
                        <li key={p.id}>
                          {p.role} — {p.scope}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {connectors.length === 0 && permissions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No connectors or permissions.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
