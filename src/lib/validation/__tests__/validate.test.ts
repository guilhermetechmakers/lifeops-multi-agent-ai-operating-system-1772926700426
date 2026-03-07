/**
 * Unit tests for validateForm.
 * Run with: npx vitest run src/lib/validation/__tests__/validate.test.ts
 * (Requires vitest to be added to the project.)
 */

import { describe, it, expect } from "vitest";
import { validateForm } from "../validate";
import type { ValidationSchema } from "../types";

describe("validateForm", () => {
  const schema: ValidationSchema = {
    email: {
      rules: [
        { type: "required", message: "Email is required" },
        { type: "email", message: "Invalid email" },
      ],
    },
    name: {
      rules: [
        { type: "required", message: "Name is required" },
        { type: "minLength", value: 2, message: "Min 2 characters" },
      ],
    },
  };

  it("returns isValid true when data passes all rules", () => {
    const result = validateForm(schema, {
      email: "user@example.com",
      name: "Jane",
    });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("returns per-field errors when validation fails", () => {
    const result = validateForm(schema, {
      email: "",
      name: "A",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("Email is required");
    expect(result.errors.name).toBe("Min 2 characters");
  });

  it("validates email format", () => {
    const result = validateForm(schema, {
      email: "not-an-email",
      name: "Jane",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("Invalid email");
  });
});
