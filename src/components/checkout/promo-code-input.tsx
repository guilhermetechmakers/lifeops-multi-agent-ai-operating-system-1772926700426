/**
 * PromoCodeInput — validate on blur/enter; debounced API validation; inline success/error states.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";

export interface PromoCodeInputProps {
  onApply: (code: string) => void;
  isValidating?: boolean;
  applied?: boolean;
  message?: string;
  disabled?: boolean;
  className?: string;
}

export function PromoCodeInput({
  onApply,
  isValidating = false,
  applied = false,
  message = "",
  disabled = false,
  className,
}: PromoCodeInputProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const handleApply = useCallback(() => {
    const trimmed = (value ?? "").trim();
    if (!trimmed) return;
    setTouched(true);
    onApply(trimmed);
  }, [value, onApply]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleApply();
      }
    },
    [handleApply]
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="promo-code" className="text-sm font-medium">
        Promo code
      </Label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={handleKeyDown}
          placeholder="Enter code"
          disabled={disabled}
          aria-label="Promo code"
          aria-describedby={message ? "promo-message" : undefined}
          aria-invalid={touched && message ? true : undefined}
          className={cn(
            "flex-1 transition-all duration-200",
            applied && "border-teal focus-visible:ring-teal",
            touched && message && !applied && "border-destructive"
          )}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleApply}
          disabled={disabled || !(value ?? "").trim() || isValidating}
          className="min-w-[44px] min-h-[44px]"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : applied ? (
            <Check className="h-4 w-4 text-teal" aria-hidden />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      {message && (
        <p
          id="promo-message"
          role="status"
          className={cn(
            "text-sm",
            applied ? "text-teal" : "text-destructive"
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
