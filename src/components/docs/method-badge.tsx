import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const methodColors: Record<string, string> = {
  GET: "bg-teal/20 text-teal border-teal/30",
  POST: "bg-amber/20 text-amber border-amber/30",
  PUT: "bg-purple/20 text-purple border-purple/30",
  PATCH: "bg-amber/20 text-amber border-amber/30",
  DELETE: "bg-primary/20 text-primary border-primary/30",
};

interface MethodBadgeProps {
  method: string;
  status?: number;
  className?: string;
}

export function MethodBadge({ method, status, className }: MethodBadgeProps) {
  const methodClass = methodColors[(method ?? "").toUpperCase()] ?? "bg-muted text-muted-foreground";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant="outline"
        className={cn("font-mono text-xs", methodClass)}
      >
        {method ?? ""}
      </Badge>
      {status != null && (
        <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
          {status}
        </Badge>
      )}
    </div>
  );
}
