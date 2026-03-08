/**
 * ContentEditorShortcutHub — quick link to Content Editor with starter templates.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types/content-dashboard";

const TEMPLATES = [
  { id: "blog", label: "Blog post", path: "/dashboard/content/editor?template=blog" },
  { id: "guide", label: "How-to guide", path: "/dashboard/content/editor?template=guide" },
  { id: "newsletter", label: "Newsletter", path: "/dashboard/content/editor?template=newsletter" },
];

export interface ContentEditorShortcutHubProps {
  recentItems?: ContentItem[];
  className?: string;
}

export function ContentEditorShortcutHub({ recentItems = [], className }: ContentEditorShortcutHubProps) {
  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Content Editor
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          End-to-end flow: idea → research → draft → edit → publish
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link to="/dashboard/content/editor">
          <Button
            className="w-full gap-2 bg-primary hover:bg-primary/90 transition-transform duration-200 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            New content
          </Button>
        </Link>
        {(recentItems ?? []).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Recent</p>
            {(recentItems ?? []).slice(0, 3).map((item) => (
              <Link key={item.id} to={`/dashboard/content/editor?itemId=${item.id}`}>
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.03] bg-secondary/30 px-3 py-2 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer">
                  <FileEdit className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Templates</p>
          {(TEMPLATES ?? []).map((t) => (
            <Link key={t.id} to={t.path}>
              <div
                className="flex items-center gap-2 rounded-lg border border-white/[0.03] bg-secondary/30 px-3 py-2 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer"
              >
                <FileEdit className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{t.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
