/**
 * AddressFields — billing address inputs with validation and labels.
 */

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BillingAddress } from "@/types/checkout";

export interface AddressFieldsProps {
  value: BillingAddress | null;
  onChange: (address: BillingAddress) => void;
  errors?: Partial<Record<keyof BillingAddress, string>>;
  disabled?: boolean;
  className?: string;
}

const defaultAddress: BillingAddress = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

export function AddressFields({
  value,
  onChange,
  errors = {},
  disabled = false,
  className,
}: AddressFieldsProps) {
  const addr = value ?? defaultAddress;

  const update = useCallback(
    (field: keyof BillingAddress, val: string) => {
      onChange({ ...addr, [field]: val });
    },
    [addr, onChange]
  );

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div className="sm:col-span-2">
        <Label htmlFor="billing-line1">Address line 1</Label>
        <Input
          id="billing-line1"
          value={addr.line1 ?? ""}
          onChange={(e) => update("line1", e.target.value)}
          placeholder="Street address"
          disabled={disabled}
          aria-invalid={!!errors?.line1}
          aria-describedby={errors?.line1 ? "err-line1" : undefined}
          className="mt-1"
        />
        {errors?.line1 && (
          <p id="err-line1" className="mt-1 text-sm text-destructive" role="alert">
            {errors.line1}
          </p>
        )}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="billing-line2">Address line 2 (optional)</Label>
        <Input
          id="billing-line2"
          value={addr.line2 ?? ""}
          onChange={(e) => update("line2", e.target.value)}
          placeholder="Apt, suite, etc."
          disabled={disabled}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="billing-city">City</Label>
        <Input
          id="billing-city"
          value={addr.city ?? ""}
          onChange={(e) => update("city", e.target.value)}
          disabled={disabled}
          aria-invalid={!!errors?.city}
          className="mt-1"
        />
        {errors?.city && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.city}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="billing-state">State / Province</Label>
        <Input
          id="billing-state"
          value={addr.state ?? ""}
          onChange={(e) => update("state", e.target.value)}
          disabled={disabled}
          aria-invalid={!!errors?.state}
          className="mt-1"
        />
        {errors?.state && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.state}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="billing-postal">Postal code</Label>
        <Input
          id="billing-postal"
          value={addr.postalCode ?? ""}
          onChange={(e) => update("postalCode", e.target.value)}
          disabled={disabled}
          aria-invalid={!!errors?.postalCode}
          className="mt-1"
        />
        {errors?.postalCode && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.postalCode}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="billing-country">Country</Label>
        <Input
          id="billing-country"
          value={addr.country ?? ""}
          onChange={(e) => update("country", e.target.value)}
          disabled={disabled}
          className="mt-1"
        />
      </div>
    </div>
  );
}
