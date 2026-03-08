/**
 * Sandbox runner modal — fetches template by ID and renders SandboxRunnerPanel.
 */

import { SandboxRunnerPanel } from "@/components/templates-personas/sandbox-runner-panel";
import { useTemplate } from "@/hooks/use-templates";

export interface SandboxRunnerModalProps {
  templateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SandboxRunnerModal({
  templateId,
  open,
  onOpenChange,
}: SandboxRunnerModalProps) {
  const { data: template } = useTemplate(open ? templateId : null);

  return (
    <SandboxRunnerPanel
      template={template ?? null}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
