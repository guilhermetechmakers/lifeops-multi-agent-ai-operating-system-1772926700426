/**
 * Conflict Resolution Engine API client.
 * All responses consumed with nullish coalescing and safe arrays.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api";
import type {
  Conflict,
  Resolution,
  Rule,
  ResolveConflictsRequest,
  ResolveConflictsResponse,
} from "@/types/conflicts";

const BASE = "conflicts";

function safeConflict(data: unknown): Conflict | null {
  if (data && typeof data === "object" && "id" in (data as Record<string, unknown>)) {
    const c = data as Conflict;
    return {
      ...c,
      agents: safeArray(c.agents),
    };
  }
  return null;
}

export const conflictsApi = {
  list: () =>
    api.get<Conflict[]>(BASE).then((r) => safeArray<Conflict>(r ?? [])),

  resolve: (payload: ResolveConflictsRequest) =>
    api.post<ResolveConflictsResponse>(`${BASE}/resolve`, payload),

  get: (id: string) =>
    api.get<Conflict>(`${BASE}/${id}`).then((r) => safeConflict(r ?? {})),

  override: (id: string, payload: { outcome?: string; notes?: string }) =>
    api.post<Resolution>(`${BASE}/${id}/override`, payload),
};
