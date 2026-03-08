/**
 * TestTriggerBar — compact controls to run tests, replay webhooks, fetch logs.
 */

import { Play, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface TestTriggerBarProps {
  integrationId: string;
  environments?: string[];
  onTriggerRun: () => void;
  onFetchLogs?: () => void;
  onReplayWebhook?: () => void;
  isRunning?: boolean;
  className?: string;
}

export function TestTriggerBar({
  integrationId,
  environments = ["staging", "production"],
  onTriggerRun,
  onFetchLogs,
  onReplayWebhook,
  isRunning = false,
  className,
}: TestTriggerBarProps) {
  const envList = Array.isArray(environments) ? environments : [];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2",
        className
      )}
    >
      {envList.length > 0 && (
        <Select defaultValue={envList[0]}>
          <SelectTrigger className="h-8 w-[120px] border-white/[0.03] text-xs" aria-label="Select environment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {envList.map((env) => (
              <SelectItem key={env} value={env}>
                {env}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button
        variant="default"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={onTriggerRun}
        disabled={isRunning}
        aria-label="Trigger test run"
      >
        <Play className="h-3.5 w-3.5" />
        {isRunning ? "Running…" : "Run Test"}
      </Button>
      {onFetchLogs && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs border-white/[0.03]"
          onClick={onFetchLogs}
          aria-label="Fetch latest logs"
        >
          <FileText className="h-3.5 w-3.5" />
          Fetch Logs
        </Button>
      )}
      {onReplayWebhook && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs border-white/[0.03]"
          onClick={onReplayWebhook}
          aria-label="Replay webhook"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Replay
        </Button>
      )}
    </div>
  );
}
