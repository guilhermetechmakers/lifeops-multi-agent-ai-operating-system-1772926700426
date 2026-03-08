import { CodeBlock } from "./code-block";
import { cn } from "@/lib/utils";

interface DiffPanelProps {
  beforeLabel?: string;
  afterLabel?: string;
  beforeCode: string;
  afterCode: string;
  className?: string;
}

export function DiffPanel({
  beforeLabel = "Before",
  afterLabel = "After",
  beforeCode,
  afterCode,
  className,
}: DiffPanelProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {beforeLabel}
        </span>
        <CodeBlock code={beforeCode ?? ""} language="diff" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {afterLabel}
        </span>
        <CodeBlock code={afterCode ?? ""} language="diff" />
      </div>
    </div>
  );
}
