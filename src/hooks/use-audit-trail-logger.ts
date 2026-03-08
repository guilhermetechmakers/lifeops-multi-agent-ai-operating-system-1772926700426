/**
 * Lightweight client-side hook to log password reset attempts and outcomes.
 * Server-side logs are primary for auditing; this supports UI feedback.
 */

import { useCallback } from "react";

export type PasswordResetAction =
  | "request_reset"
  | "verify_token"
  | "set_password"
  | "complete";

export interface AuditLogEntry {
  action: PasswordResetAction;
  outcome: "success" | "error";
  timestamp: string;
  details?: string;
}

const STORAGE_KEY = "lifeops_pw_reset_audit";

function getStoredEntries(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AuditLogEntry[]) : [];
  } catch {
    return [];
  }
}

function storeEntries(entries: AuditLogEntry[]): void {
  try {
    const trimmed = entries.slice(-20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function useAuditTrailLogger() {
  const log = useCallback(
    (action: PasswordResetAction, outcome: "success" | "error", details?: string) => {
      const entries = getStoredEntries();
      entries.push({
        action,
        outcome,
        timestamp: new Date().toISOString(),
        details,
      });
      storeEntries(entries);
    },
    []
  );

  return { log };
}
