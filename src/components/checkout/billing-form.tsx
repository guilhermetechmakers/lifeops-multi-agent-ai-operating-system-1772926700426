/**
 * BillingForm — CardInput, AddressFields, PromoCodeInput.
 * Validation and secure handling; no raw card data stored.
 */

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardInput } from "@/components/checkout/card-input";
import { AddressFields } from "@/components/checkout/address-fields";
import { PromoCodeInput } from "@/components/checkout/promo-code-input";
import type { BillingAddress } from "@/types/checkout";

export type BillingFormValues = BillingAddress;

export interface BillingFormProps {
  onPaymentMethodReady: (paymentMethodId: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  onAddressChange?: (address: BillingAddress) => void;
  onPromoApply: (code: string) => void;
  promoValidating?: boolean;
  promoApplied?: boolean;
  promoMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function BillingForm({
  onPaymentMethodReady,
  onValidationChange,
  onAddressChange,
  onPromoApply,
  promoValidating = false,
  promoApplied = false,
  promoMessage = "",
  disabled = false,
  className,
}: BillingFormProps) {
  const [address, setAddress] = useState<BillingAddress | null>(null);
  const [cardError, setCardError] = useState<string>("");

  const handleTokenReady = useCallback(
    (tokenOrPmId: string) => {
      onPaymentMethodReady(tokenOrPmId);
      setCardError("");
    },
    [onPaymentMethodReady]
  );

  const handleValidationChange = useCallback((isValid: boolean) => {
    setCardError(isValid ? "" : "Please complete all card fields correctly.");
    onValidationChange?.(isValid);
  }, [onValidationChange]);

  const handleAddressChange = useCallback(
    (a: BillingAddress) => {
      setAddress(a);
      onAddressChange?.(a);
    },
    [onAddressChange]
  );

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment method</CardTitle>
        </CardHeader>
        <CardContent>
          <CardInput
            onTokenReady={handleTokenReady}
            onValidationChange={handleValidationChange}
            error={cardError}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing address</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressFields
            value={address}
            onChange={handleAddressChange}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Promo code</CardTitle>
        </CardHeader>
        <CardContent>
          <PromoCodeInput
            onApply={onPromoApply}
            isValidating={promoValidating}
            applied={promoApplied}
            message={promoMessage}
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </div>
  );
}
