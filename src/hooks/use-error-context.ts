/**
 * useErrorContext — Captures error info, generates errorId, and provides
 * a ready-to-display context payload for the 500 Server Error page.
 */

import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { ErrorContext } from "@/types/server-error";

function generateErrorId(): string {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useErrorContext(overrideErrorId?: string): ErrorContext {
  const location = useLocation();
  const pathname = location?.pathname ?? "/";
  const state = location?.state as { correlationId?: string; errorId?: string } | null | undefined;

  return useMemo(() => {
    const errorId =
      overrideErrorId ?? state?.errorId ?? state?.correlationId ?? generateErrorId();
    return {
      errorId,
      message: "Something went wrong on our side",
      page: pathname,
      timestamp: new Date().toISOString(),
    };
  }, [overrideErrorId, state?.errorId, state?.correlationId, pathname]);
}
