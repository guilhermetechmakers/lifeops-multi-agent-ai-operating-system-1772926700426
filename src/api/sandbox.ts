/**
 * Sandbox/Test execution API client.
 */

import { api } from "@/lib/api";
import type { SandboxRunInput, SandboxRunResult } from "@/types/templates-personas";

export const sandboxApi = {
  run: (payload: SandboxRunInput) =>
    api.post<SandboxRunResult>("/sandbox/runs", payload),
};
