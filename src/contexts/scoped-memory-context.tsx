/**
 * ScopedMemoryStoreProvider — React context for memory APIs.
 * Exposes getMemory, setMemory, listMemories, purgeExpiredMemories.
 * API-agnostic persistence layer; can be swapped to API calls.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { memoriesApi } from "@/api/memories";
import * as mock from "@/api/memories-mock";
import { safeArray } from "@/lib/api";
import type {
  Memory,
  MemoryScopeType,
  CreateMemoryPayload,
} from "@/types/scoped-memory";

const USE_MOCK =
  !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_MEMORIES === "true";

interface ScopedMemoryStoreContextValue {
  getMemory: (
    scopeType: MemoryScopeType,
    scopeId: string,
    key: string
  ) => Promise<Memory | null>;
  setMemory: (
    scopeType: MemoryScopeType,
    scopeId: string,
    key: string,
    value: unknown,
    ttlMs?: number,
    redactFields?: string[]
  ) => Promise<Memory | null>;
  listMemories: (
    scopeType: MemoryScopeType,
    scopeId: string,
    filter?: { key?: string }
  ) => Promise<Memory[]>;
  purgeExpiredMemories: () => Promise<number>;
}

const ScopedMemoryStoreContext = createContext<ScopedMemoryStoreContextValue | null>(null);

export function ScopedMemoryStoreProvider({ children }: { children: ReactNode }) {
  const getMemory = useCallback(
    async (scopeType: MemoryScopeType, scopeId: string, key: string): Promise<Memory | null> => {
      if (USE_MOCK) {
        const list = await mock.mockListMemories(scopeType, scopeId);
        const found = (list ?? []).find((m) => m.key === key);
        return found ?? null;
      }
      return memoriesApi.getByScope(scopeType, scopeId, key);
    },
    []
  );

  const setMemory = useCallback(
    async (
      scopeType: MemoryScopeType,
      scopeId: string,
      key: string,
      value: unknown,
      ttlMs?: number,
      redactFields?: string[]
    ): Promise<Memory | null> => {
      const payload: CreateMemoryPayload = {
        scopeType,
        scopeId,
        key,
        value,
        ttlMs,
        redactFields,
      };
      if (USE_MOCK) return mock.mockCreateMemory(payload);
      return memoriesApi.create(payload);
    },
    []
  );

  const listMemories = useCallback(
    async (
      scopeType: MemoryScopeType,
      scopeId: string,
      filter?: { key?: string }
    ): Promise<Memory[]> => {
      const result = USE_MOCK
        ? await mock.mockListMemories(scopeType, scopeId)
        : await memoriesApi.list(scopeType, scopeId, filter);
      const list = safeArray<Memory>(result);
      if (filter?.key) {
        const q = filter.key.toLowerCase();
        return list.filter((m) => (m.key ?? "").toLowerCase().includes(q));
      }
      return list;
    },
    []
  );

  const purgeExpiredMemories = useCallback(async (): Promise<number> => {
    const result = USE_MOCK
      ? await mock.mockPurgeExpiredMemories()
      : await memoriesApi.purgeExpired();
    return (result as { purged?: number })?.purged ?? 0;
  }, []);

  const value = useMemo<ScopedMemoryStoreContextValue>(
    () => ({
      getMemory,
      setMemory,
      listMemories,
      purgeExpiredMemories,
    }),
    [getMemory, setMemory, listMemories, purgeExpiredMemories]
  );

  return (
    <ScopedMemoryStoreContext.Provider value={value}>
      {children}
    </ScopedMemoryStoreContext.Provider>
  );
}

export function useScopedMemoryStore(): ScopedMemoryStoreContextValue {
  const ctx = useContext(ScopedMemoryStoreContext);
  if (!ctx) {
    throw new Error("useScopedMemoryStore must be used within ScopedMemoryStoreProvider");
  }
  return ctx;
}

export function useScopedMemoryStoreOptional(): ScopedMemoryStoreContextValue | null {
  return useContext(ScopedMemoryStoreContext);
}
