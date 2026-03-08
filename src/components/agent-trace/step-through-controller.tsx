/**
 * StepThroughController — playback controls (play/pause, step, rewind, scrubber).
 * Syncs with graph and memory state for the current step.
 */

import { SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { TraceStep } from "@/types/agent-trace";

export interface StepThroughControllerProps {
  steps: TraceStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  className?: string;
}

export function StepThroughController({
  steps,
  currentStepIndex,
  onStepChange,
  isPlaying = false,
  onPlayPause,
  className,
}: StepThroughControllerProps) {
  const safeSteps = steps ?? [];
  const maxIndex = Math.max(0, safeSteps.length - 1);
  const clampedIndex = Math.max(0, Math.min(currentStepIndex, maxIndex));
  const canRewind = clampedIndex > 0;
  const canForward = clampedIndex < maxIndex;

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!Number.isNaN(v)) onStepChange(Math.max(0, Math.min(v, maxIndex)));
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-white/[0.03] bg-card p-4",
        className
      )}
      role="group"
      aria-label="Step-through playback controls"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-white/[0.03]"
          onClick={() => onStepChange(0)}
          disabled={!canRewind}
          aria-label="Rewind to start"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-white/[0.03]"
          onClick={() => onStepChange(Math.max(0, clampedIndex - 1))}
          disabled={!canRewind}
          aria-label="Step back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {onPlayPause && (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 border-white/[0.03]"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-white/[0.03]"
          onClick={() => onStepChange(Math.min(maxIndex, clampedIndex + 1))}
          disabled={!canForward}
          aria-label="Step forward"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-white/[0.03]"
          onClick={() => onStepChange(maxIndex)}
          disabled={!canForward}
          aria-label="Jump to end"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <span className="ml-2 text-xs text-muted-foreground tabular-nums">
          Step {clampedIndex + 1} / {safeSteps.length || 1}
        </span>
      </div>
      {safeSteps.length > 0 && (
        <input
          type="range"
          min={0}
          max={maxIndex}
          value={clampedIndex}
          onChange={handleScrub}
          className="w-full h-2 rounded-full appearance-none bg-secondary accent-primary"
          aria-label="Scrub timeline"
        />
      )}
      {safeSteps[clampedIndex] && (
        <div className="text-xs text-muted-foreground pt-1">
          {safeSteps[clampedIndex].timestamp
            ? new Date(safeSteps[clampedIndex].timestamp).toISOString()
            : "—"}
          {safeSteps[clampedIndex].activeAgentId && (
            <span className="ml-2">Agent: {safeSteps[clampedIndex].activeAgentId}</span>
          )}
        </div>
      )}
    </div>
  );
}
