/**
 * PaymentMethodSection — choose saved method or add new; tokenization handling and error states.
 * No plaintext card data stored.
 */

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardInput } from "@/components/checkout/card-input";
import type { SavedPaymentMethod } from "@/types/checkout";

export interface PaymentMethodSectionProps {
  savedMethods: SavedPaymentMethod[];
  selectedMethodId: string;
  onSelectMethod: (id: string) => void;
  onNewMethodReady: (paymentMethodId: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function PaymentMethodSection({
  savedMethods,
  selectedMethodId,
  onSelectMethod,
  onNewMethodReady,
  error = "",
  disabled = false,
  className,
}: PaymentMethodSectionProps) {
  const [showNewCard, setShowNewCard] = useState(false);
  const safeMethods = Array.isArray(savedMethods) ? savedMethods : [];

  const handleTokenReady = useCallback(
    (tokenOrPmId: string) => {
      onNewMethodReady(tokenOrPmId);
      setShowNewCard(false);
    },
    [onNewMethodReady]
  );

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">Payment method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeMethods.length > 0 && !showNewCard && (
          <div
            role="radiogroup"
            aria-label="Saved payment methods"
            className="space-y-2"
          >
            {safeMethods.map((method) => {
              const isSelected = selectedMethodId === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onSelectMethod(method.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 min-h-[44px]",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-white/[0.06] hover:border-white/10"
                  )}
                  aria-pressed={isSelected}
                  disabled={disabled}
                >
                  <span className="font-medium">
                    {method.brand} •••• {method.last4}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Exp {method.expMonth}/{method.expYear}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {showNewCard ? (
          <div className="space-y-2">
            <CardInput
              onTokenReady={handleTokenReady}
              error={error}
              disabled={disabled}
            />
            {safeMethods.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNewCard(false)}
              >
                Use saved card
              </Button>
            )}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowNewCard(true)}
            disabled={disabled}
            className="min-h-[44px]"
          >
            {safeMethods.length > 0 ? "Add new card" : "Enter card details"}
          </Button>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
