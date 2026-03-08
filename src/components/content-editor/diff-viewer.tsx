/**
 * DiffViewer — side-by-side or inline diffs between versions.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Columns, Rows } from "lucide-react";
import { cn } from "@/lib/utils";

function simpleDiff(a: string, b: string): { left: string[]; right: string[] } {
  const linesA = (a ?? "").split("\n");
  const linesB = (b ?? "").split("\n");
  const max = Math.max(linesA.length, linesB.length);
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i < max; i++) {
    const la = linesA[i] ?? "";
    const lb = linesB[i] ?? "";
    left.push(la);
    right.push(lb);
  }
  return { left, right };
}

export type DiffMode = "side-by-side" | "inline";

export interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  mode?: DiffMode;
  onModeChange?: (mode: DiffMode) => void;
  className?: string;
}

export function DiffViewer({
  oldContent,
  newContent,
  mode = "side-by-side",
  onModeChange,
  className,
}: DiffViewerProps) {
  const { left, right } = useMemo(
    () => simpleDiff(oldContent, newContent),
    [oldContent, newContent]
  );

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Diff</CardTitle>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs",
              mode === "side-by-side"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => onModeChange?.("side-by-side")}
          >
            <Columns className="h-4 w-4" />
            Side-by-side
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs",
              mode === "inline"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => onModeChange?.("inline")}
          >
            <Rows className="h-4 w-4" />
            Inline
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "rounded-lg border border-white/[0.03] bg-secondary/30 overflow-hidden",
            "max-h-[320px] overflow-y-auto"
          )}
        >
          {mode === "side-by-side" ? (
            <div className="grid grid-cols-2 divide-x divide-white/[0.03]">
              <div className="p-3 font-mono text-xs">
                <p className="text-muted-foreground mb-2 text-[10px] uppercase">
                  Previous
                </p>
                {(left ?? []).map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "py-0.5",
                      (right[i] ?? "") !== line && "bg-destructive/10 text-destructive"
                    )}
                  >
                    {line || " "}
                  </div>
                ))}
              </div>
              <div className="p-3 font-mono text-xs">
                <p className="text-muted-foreground mb-2 text-[10px] uppercase">
                  Current
                </p>
                {(right ?? []).map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "py-0.5",
                      (left[i] ?? "") !== line && "bg-teal/10 text-teal"
                    )}
                  >
                    {line || " "}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 font-mono text-xs space-y-1">
              {(left ?? []).map((la, i) => {
                const lb = right[i] ?? "";
                const changed = la !== lb;
                return (
                  <div key={i} className={cn("flex gap-2", changed && "bg-secondary/50")}>
                    <span className="w-8 shrink-0 text-muted-foreground">{i + 1}</span>
                    {changed ? (
                      <>
                        <span className="flex-1 text-destructive line-through">
                          {la || " "}
                        </span>
                        <span className="flex-1 text-teal">{lb || " "}</span>
                      </>
                    ) : (
                      <span className="flex-1">{la || " "}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
