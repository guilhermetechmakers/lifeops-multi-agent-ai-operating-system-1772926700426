/**
 * VersionBadgeStrip — shows current version, last modified, authors.
 */

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { History, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VersionBadgeStripProps {
  versionNumber?: number;
  lastModified?: string;
  authorName?: string;
  className?: string;
}

export function VersionBadgeStrip({
  versionNumber = 1,
  lastModified,
  authorName,
  className,
}: VersionBadgeStripProps) {
  const formattedDate = lastModified
    ? format(parseISO(lastModified), "MMM d, yyyy HH:mm")
    : null;
  const relativeDate = lastModified
    ? formatDistanceToNow(parseISO(lastModified), { addSuffix: true })
    : null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-xs text-muted-foreground",
        className
      )}
    >
      <span className="flex items-center gap-1.5">
        <History className="h-3.5 w-3.5" />
        <span>v{versionNumber}</span>
      </span>
      {formattedDate && (
        <span title={formattedDate}>
          {relativeDate ?? formattedDate}
        </span>
      )}
      {authorName && (
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          {authorName}
        </span>
      )}
    </div>
  );
}
