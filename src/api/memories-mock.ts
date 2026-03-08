/**
 * Mock Memories API for Scoped Memory Store development.
 * Returns consistent shapes; consume with (data ?? []).
 */

import type {
  Memory,
  MemoryDiff,
  CreateMemoryPayload,
  UpdateMemoryPayload,
} from "@/types/scoped-memory";

const MEMORY_STORE = new Map<string, Memory>();

function generateId(): string {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const MOCK_MEMORY_DIFFS: MemoryDiff[] = [
  {
    memoryId: "mem-1",
    scopeType: "run",
    scopeId: "run-1-1",
    key: "taskState",
    before: { status: "pending", retries: 0 },
    after: { status: "completed", retries: 0, result: "ok" },
    changedFields: ["status", "result"],
    timestamp: new Date().toISOString(),
  },
  {
    memoryId: "mem-2",
    scopeType: "agent",
    scopeId: "agent-pr-triage",
    key: "sessionToken",
    before: "***",
    after: "***",
    redactedFields: ["value"],
    timestamp: new Date().toISOString(),
  },
];

export async function mockCreateMemory(payload: CreateMemoryPayload): Promise<Memory | null> {
  await new Promise((r) => setTimeout(r, 150));
  const id = generateId();
  const now = new Date().toISOString();
  const memory: Memory = {
    id,
    scopeType: payload.scopeType,
    scopeId: payload.scopeId,
    key: payload.key,
    value: payload.value,
    redactedFields: payload.redactFields ?? [],
    ttlMs: payload.ttlMs,
    createdAt: now,
    updatedAt: now,
    auditLog: [{ action: "CREATE", actorId: "system", timestamp: now }],
  };
  MEMORY_STORE.set(id, memory);
  return memory;
}

export async function mockGetMemory(memoryId: string): Promise<Memory | null> {
  await new Promise((r) => setTimeout(r, 100));
  return MEMORY_STORE.get(memoryId) ?? null;
}

export async function mockUpdateMemory(
  memoryId: string,
  payload: UpdateMemoryPayload
): Promise<Memory | null> {
  await new Promise((r) => setTimeout(r, 150));
  const existing = MEMORY_STORE.get(memoryId);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated: Memory = {
    ...existing,
    value: payload.value ?? existing.value,
    ttlMs: payload.ttlMs ?? existing.ttlMs,
    redactedFields: payload.redactFields ?? existing.redactedFields,
    updatedAt: now,
    auditLog: [
      ...(existing.auditLog ?? []),
      { action: "UPDATE", actorId: "system", timestamp: now },
    ],
  };
  MEMORY_STORE.set(memoryId, updated);
  return updated;
}

export async function mockDeleteMemory(memoryId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  MEMORY_STORE.delete(memoryId);
}

export async function mockListMemories(
  _scopeType: string,
  _scopeId: string
): Promise<Memory[]> {
  await new Promise((r) => setTimeout(r, 100));
  return Array.from(MEMORY_STORE.values());
}

export async function mockGetMemoryDiffs(runId: string): Promise<MemoryDiff[]> {
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_MEMORY_DIFFS.map((d) => ({
    ...d,
    scopeId: d.scopeType === "run" ? runId : d.scopeId,
  }));
}

export async function mockPurgeExpiredMemories(): Promise<{ purged: number }> {
  await new Promise((r) => setTimeout(r, 200));
  return { purged: 0 };
}
