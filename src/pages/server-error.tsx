/**
 * 500 Server Error route. Renders the full 500 page with retry, guidance, and support.
 * Accepts errorId/correlationId via location state for traceability.
 */

import { useLocation } from "react-router-dom";
import { ServerError500Page } from "@/components/server-error";

export default function ServerErrorPage() {
  const location = useLocation();
  const state = (location?.state ?? null) as
    | { correlationId?: string; errorId?: string }
    | null;
  const errorId = state?.errorId ?? state?.correlationId ?? null;

  return (
    <ServerError500Page
      errorId={errorId}
      onRetry={() => window.location.reload()}
    />
  );
}
