/**
 * AppInfoDrawer — Side panel with extended app info and version history.
 * Data: history array; guarded. Optional component for About & Help page.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VersionHistoryItem } from "@/types/about-help";

interface AppInfoDrawerProps {
  history?: VersionHistoryItem[] | null;
  version?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
}

export function AppInfoDrawer({
  history,
  version,
  open: controlledOpen,
  onOpenChange,
  triggerClassName,
}: AppInfoDrawerProps) {
  const list = Array.isArray(history) ? history : (history ?? []);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;

  const content = (
    <>
      {version ? (
        <p className="text-sm text-muted-foreground">
          Current version: <span className="font-medium text-foreground">{version}</span>
        </p>
      ) : null}
      <DialogHeader>
        <DialogTitle>Version history</DialogTitle>
      </DialogHeader>
      <ScrollArea className="flex-1 pr-4">
        <ul className="space-y-4 pb-4" role="list">
          {list.map((item) => (
            <li
              key={item.version}
              className="rounded-lg border border-white/[0.03] bg-card/50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  v{item.version ?? "—"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.date ?? ""}
                </span>
              </div>
              {item.notes ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.notes}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </ScrollArea>
      {list.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No version history available.
        </p>
      ) : null}
    </>
  );

  if (isControlled) {
    return (
      <Dialog open={controlledOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[85vh] max-w-md overflow-hidden flex flex-col"
          aria-label="Version history"
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn(triggerClassName)}>
          <History className="h-4 w-4" />
          Changelog
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[85vh] max-w-md overflow-hidden flex flex-col"
        aria-label="Version history"
      >
        {content}
      </DialogContent>
    </Dialog>
  );
}
