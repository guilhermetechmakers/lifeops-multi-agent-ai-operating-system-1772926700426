# LifeOps Error Handling & Validation Module

Unified error handling and validation for the LifeOps app: centralized API error format, client-side validation, correlation IDs, and reusable UI for loading/success/error states.

## Structure

- **types.ts** — `APIError`, `ValidationError`, `LoadingState`, `ERROR_CODES`
- **normalize.ts** — `normalizeApiError()`, `getValidationErrorsFromApiError()`
- **messages.ts** — `getMessageForCode()`, `getRetrySuggestion()` (message catalog)
- **logger.ts** — `logApiError()` (sanitized client logging)

## Usage

### Normalizing errors

```ts
import { normalizeApiError, logApiError } from "@/lib/errors";

try {
  await api.post("/jobs", payload);
} catch (err) {
  const apiError = normalizeApiError({
    error: err instanceof Error ? err : String(err),
    endpoint: "/jobs",
  });
  logApiError(apiError, { endpoint: "/jobs" });
  setError(apiError);
}
```

### API layer

The main `api` in `@/lib/api` already attaches `X-Correlation-Id`, normalizes failures into `ApiClientError`, and logs. Use `asApiError(err)` in catch blocks to get `APIError | undefined`.

### Validation

```ts
import { validateForm } from "@/lib/validation";

const schema = {
  name: { rules: [{ type: "required", message: "Name is required" }] },
  email: {
    rules: [
      { type: "required", message: "Email is required" },
      { type: "email", message: "Invalid email" },
    ],
  },
};
const { isValid, errors } = validateForm(schema, formData);
if (!isValid) setFieldErrors(errors);
```

### UI

- **ErrorBoundary** — Catches render errors; wrap route trees in `App.tsx`.
- **FieldError** — Inline message under a form field.
- **RetryPanel** — Shows error message, correlation ID, retry button, optional diagnostics.
- **StatusBadge** — Badge for error/status codes.
- **GlobalErrorView** — Full-page error with retry and home.
- **LoadingSuccessPage** — Loading spinner, success checkmark, or error (RetryPanel).

### Pages

- **ServerErrorPage** (`/500`) — Generic server error with retry and home.
- **LoadingSuccessPage** — Reusable loading/success/error states; use with `useLoadingSuccess` or local state.

## Correlation ID

Generated per session (or from response header). Sent as `X-Correlation-Id` on every request. Shown in error UI and logs for support/debugging.

## Testing

See `src/lib/errors/__tests__/normalize.test.ts` and `src/lib/validation/__tests__/validate.test.ts` for unit test examples. Run with Vitest once configured.
