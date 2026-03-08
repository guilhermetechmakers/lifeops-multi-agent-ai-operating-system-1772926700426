/**
 * React Query hooks for Sandbox runner.
 * All array data uses safeArray; responses validated before use.
 */

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { sandboxApi } from "@/api/sandbox";
import { mockSandboxRun } from "@/api/sandbox-mock";
import type { SandboxRunInput, SandboxRunResult } from "@/types/templates-personas";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_SANDBOX === "true";

export function useSandboxRun() {
  return useMutation({
    mutationFn: (payload: SandboxRunInput): Promise<SandboxRunResult | null> =>
      USE_MOCK ? mockSandboxRun(payload) : sandboxApi.run(payload),
    onSuccess: () => {
      toast.success("Sandbox run completed");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Sandbox run failed");
    },
  });
}
