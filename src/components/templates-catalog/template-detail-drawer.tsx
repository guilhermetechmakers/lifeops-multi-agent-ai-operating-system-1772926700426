/**
 * Template detail drawer with metadata, connectors, versions, and actions.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileCode,
  FileText,
  Wallet,
  Heart,
  History as HistoryIcon,
  Link2,
  Shield,
  Play,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { AgentTemplate, TemplateDomain, TemplateVersion } from "@/types/templates-personas";

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
  versions: TemplateVersion[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTest?: (id: string) => void;
  onPublish?: (id: string) => void;
  isLoadingVersions?: boolean;
}

export function TemplateDetailDrawer({
  template,
  versions,
  open,
  onOpenChange,
  onTest,
  onPublish,
  isLoadingVersions,
}: TemplateDetailDrawerProps) {
  if (!template) return null;

  const Icon = DOMAIN_ICONS[template.domain];
  const tags = template.tags ?? [];
  const connectors = template.connectors ?? [];
  const permissions = template.permissions ?? [];
  const versionList = Array.isArray(versions) ? versions : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className={cn(
          "fixed left-auto right-0 top-0 h-full max-h-none w-full max-w-lg translate-x-0 rounded-l-xl rounded-r-none border-l border-white/[0.03] p-0 transition-transform duration-200",
          "data-[state=closed]:translate-x-full"
        )}
      >
        <DialogHeader className="border-b border-white/[0.03] px-6 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold pr-8 truncate">
                {template.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{DOMAIN_LABELS[template.domain]}</Badge>
                <Badge variant={template.status === "published" ? "default" : "outline"}>
                  {template.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  v{template.version ?? 1}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-12rem)]">
          <div className="px-6 py-4">
            <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
            <div className="flex flex-wrap gap-1 mb-6">
              {(tags ?? []).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
                <TabsTrigger value="config">Config</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Created
                  </p>
                  <p className="text-sm">{formatDate(template.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Updated
                  </p>
                  <p className="text-sm">{formatDate(template.updatedAt)}</p>
                </div>
                {template.marketplacePublished && (
                  <Badge variant="secondary">Published to marketplace</Badge>
                )}
              </TabsContent>
              <TabsContent value="versions" className="space-y-2">
                {isLoadingVersions ? (
                  <p className="text-sm text-muted-foreground">Loading versions…</p>
                ) : versionList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No version history.</p>
                ) : (
                  <ul className="space-y-2" role="list">
                    {versionList.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
                      >
                        <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">v{v.versionNumber}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {v.changes}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDate(v.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="config" className="space-y-4">
                {connectors.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Link2 className="h-3.5 w-3.5" />
                      Connectors
                    </p>
                    <ul className="space-y-1">
                      {connectors.map((c) => (
                        <li
                          key={c.id}
                          className="text-sm rounded-md bg-secondary/30 px-2 py-1"
                        >
                          {c.connectorName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {permissions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" />
                      Permissions
                    </p>
                    <ul className="space-y-1">
                      {permissions.map((p) => (
                        <li
                          key={p.id}
                          className="text-sm rounded-md bg-secondary/30 px-2 py-1"
                        >
                          {p.role} — {p.scope}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {connectors.length === 0 && permissions.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No connectors or permissions configured.
                  </p>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/[0.03]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTest?.(template.id)}
              >
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Test
              </Button>
              {template.status !== "published" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPublish?.(template.id)}
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Publish
                </Button>
              )}
              <Link to={`/dashboard/cronjobs/new?template=${template.id}`}>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Use template
                </Button>
              </Link>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
