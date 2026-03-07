/**
 * LifeOps client-side validation library.
 */

export type { ValidationSchema, ValidationResult, FieldSchema, ValidationRule, RuleType } from "./types";
export { validateForm, mergeValidationErrors } from "./validate";
export type { ValidationError } from "@/lib/errors/types";
