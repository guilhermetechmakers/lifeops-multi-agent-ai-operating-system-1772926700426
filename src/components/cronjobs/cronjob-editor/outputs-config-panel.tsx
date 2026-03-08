/**
 * OutputsConfigPanel: Run history, logs, artifacts, diffs, trace visibility.
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { LayoutList, FileText, FolderOpen, GitCompare, Activity } from "lucide-react";
import type { CronjobOutputsConfig } from "@/types/cronjob";

export interface OutputsConfigPanelProps {
  value?: Partial<CronjobOutputsConfig> | null;
  onChange: (v: Partial<CronjobOutputsConfig>) => void;
  className?: string;
  disabled?: boolean;
}

const TOGGLES: {
  key: keyof CronjobOutputsConfig;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "runHistory",
    label: "Run history",
    description: "Show run history and past executions",
    icon: <LayoutList className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "logs",
    label: "Logs",
    description: "Capture and display run logs",
    icon: <FileText className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "artifacts",
    label: "Artifacts",
    description: "Store and expose run artifacts",
    icon: <FolderOpen className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "diffs",
    label: "Diffs",
    description: "Show file or output diffs",
    icon: <GitCompare className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "trace",
    label: "Trace",
    description: "Enable execution trace for debugging",
    icon: <Activity className="h-4 w-4 text-muted-foreground" />,
  },
];

export function OutputsConfigPanel({
  value = {},
  onChange,
  className,
  disabled,
}: OutputsConfigPanelProps) {
  const cfg = value ?? {};

  return (
    <div className={cn("space-y-4", className)}>
      <Label className="text-sm font-medium">Outputs & visibility</Label>
      <p className="text-xs text-muted-foreground">
        Choose what to capture and display for each run.
      </p>
      <div className="space-y-3">
        {(TOGGLES ?? []).map(({ key, label, description, icon }) => {
          const isTrace = key === "trace";
          const effective =
            isTrace
              ? (cfg.trace ?? (cfg as { traceEnabled?: boolean }).traceEnabled ?? true)
              : ((cfg as Record<string, unknown>)[key] ?? true);
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.03] bg-secondary/20 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <span className="text-sm font-medium">{label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
              <Switch
                checked={key === "artifacts" ? (Array.isArray(cfg.artifacts) && cfg.artifacts.length > 0) : Boolean(effective)}
                onCheckedChange={(checked) => {
                  const next = { ...cfg } as Partial<CronjobOutputsConfig>;
                  if (key === "trace") {
                    next.trace = checked;
                    (next as CronjobOutputsConfig & { traceEnabled?: boolean }).traceEnabled = checked;
                  } else if (key === "artifacts") {
                    next.artifacts = checked ? ["default"] : [];
                  } else {
                    (next as Record<string, unknown>)[key] = checked;
                  }
                  onChange(next);
                }}
                disabled={disabled}
                aria-label={label}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
