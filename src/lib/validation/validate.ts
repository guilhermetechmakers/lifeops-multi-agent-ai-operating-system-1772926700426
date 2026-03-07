/**
 * Client-side validation runner. Returns { isValid, errors } with per-field messages.
 */

import type { ValidationSchema, ValidationResult, FieldSchema, ValidationRule } from "./types";

export function validateForm(schema: ValidationSchema, data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const value = data[fieldName];
    const msg = runFieldRules(fieldSchema, value, data);
    if (msg) errors[fieldName] = msg;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

function runFieldRules(
  fieldSchema: FieldSchema,
  value: unknown,
  data: Record<string, unknown>
): string | undefined {
  const { rules } = fieldSchema;
  for (const rule of rules) {
    const message = runRule(rule, value, data);
    if (message) return message;
  }
  return undefined;
}

function runRule(
  rule: ValidationRule,
  value: unknown,
  data: Record<string, unknown>
): string | undefined {
  switch (rule.type) {
    case "required": {
      const empty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0);
      return empty ? (rule.message ?? "This field is required") : undefined;
    }
    case "string":
      return typeof value !== "string" ? (rule.message ?? "Must be a string") : undefined;
    case "number": {
      if (value === undefined || value === null || value === "") return undefined;
      return typeof value !== "number" || Number.isNaN(value) ? (rule.message ?? "Must be a number") : undefined;
    }
    case "email": {
      if (value === undefined || value === null || value === "") return undefined;
      const str = String(value).trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRe.test(str) ? undefined : (rule.message ?? "Please enter a valid email address");
    }
    case "minLength":
      return typeof value === "string" && rule.value !== undefined && value.length < rule.value
        ? (rule.message ?? `Must be at least ${rule.value} characters`)
        : undefined;
    case "maxLength":
      return typeof value === "string" && rule.value !== undefined && value.length > rule.value
        ? (rule.message ?? `Must be at most ${rule.value} characters`)
        : undefined;
    case "min":
      return typeof value === "number" && rule.value !== undefined && value < rule.value
        ? (rule.message ?? `Must be at least ${rule.value}`)
        : undefined;
    case "max":
      return typeof value === "number" && rule.value !== undefined && value > rule.value
        ? (rule.message ?? `Must be at most ${rule.value}`)
        : undefined;
    case "regex":
      return typeof value === "string" && rule.pattern && !rule.pattern.test(value)
        ? (rule.message ?? "Invalid format")
        : undefined;
    case "custom": {
      const result = rule.validate?.(value, data);
      if (result === true || result === undefined) return undefined;
      return typeof result === "string" ? result : (rule.message ?? "Validation failed");
    }
    default:
      return undefined;
  }
}

/**
 * Merge server-side validation errors into a single record by field name.
 */
export function mergeValidationErrors(
  clientErrors: Record<string, string>,
  serverErrors: Array<{ field: string; message: string }>
): Record<string, string> {
  const merged = { ...clientErrors };
  for (const e of serverErrors ?? []) {
    if (e?.field && e?.message) merged[e.field] = e.message;
  }
  return merged;
}
