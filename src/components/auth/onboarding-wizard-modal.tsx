import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getOnboardingSteps, submitOnboarding } from "@/api/auth";
import type { OnboardingStep as OnboardingStepType } from "@/types/auth";
import { cn } from "@/lib/utils";

const MODULES = [
  { id: "cronjobs", label: "Cronjobs & automation" },
  { id: "approvals", label: "Approvals" },
  { id: "content", label: "Content" },
  { id: "artifacts", label: "Artifacts" },
  { id: "finance", label: "Finance" },
  { id: "health", label: "Health" },
];

const INTEGRATIONS = [
  { id: "slack", label: "Slack" },
  { id: "github", label: "GitHub" },
  { id: "notion", label: "Notion" },
];

export interface OnboardingWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onComplete?: () => void;
}

export function OnboardingWizardModal({
  open,
  onOpenChange,
  sessionId,
  onComplete,
}: OnboardingWizardModalProps) {
  const navigate = useNavigate();
  const [steps, setSteps] = React.useState<OnboardingStepType[]>([]);
  const [current, setCurrent] = React.useState(0);
  const [data, setData] = React.useState<Record<string, unknown>>({
    modules: [],
    integrations: [],
    roles: [],
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    getOnboardingSteps().then((s) => {
      const list = Array.isArray(s) ? s : [];
      setSteps(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setCurrent(0);
      setData({ modules: [], integrations: [], roles: [] });
    });
  }, [open]);

  const stepList = steps ?? [];
  const step = stepList[current];
  const isLast = current >= stepList.length - 1;

  const handleNext = async () => {
    setLoading(true);
    try {
      await submitOnboarding(sessionId, current, data);
      if (isLast) {
        onComplete?.();
        onOpenChange(false);
        navigate("/dashboard", { replace: true });
      } else {
        setCurrent((c) => c + 1);
      }
    } catch {
      // Error handled by API/toast
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id: string) => {
    const modules = (data.modules as string[]) ?? [];
    const next = modules.includes(id)
      ? modules.filter((m) => m !== id)
      : [...modules, id];
    setData((d) => ({ ...d, modules: next }));
  };

  const toggleIntegration = (id: string) => {
    const integrations = (data.integrations as string[]) ?? [];
    const next = integrations.includes(id)
      ? integrations.filter((i) => i !== id)
      : [...integrations, id];
    setData((d) => ({ ...d, integrations: next }));
  };

  if (!step) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/[0.03] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Get started</DialogTitle>
          <DialogDescription>
            Step {current + 1} of {stepList.length}: {step.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step.id === "modules" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Select the modules you want to use.
              </p>
              <div className="flex flex-wrap gap-2">
                {(MODULES ?? []).map((m) => {
                  const selected = ((data.modules as string[]) ?? []).includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleModule(m.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/[0.06] bg-secondary/50 text-foreground"
                      )}
                    >
                      {selected && <Check className="h-4 w-4" />}
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step.id === "integrations" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Connect your first integrations (optional).
              </p>
              <div className="flex flex-wrap gap-2">
                {(INTEGRATIONS ?? []).map((i) => {
                  const selected = ((data.integrations as string[]) ?? []).includes(i.id);
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => toggleIntegration(i.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/[0.06] bg-secondary/50 text-foreground"
                      )}
                    >
                      {selected && <Check className="h-4 w-4" />}
                      {i.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(step.id === "rbac" || step.id === "finish") && (
            <p className="text-sm text-muted-foreground">
              {step.id === "rbac"
                ? "Your default role has been set. You can change permissions later in Settings."
                : "You're all set. You can always change these in Settings."}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {!isLast && (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Skip for now
            </Button>
          )}
          <Button onClick={handleNext} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLast ? (
              "Go to Dashboard"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
