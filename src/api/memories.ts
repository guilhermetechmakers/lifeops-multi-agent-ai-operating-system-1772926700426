/**
 * Memories API — Scoped Memory Store.
 * createMemory, readMemory, updateMemory, deleteMemory, listMemories, purgeExpiredMemories.
 */

import { api, safeArray } from "@/lib/api";
import type {
  Memory,
  MemoryDiff,
  CreateMemoryPayload,
  UpdateMemoryPayload,
  MemoryListFilters,
} from "@/types/scoped-memory";

const BASE = "memories";

function safeMemory(data: unknown): Memory | null {
  if (data && typeof data === "object" && "id" in (data as Record<string, unknown>)) {
    const m = data as Memory;
    return {
      ...m,
      auditLog: safeArray(m.auditLog),
      redactedFields: Array.isArray(m.redactedFields) ? m.redactedFields : [],
    };
  }
  return null;
}

export const memoriesApi = {
  create: (payload: CreateMemoryPayload) =>
    api.post<Memory>(BASE, payload).then((r) => safeMemory(r ?? {})),

  get: (memoryId: string) =>
    api.get<Memory>(`${BASE}/${memoryId}`).then((r) => safeMemory(r ?? {})),

  getByScope: (scopeType: string, scopeId: string, key: string) =>
    api
      .get<Memory>(`${BASE}?scopeType=${scopeType}&scopeId=${scopeId}&key=${encodeURIComponent(key)}`)
      .then((r) => safeMemory(r ?? {})),

  update: (memoryId: string, payload: UpdateMemoryPayload) =>
    api.patch<Memory>(`${BASE}/${memoryId}`, payload).then((r) => safeMemory(r ?? {})),

  delete: (memoryId: string) => api.delete<void>(`${BASE}/${memoryId}`),

  list: (scopeType: string, scopeId: string, _filters?: MemoryListFilters) =>
    api
      .get<Memory[]>(`${BASE}?scopeType=${scopeType}&scopeId=${scopeId}`)
      .then((r) => safeArray<Memory>(r ?? [])),

  getDiffs: (runId: string) =>
    api
      .get<MemoryDiff[]>(`runs/${runId}/memory-diffs`)
      .then((r) => (Array.isArray(r) ? (r as MemoryDiff[]) : [])),

  purgeExpired: () => api.post<{ purged: number }>(`${BASE}/purge`, {}),
};
