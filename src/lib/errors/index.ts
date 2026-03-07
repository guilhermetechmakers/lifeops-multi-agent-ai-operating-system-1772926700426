/**
 * LifeOps centralized error handling module.
 */

export type { APIError, ValidationError, LoadingState, ErrorDiagnostics, APIErrorCode } from "./types";
export { ERROR_CODES } from "./types";
export { normalizeApiError, normalizeFromUnknown, getValidationErrorsFromApiError } from "./normalize";
export type { NormalizedErrorInput } from "./normalize";
export { getMessageForCode, getRetrySuggestion } from "./messages";
export { logApiError } from "./logger";
export type { LogApiErrorOptions } from "./logger";
