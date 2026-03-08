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

const ACCOUNT_TYPES = [
  { id: "personal", label: "Personal", description: "Solo use, individual projects" },
  { id: "team", label: "Team", description: "Small team, shared workspace" },
  { id: "enterprise", label: "Enterprise", description: "Organization, SSO, advanced RBAC" },
];

const RBAC_SCOPES = [
  { id: "member", label: "Member", description: "Default access" },
  { id: "editor", label: "Editor", description: "Create and edit" },
  { id: "admin", label: "Admin", description: "Full access" },
];

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
    accountType: "personal",
    rbacScope: "member",
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
      setData({ accountType: "personal", rbacScope: "member", modules: [], integrations: [], roles: [] });
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

  const setAccountType = (id: string) => setData((d) => ({ ...d, accountType: id }));
  const setRbacScope = (id: string) => setData((d) => ({ ...d, rbacScope: id }));

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
          {step.id === "profile" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Select your account type. You can change this later in Settings.
              </p>
              <div className="flex flex-col gap-2">
                {(ACCOUNT_TYPES ?? []).map((a) => {
                  const selected = (data.accountType as string) === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAccountType(a.id)}
                      className={cn(
                        "flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/[0.06] bg-secondary/50 text-foreground"
                      )}
                    >
                      <span className="font-medium">{a.label}</span>
                      <span className="text-xs text-muted-foreground">{a.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step.id === "security" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Choose your default RBAC scope. Admins can manage roles later.
              </p>
              <div className="flex flex-col gap-2">
                {(RBAC_SCOPES ?? []).map((r) => {
                  const selected = (data.rbacScope as string) === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRbacScope(r.id)}
                      className={cn(
                        "flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/[0.06] bg-secondary/50 text-foreground"
                      )}
                    >
                      <span className="font-medium">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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

          {step.id === "tasks" && (
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

          {step.id === "review" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Review your choices. You can always change these in Settings.
              </p>
              <div className="rounded-lg border border-white/[0.06] bg-secondary/30 p-4 text-sm space-y-2">
                <p><span className="text-muted-foreground">Account type:</span> {String(data.accountType ?? "personal")}</p>
                <p><span className="text-muted-foreground">RBAC scope:</span> {String(data.rbacScope ?? "member")}</p>
                <p><span className="text-muted-foreground">Modules:</span> {(Array.isArray(data.modules) ? data.modules : []).join(", ") || "None"}</p>
                <p><span className="text-muted-foreground">Integrations:</span> {(Array.isArray(data.integrations) ? data.integrations : []).join(", ") || "None"}</p>
              </div>
            </div>
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
