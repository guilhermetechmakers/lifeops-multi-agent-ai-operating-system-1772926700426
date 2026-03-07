/**
 * Unit tests for normalizeApiError.
 * Run with: npx vitest run src/lib/errors/__tests__/normalize.test.ts
 * (Requires vitest to be added to the project.)
 */

import { describe, it, expect } from "vitest";
import { normalizeApiError, getValidationErrorsFromApiError } from "../normalize";
import { ERROR_CODES } from "../types";

describe("normalizeApiError", () => {
  it("normalizes 401 response to UNAUTHORIZED", () => {
    const res = normalizeApiError({
      response: { ok: false, status: 401, headers: { get: () => null } } as unknown as Response,
      endpoint: "/api/test",
    });
    expect(res.code).toBe(ERROR_CODES.API.UNAUTHORIZED);
    expect(res.status).toBe(401);
  });

  it("normalizes 422 with body to VALIDATION_FAILED", () => {
    const res = normalizeApiError({
      response: { ok: false, status: 422, headers: { get: () => null } } as unknown as Response,
      body: { code: "VALIDATION_FAILED", message: "Invalid input" },
      endpoint: "/api/test",
    });
    expect(res.code).toBe(ERROR_CODES.API.VALIDATION_FAILED);
    expect(res.message).toBe("Invalid input");
  });

  it("uses body correlationId when present", () => {
    const res = normalizeApiError({
      response: { ok: false, status: 500, headers: { get: () => null } } as unknown as Response,
      body: { correlationId: "abc-123" },
      endpoint: "/api/test",
    });
    expect(res.correlationId).toBe("abc-123");
  });

  it("generates correlationId when missing", () => {
    const res = normalizeApiError({
      response: { ok: false, status: 500, headers: { get: () => null } } as unknown as Response,
      endpoint: "/api/test",
    });
    expect(res.correlationId).toBeDefined();
    expect(res.correlationId).toMatch(/^corr_/);
  });
});

describe("getValidationErrorsFromApiError", () => {
  it("returns empty array when details is missing", () => {
    const errors = getValidationErrorsFromApiError({ code: "ERR", message: "Fail" });
    expect(errors).toEqual([]);
  });

  it("extracts errors from details.errors array", () => {
    const apiError = {
      code: "VALIDATION_FAILED",
      message: "Validation failed",
      details: {
        errors: [
          { field: "email", message: "Invalid email" },
          { field: "name", message: "Required" },
        ],
      },
    };
    const errors = getValidationErrorsFromApiError(apiError);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toEqual({ field: "email", message: "Invalid email" });
  });
});
