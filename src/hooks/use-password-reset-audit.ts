/**
 * Lightweight client-side hook to log password reset attempts and outcomes.
 * Server-side logs are primary for auditing; this supports UI feedback.
 */

import { useCallback } from "react";

export type AuditAction =
  | "request_reset"
  | "verify_token"
  | "set_password"
  | "confirmation";

export interface AuditEntry {
  action: AuditAction;
  outcome: "success" | "error";
  timestamp: string;
  details?: string;
}

export function usePasswordResetAudit() {
  const log = useCallback((action: AuditAction, outcome: "success" | "error", details?: string) => {
    const entry: AuditEntry = {
      action,
      outcome,
      timestamp: new Date().toISOString(),
      details,
    };
    if (import.meta.env.DEV) {
      console.debug("[PasswordResetAudit]", entry);
    }
  }, []);

  return { log };
}
