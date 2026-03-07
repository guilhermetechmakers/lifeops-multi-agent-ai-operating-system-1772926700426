/**
 * User-friendly message catalog for error codes.
 * Default English; structure supports i18n.
 */

import { ERROR_CODES } from "./types";

const MESSAGE_MAP: Record<string, string> = {
  [ERROR_CODES.API.INVALID_REQUEST]:
    "The request was invalid. Please check your input and try again.",
  [ERROR_CODES.API.VALIDATION_FAILED]:
    "Some fields didn't pass validation. Please fix the errors and try again.",
  [ERROR_CODES.API.UNAUTHORIZED]:
    "You need to sign in to continue.",
  [ERROR_CODES.API.FORBIDDEN]:
    "You don't have permission to perform this action.",
  [ERROR_CODES.API.NOT_FOUND]:
    "The requested resource was not found.",
  [ERROR_CODES.API.CONFLICT]:
    "This action conflicts with the current state. Please refresh and try again.",
  [ERROR_CODES.API.RATE_LIMITED]:
    "Too many requests. Please wait a moment before trying again.",
  [ERROR_CODES.API.INTERNAL_ERROR]:
    "Something went wrong on our side. We've been notified. Please try again later.",
  [ERROR_CODES.API.SERVICE_UNAVAILABLE]:
    "The service is temporarily unavailable. Please try again in a few minutes.",
  [ERROR_CODES.API.TIMEOUT]:
    "The request took too long. Please check your connection and try again.",
  [ERROR_CODES.APP_LOGIC.MISSING_DEPENDENCY]:
    "A required dependency is missing. Please complete the setup first.",
  [ERROR_CODES.APP_LOGIC.INVALID_STATE]:
    "The operation isn't valid in the current state. Please refresh and try again.",
  [ERROR_CODES.APP_LOGIC.ACTION_NOT_ALLOWED]:
    "This action is not allowed with your current permissions.",
};

export function getMessageForCode(code: string, fallback?: string): string {
  return MESSAGE_MAP[code] ?? fallback ?? "An unexpected error occurred.";
}

export function getRetrySuggestion(code: string): string | undefined {
  switch (code) {
    case ERROR_CODES.API.TIMEOUT:
    case ERROR_CODES.API.SERVICE_UNAVAILABLE:
    case ERROR_CODES.API.RATE_LIMITED:
    case ERROR_CODES.API.INTERNAL_ERROR:
      return "Wait a few seconds and try again.";
    default:
      return undefined;
  }
}
