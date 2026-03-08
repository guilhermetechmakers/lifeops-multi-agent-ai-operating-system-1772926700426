/**
 * Scoped Memory Store types for LifeOps.
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
  valueEncrypted?: string;
  redactedFields?: string[];
  ttlMs?: number;
  createdAt: string;
  updatedAt: string;
  encryptionMetadata?: EncryptionMetadata;
  auditLog: MemoryAuditEntry[];
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

export interface ListMemoriesParams {
  scopeType?: MemoryScopeType;
  scopeId?: string;
  key?: string;
  filters?: Record<string, unknown>;
}

export interface MemoryDiff {
  memoryId: string;
  key: string;
  scopeType: MemoryScopeType;
  scopeId: string;
  before?: unknown;
  after?: unknown;
  changedFields?: string[];
  redactedFields?: string[];
  timestamp: string;
}
