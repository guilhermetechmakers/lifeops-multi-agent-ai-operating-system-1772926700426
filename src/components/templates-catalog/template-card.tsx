/**
 * Template card for the catalog grid.
 */

import { Link } from "react-router-dom";
import {
  FileCode,
  FileText,
  Wallet,
  Heart,
  Eye,
  Play,
  Upload,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AgentTemplate, TemplateDomain } from "@/types/templates-personas";

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

export interface TemplateCardProps {
  template: AgentTemplate;
  onPreview?: (id: string) => void;
  onTest?: (id: string) => void;
  onPublish?: (id: string) => void;
}

export function TemplateCard({
  template,
  onPreview,
  onTest,
  onPublish,
}: TemplateCardProps) {
  const Icon = DOMAIN_ICONS[template.domain];
  const tags = template.tags ?? [];
  const version = template.version ?? 1;

  return (
    <Card
      className={cn(
        "group flex flex-col transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-card-hover"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-foreground truncate">{template.name}</h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {DOMAIN_LABELS[template.domain]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge
            variant={template.status === "published" ? "default" : "outline"}
            className="text-[10px]"
          >
            v{version}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onPreview?.(template.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTest?.(template.id)}>
                <Play className="mr-2 h-4 w-4" />
                Test
              </DropdownMenuItem>
              {template.status !== "published" && (
                <DropdownMenuItem onClick={() => onPublish?.(template.id)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-4">
          {(tags ?? []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] font-normal">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onPreview?.(template.id)}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onTest?.(template.id)}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Test
          </Button>
          <Link to={`/dashboard/cronjobs/new?template=${template.id}`}>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Use
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
