/**
 * React Query hook for memory diffs by run ID.
 * Used by Run Details page MemoryDiffPanel.
 */

import { useQuery } from "@tanstack/react-query";
import { memoriesApi } from "@/api/memories";
import * as mock from "@/api/memories-mock";
import { safeArray } from "@/lib/api";
import type { MemoryDiff } from "@/types/scoped-memory";

const USE_MOCK =
  !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_MEMORIES === "true";

const keys = {
  diffs: (runId: string) => ["memories", "diffs", runId] as const,
};

export function useMemoryDiffs(runId: string | undefined | null) {
  const query = useQuery({
    queryKey: keys.diffs(runId ?? ""),
    queryFn: () =>
      USE_MOCK ? mock.mockGetMemoryDiffs(runId!) : memoriesApi.getDiffs(runId!),
    enabled: Boolean(runId),
    staleTime: 30 * 1000,
  });

  const diffs = safeArray<MemoryDiff>(query.data);

  return {
    ...query,
    diffs,
  };
}
