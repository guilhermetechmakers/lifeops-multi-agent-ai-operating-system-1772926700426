/**
 * Mock Sandbox API for development and testing.
 */

import type { SandboxRunInput, SandboxRunResult } from "@/types/templates-personas";

export async function mockSandboxRun(
  payload: SandboxRunInput
): Promise<SandboxRunResult | null> {
  await new Promise((r) => setTimeout(r, 1500));
  const now = new Date().toISOString();
  return {
    id: `sandbox-${Date.now()}`,
    templateId: payload.templateId,
    inputPayload: payload.inputPayload ?? {},
    result: {
      success: true,
      prompts: ["Simulated prompt: " + JSON.stringify(payload.inputPayload)],
      agentMessages: [
        { role: "system", content: "Running in sandbox mode." },
        { role: "assistant", content: "Simulated response based on input." },
      ],
      outputs: { simulated: true, timestamp: now },
      unsafeBehaviorDetected: false,
    } as Record<string, unknown>,
    logs: [
      `[${now}] Sandbox run started`,
      `[${now}] Template: ${payload.templateId}`,
      `[${now}] Simulated execution complete`,
    ],
    artifacts: [
      { name: "output.json", uri: "sandbox://output.json", type: "json" },
    ],
    errors: [],
  };
}
