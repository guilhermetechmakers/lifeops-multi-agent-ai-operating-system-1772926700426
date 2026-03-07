# LifeOps Error Handling & Validation

## Overview

LifeOps uses a unified error handling and validation system with:

- **Centralized API error format** — `{ code, message, details?, correlationId?, retryable?, status? }`
- **Client-side validation** — Schema-based `validateForm()` with per-field errors
- **Correlation IDs** — End-to-end tracing via `X-Correlation-Id` header
- **User-friendly messages** — Message catalog with actionable guidance
- **Retry and diagnostics** — RetryPanel, StatusBadge, ErrorBoundary

## Integration

### 1. API Layer

All API calls use the enhanced `api` client which:

- Attaches `X-Correlation-Id` to every request
- Normalizes errors to `APIError` shape
- Logs errors with sanitized payloads

```ts
import { api, isApiClientError, asApiError, safeArray } from "@/lib/api";

try {
  const data = await api.get<Item[]>("/items");
  const items = safeArray(data); // Guards against non-array
} catch (err) {
  if (isApiClientError(err)) {
    // err is ApiClientError with code, message, correlationId, etc.
  }
  const apiErr = asApiError(err);
}
```

### 2. Error Context

Wrap your app with `CentralErrorProvider` and use `useError()`:

```tsx
import { useError } from "@/contexts/error-context";

function MyForm() {
  const { reportError } = useError();

  const onSubmit = async (data) => {
    try {
      await api.post("/submit", data);
    } catch (err) {
      reportError(err); // Normalizes, stores, shows toast
    }
  };
}
```

### 3. Client-Side Validation

```tsx
import { validateForm, mergeValidationErrors } from "@/lib/validation";

const schema = {
  email: { rules: [{ type: "required", message: "Required" }, { type: "email" }] },
  name: { rules: [{ type: "minLength", value: 2 }] },
};

const { isValid, errors } = validateForm(schema, formData);
if (!isValid) {
  // errors: Record<string, string> — field -> message
}

// Merge server validation errors
const merged = mergeValidationErrors(errors, serverErrors);
```

### 4. UI Components

- **ErrorBoundary** — Catches render errors, shows fallback with correlationId
- **FieldError** — Inline error for form fields
- **RetryPanel** — Error panel with retry button and expandable diagnostics
- **StatusBadge** — Color-coded badge for error codes
- **GlobalErrorView** — Full-page error layout (page_500 style)
- **LoadingSuccessPage** — Loading → Success or Error states

### 5. Pages

- **/500** — Server error page (`ServerErrorPage`). Pass `correlationId` via `navigate("/500", { state: { correlationId } })`
- **LoadingSuccessPage** — Reusable component for async flows

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_REQUEST | Bad request |
| VALIDATION_FAILED | Field validation failed |
| UNAUTHORIZED | 401 |
| FORBIDDEN | 403 |
| NOT_FOUND | 404 |
| CONFLICT | 409 |
| RATE_LIMITED | 429 |
| INTERNAL_ERROR | 500 |
| SERVICE_UNAVAILABLE | 502/503 |
| TIMEOUT | 408/504 |

## Testing

Unit tests (require `vitest`):

- `src/lib/errors/__tests__/normalize.test.ts` — normalizeApiError, getValidationErrorsFromApiError
- `src/lib/validation/__tests__/validate.test.ts` — validateForm

Run: `npx vitest run src/lib/errors src/lib/validation`

## Migration Notes

- Replace `throw new Error()` in API catch blocks with normalized errors
- Use `safeArray()` and `Array.isArray()` when consuming API arrays
- Initialize state with `useState<Item[]>([])` for arrays
- Use `FieldError` for form validation messages
