/**
 * ContentCard — card for a content item: thumbnail, title, status badge, author, date, metadata.
 * Runtime safety: guards for optional fields.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContentItem, ContentLibraryStatus } from "@/types/content-library";
import { FileText } from "lucide-react";

export interface ContentCardProps {
  item: ContentItem;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (item: ContentItem) => void;
  className?: string;
}

const statusVariant: Record<ContentLibraryStatus, "default" | "secondary" | "success" | "outline"> = {
  idea: "secondary",
  research: "secondary",
  draft: "secondary",
  edit: "outline",
  scheduled: "outline",
  published: "success",
  archived: "outline",
};

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function ContentCard({
  item,
  selected = false,
  onSelect,
  onClick,
  className,
}: ContentCardProps) {
  const title = item?.title ?? "Untitled";
  const author = item?.author ?? "—";
  const status = (item?.status ?? "draft") as ContentLibraryStatus;
  const tags = (item?.tags ?? []).slice(0, 3);
  const channel = item?.channel ?? "";
  const owner = item?.owner ?? "";

  return (
    <Card
      className={cn(
        "relative rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className
      )}
      onClick={() => onClick?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(item);
        }
      }}
      aria-label={`View ${title}`}
    >
      <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
        {onSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(item.id)}
            aria-label={`Select ${title}`}
          />
        )}
      </div>
      <div className="relative overflow-hidden rounded-t-xl h-32 bg-secondary/50 flex items-center justify-center">
        {item?.thumbnail ? (
          <img
            src={item.thumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <FileText className="h-10 w-10 text-muted-foreground" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
      </div>
      <CardHeader className="pb-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold line-clamp-2">{title}</CardTitle>
          <Badge variant={statusVariant[status]} className="shrink-0 text-[10px] capitalize">
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <p className="text-xs text-muted-foreground">
          {author} · {formatDate(item?.publishDate ?? item?.createdAt)}
        </p>
        {(item?.seoScore != null || item?.version != null) && (
          <p className="text-[11px] text-muted-foreground/80 flex items-center gap-2">
            {item?.seoScore != null && (
              <span className="flex items-center gap-0.5">
                SEO {item.seoScore}
              </span>
            )}
            {item?.version != null && <span>v{item.version}</span>}
          </p>
        )}
        {(channel || owner) && (
          <p className="text-[11px] text-muted-foreground/80">
            {[channel, owner].filter(Boolean).join(" · ")}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(tags ?? []).map((t) => (
              <span
                key={t}
                className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
