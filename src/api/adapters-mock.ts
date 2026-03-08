/**
 * Mock Adapters API for LifeOps.
 * Used when VITE_API_URL is not set. All arrays guarded.
 */

import type {
  AdapterInstance,
  CreateAdapterInput,
  UpdateAdapterInput,
  TestAdapterResult,
  RunAdapterInput,
  RunAdapterResult,
  TelemetryEvent,
  HealthStatus,
} from "@/types/adapters";

const mockAdapters: AdapterInstance[] = [
  {
    id: "adp-llm-1",
    type: "llm",
    name: "LLM Provider",
    enabled: true,
    config: { rateLimit: 100 },
    credentialsRef: "creds-llm",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-07T12:00:00Z",
  },
  {
    id: "adp-github-1",
    type: "github",
    name: "GitHub",
    enabled: false,
    config: {},
    credentialsRef: "",
    createdAt: "2024-03-02T00:00:00Z",
    updatedAt: "2024-03-02T00:00:00Z",
  },
  {
    id: "adp-plaid-1",
    type: "plaid",
    name: "Plaid",
    enabled: false,
    config: {},
    credentialsRef: "",
    createdAt: "2024-03-03T00:00:00Z",
    updatedAt: "2024-03-03T00:00:00Z",
  },
  {
    id: "adp-stripe-1",
    type: "stripe",
    name: "Stripe",
    enabled: false,
    config: {},
    credentialsRef: "",
    createdAt: "2024-03-04T00:00:00Z",
    updatedAt: "2024-03-04T00:00:00Z",
  },
  {
    id: "adp-quickbooks-1",
    type: "quickbooks",
    name: "QuickBooks",
    enabled: false,
    config: {},
    credentialsRef: "",
    createdAt: "2024-03-05T00:00:00Z",
    updatedAt: "2024-03-05T00:00:00Z",
  },
  {
    id: "adp-health-1",
    type: "health",
    name: "Health APIs",
    enabled: false,
    config: {},
    credentialsRef: "",
    createdAt: "2024-03-06T00:00:00Z",
    updatedAt: "2024-03-06T00:00:00Z",
  },
];

const mockTelemetry: TelemetryEvent[] = [
  {
    id: "tel-1",
    adapterId: "adp-llm-1",
    eventType: "test",
    latencyMs: 120,
    success: true,
    timestamp: new Date().toISOString(),
  },
  {
    id: "tel-2",
    adapterId: "adp-llm-1",
    eventType: "run",
    latencyMs: 450,
    success: true,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

const mockHealth: HealthStatus[] = [
  { adapterId: "adp-llm-1", status: "healthy", checkedAt: new Date().toISOString() },
  { adapterId: "adp-github-1", status: "unhealthy", checkedAt: new Date().toISOString(), details: "Not connected" },
  { adapterId: "adp-plaid-1", status: "unhealthy", checkedAt: new Date().toISOString() },
  { adapterId: "adp-stripe-1", status: "unhealthy", checkedAt: new Date().toISOString() },
  { adapterId: "adp-quickbooks-1", status: "unhealthy", checkedAt: new Date().toISOString() },
  { adapterId: "adp-health-1", status: "unhealthy", checkedAt: new Date().toISOString() },
];

export const adaptersMockApi = {
  list: async (): Promise<AdapterInstance[]> => {
    await new Promise((r) => setTimeout(r, 250));
    return [...mockAdapters];
  },

  get: async (id: string): Promise<AdapterInstance | null> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockAdapters.find((a) => a.id === id) ?? null;
  },

  create: async (input: CreateAdapterInput): Promise<AdapterInstance> => {
    await new Promise((r) => setTimeout(r, 300));
    const now = new Date().toISOString();
    const newAdapter: AdapterInstance = {
      id: `adp-${input.type}-${Date.now()}`,
      type: input.type,
      name: input.name,
      enabled: input.enabled ?? true,
      config: input.config ?? {},
      credentialsRef: input.credentialsRef ?? "",
      createdAt: now,
      updatedAt: now,
    };
    mockAdapters.push(newAdapter);
    return { ...newAdapter };
  },

  update: async (id: string, input: UpdateAdapterInput): Promise<AdapterInstance> => {
    await new Promise((r) => setTimeout(r, 200));
    const idx = mockAdapters.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Adapter not found");
    const updated = {
      ...mockAdapters[idx],
      name: input.name ?? mockAdapters[idx].name,
      enabled: input.enabled ?? mockAdapters[idx].enabled,
      config: input.config ?? mockAdapters[idx].config,
      credentialsRef: input.credentialsRef !== undefined ? input.credentialsRef : mockAdapters[idx].credentialsRef,
      updatedAt: new Date().toISOString(),
    };
    mockAdapters[idx] = updated;
    return { ...updated };
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200));
    const idx = mockAdapters.findIndex((a) => a.id === id);
    if (idx !== -1) mockAdapters.splice(idx, 1);
  },

  test: async (id: string): Promise<TestAdapterResult> => {
    await new Promise((r) => setTimeout(r, 500));
    const adapter = mockAdapters.find((a) => a.id === id);
    const hasCreds = !!adapter?.credentialsRef;
    return {
      ok: hasCreds,
      message: hasCreds ? "Connection successful" : "No credentials configured",
      latencyMs: 120,
    };
  },

  run: async (id: string, _input: RunAdapterInput): Promise<RunAdapterResult> => {
    await new Promise((r) => setTimeout(r, 600));
    const adapter = mockAdapters.find((a) => a.id === id);
    const hasCreds = !!adapter?.credentialsRef;
    return {
      runId: `run-${Date.now()}`,
      status: hasCreds ? "success" : "failed",
      result: hasCreds ? { sample: true } : undefined,
      error: hasCreds ? undefined : "Adapter not connected",
    };
  },

  rotateCredential: async (id: string): Promise<{ credentialsRef: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    const ref = `creds-${id}-${Date.now()}`;
    const idx = mockAdapters.findIndex((a) => a.id === id);
    if (idx !== -1) mockAdapters[idx].credentialsRef = ref;
    return { credentialsRef: ref };
  },

  getTelemetry: async (): Promise<TelemetryEvent[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return [...mockTelemetry];
  },

  getHealth: async (): Promise<HealthStatus[]> => {
    await new Promise((r) => setTimeout(r, 150));
    return [...mockHealth];
  },
};
