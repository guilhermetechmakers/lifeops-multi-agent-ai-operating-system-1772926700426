/**
 * Scoped Memory Store types.
 * Per-run, per-agent, and global memory scopes with encryption and audit.
 * All arrays consumed with (data ?? []) and Array.isArray guards.
 */

export type MemoryScopeType = "run" | "agent" | "global";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "READ";

export interface MemoryAuditEntry {
  action: AuditAction;
  actorId: string;
  timestamp: string;
  notes?: string;
}

export interface EncryptionMetadata {
  algorithm: string;
  keyId: string;
  encryptedAt: string;
}

export interface Memory {
  id: string;
  scopeType: MemoryScopeType;
  scopeId: string;
  key: string;
  value: unknown;
  redactedFields?: string[];
  ttlMs?: number;
  createdAt: string;
  updatedAt: string;
  encryptionMetadata?: EncryptionMetadata;
  auditLog: MemoryAuditEntry[];
}

export interface MemoryDiff {
  memoryId: string;
  scopeType: MemoryScopeType;
  scopeId: string;
  key: string;
  before?: unknown;
  after?: unknown;
  changedFields?: string[];
  redactedFields?: string[];
  timestamp: string;
}

export interface CreateMemoryPayload {
  scopeType: MemoryScopeType;
  scopeId: string;
  key: string;
  value: unknown;
  ttlMs?: number;
  redactFields?: string[];
}

export interface UpdateMemoryPayload {
  value?: unknown;
  ttlMs?: number;
  redactFields?: string[];
}

export interface MemoryListFilters {
  key?: string;
  scopeType?: MemoryScopeType;
}
