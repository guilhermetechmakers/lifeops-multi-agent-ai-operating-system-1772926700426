import { cn } from "@/lib/utils";

export interface DiffPanelProps {
  oldContent?: string;
  newContent?: string;
  labelOld?: string;
  labelNew?: string;
  className?: string;
}

export function DiffPanel({
  oldContent = "",
  newContent = "",
  labelOld = "Before",
  labelNew = "After",
  className,
}: DiffPanelProps) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-lg border border-white/[0.06] bg-card overflow-hidden sm:grid-cols-2",
        className
      )}
      role="region"
      aria-label="Schema or template diff"
    >
      <div className="flex flex-col">
        <div className="border-b border-white/[0.06] bg-secondary/30 px-3 py-2 text-xs font-medium text-muted-foreground">
          {labelOld}
        </div>
        <pre className="overflow-x-auto p-4 text-sm text-muted-foreground font-mono whitespace-pre-wrap break-words">
          <code className="text-red-400/90">{oldContent || "—"}</code>
        </pre>
      </div>
      <div className="flex flex-col">
        <div className="border-b border-white/[0.06] bg-secondary/30 px-3 py-2 text-xs font-medium text-muted-foreground">
          {labelNew}
        </div>
        <pre className="overflow-x-auto p-4 text-sm text-muted-foreground font-mono whitespace-pre-wrap break-words">
          <code className="text-teal/90">{newContent || "—"}</code>
        </pre>
      </div>
    </div>
  );
}
