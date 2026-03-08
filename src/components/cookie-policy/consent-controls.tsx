/**
 * ConsentControls — Accept All, Reject All, Save Preferences.
 * LifeOps design: primary accent for primary actions, outline for secondary.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConsentControlsProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSavePreferences: () => void;
  isDirty: boolean;
  isSaving?: boolean;
  categories?: unknown[];
  className?: string;
}

export function ConsentControls({
  onAcceptAll,
  onRejectAll,
  onSavePreferences,
  isDirty,
  isSaving = false,
  className,
}: ConsentControlsProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3", className)}
      role="group"
      aria-label="Cookie consent controls"
    >
      <Button
        variant="outline"
        size="default"
        onClick={onRejectAll}
        className="transition-all duration-200 hover:scale-[1.02]"
        aria-label="Reject all optional cookies"
      >
        Reject All
      </Button>
      <Button
        variant="outline"
        size="default"
        onClick={onAcceptAll}
        className="transition-all duration-200 hover:scale-[1.02]"
        aria-label="Accept all cookies"
      >
        Accept All
      </Button>
      <Button
        variant="default"
        size="default"
        onClick={onSavePreferences}
        disabled={!isDirty || isSaving}
        className="transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        aria-label="Save cookie preferences"
      >
        {isSaving ? "Saving…" : "Save Preferences"}
      </Button>
    </div>
  );
}
