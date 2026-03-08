/**
 * CardInput — PCI-friendly card entry placeholder.
 * In production, replace with tokenization/hosted fields (Stripe Elements, etc.).
 * No raw card data stored; only token/paymentMethodId used.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";

export interface CardInputProps {
  onTokenReady?: (tokenOrPaymentMethodId: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Client-side we never persist raw card number/CVC.
 * This component simulates masked input; real implementation would use
 * Stripe Elements or similar to get a paymentMethodId only.
 */
export function CardInput({
  onTokenReady,
  onValidationChange,
  error,
  disabled = false,
  className,
}: CardInputProps) {
  const [cardDisplay, setCardDisplay] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [postal, setPostal] = useState("");

  const validate = useCallback(() => {
    const cardOk = (cardDisplay ?? "").replace(/\s/g, "").length >= 15;
    const expOk = /^\d{2}\/\d{2}$/.test((expiry ?? "").trim());
    const cvcOk = (cvc ?? "").trim().length >= 3;
    const postalOk = (postal ?? "").trim().length >= 3;
    const valid = cardOk && expOk && cvcOk && postalOk;
    onValidationChange?.(valid);
    if (valid) onTokenReady?.("pm_mock_" + Date.now());
  }, [cardDisplay, expiry, cvc, postal, onTokenReady, onValidationChange]);

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 19);
    const groups = digits.match(/.{1,4}/g) ?? [];
    return groups.join(" ").trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2)
      return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label htmlFor="card-number">Card number</Label>
        <div className="relative mt-1">
          <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="card-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            value={cardDisplay}
            onChange={(e) => setCardDisplay(formatCard(e.target.value))}
            onBlur={validate}
            disabled={disabled}
            aria-invalid={!!error}
            className="pl-10"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="card-expiry">Expiry</Label>
          <Input
            id="card-expiry"
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            onBlur={validate}
            disabled={disabled}
            aria-invalid={!!error}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="card-cvc">CVC</Label>
          <Input
            id="card-cvc"
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onBlur={validate}
            disabled={disabled}
            aria-invalid={!!error}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="card-postal">Postal code</Label>
        <Input
          id="card-postal"
          type="text"
          autoComplete="postal-code"
          value={postal}
          onChange={(e) => setPostal(e.target.value)}
          onBlur={validate}
          disabled={disabled}
          className="mt-1"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Card details are tokenized and never stored. Secure payment processing.
      </p>
    </div>
  );
}
