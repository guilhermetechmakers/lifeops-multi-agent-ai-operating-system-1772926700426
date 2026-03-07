/**
 * Client-side validation schema types for LifeOps.
 */

export type RuleType =
  | "required"
  | "string"
  | "number"
  | "email"
  | "minLength"
  | "maxLength"
  | "min"
  | "max"
  | "regex"
  | "custom";

export interface ValidationRule {
  type: RuleType;
  message?: string;
  /** For minLength, maxLength, min, max */
  value?: number;
  /** For regex */
  pattern?: RegExp;
  /** For custom: (value, data) => true | string. Return true for valid, string for error message */
  validate?: (value: unknown, data: Record<string, unknown>) => true | string;
}

export interface FieldSchema {
  rules: ValidationRule[];
  /** Optional label for error messages */
  label?: string;
}

export interface ValidationSchema {
  [field: string]: FieldSchema;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
