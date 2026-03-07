import * as React from "react";
import { asApiError } from "@/lib/api";
import type { APIError } from "@/lib/errors/types";
import type { LoadingSuccessStatus } from "@/pages/loading-success";

export interface UseLoadingSuccessOptions {
  onSuccess?: () => void;
  onError?: (error: APIError) => void;
}

/**
 * Hook to drive LoadingSuccessPage state from an async operation.
 * Returns status, error, run (trigger), retry, reset.
 */
export function useLoadingSuccess(options: UseLoadingSuccessOptions = {}) {
  const [status, setStatus] = React.useState<LoadingSuccessStatus>("idle");
  const [error, setError] = React.useState<APIError | null>(null);

  const run = React.useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setError(null);
      setStatus("loading");
      try {
        const result = await fn();
        setStatus("success");
        options.onSuccess?.();
        return result;
      } catch (err) {
        const apiErr = asApiError(err);
        const normalized: APIError = apiErr ?? {
          code: "INTERNAL_ERROR",
          message: err instanceof Error ? err.message : "An unexpected error occurred.",
        };
        setError(normalized);
        setStatus("error");
        options.onError?.(normalized);
        return undefined;
      }
    },
    [options]
  );

  const retry = React.useCallback(() => {
    setError(null);
    setStatus("idle");
  }, []);

  const reset = React.useCallback(() => {
    setError(null);
    setStatus("idle");
  }, []);

  return { status, error, run, retry, reset };
}
