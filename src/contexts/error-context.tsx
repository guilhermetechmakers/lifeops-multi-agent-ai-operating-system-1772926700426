import * as React from "react";
import type { APIError } from "@/lib/errors/types";
import { normalizeFromUnknown } from "@/lib/errors/normalize";
import { toast } from "sonner";

interface ErrorState {
  error: APIError | null;
  setError: (error: APIError | null) => void;
  clearError: () => void;
  reportError: (err: unknown, options?: { toast?: boolean }) => APIError;
}

const ErrorContext = React.createContext<ErrorState | null>(null);

export function CentralErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = React.useState<APIError | null>(null);
  const clearError = React.useCallback(() => setError(null), []);
  const reportError = React.useCallback((err: unknown, options?: { toast?: boolean }): APIError => {
    const apiErr = normalizeFromUnknown(err);
    setError(apiErr);
    if (options?.toast !== false) toast.error(apiErr.message);
    return apiErr;
  }, []);
  const value = React.useMemo(
    () => ({ error, setError, clearError, reportError }),
    [error, clearError, reportError]
  );
  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}

export function useError(): ErrorState {
  const ctx = React.useContext(ErrorContext);
  if (!ctx) {
    return {
      error: null,
      setError: () => {},
      clearError: () => {},
      reportError: (err: unknown, options?: { toast?: boolean }): APIError => {
        const apiErr = normalizeFromUnknown(err);
        if (options?.toast !== false) toast.error(apiErr.message);
        return apiErr;
      },
    };
  }
  return ctx;
}
