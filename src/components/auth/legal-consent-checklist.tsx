import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ValidationMessage } from "./validation-message";
import { cn } from "@/lib/utils";

const TERMS_URL = "/docs#terms";
const PRIVACY_URL = "/docs#privacy";

export interface LegalConsentChecklistProps {
  name?: string;
  className?: string;
}

export function LegalConsentChecklist({
  name = "acceptTerms",
  className,
}: LegalConsentChecklistProps) {
  const form = useFormContext();
  const error = form.formState.errors[name];

  return (
    <div className={cn("space-y-2", className)}>
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => (
          <div className="flex items-start space-x-2">
            <Checkbox
              id="auth-acceptTerms"
              aria-describedby={error ? "auth-terms-error" : "auth-terms-desc"}
              aria-invalid={Boolean(error)}
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              className="mt-0.5"
            />
            <Label
              htmlFor="auth-acceptTerms"
              id="auth-terms-desc"
              className="text-sm font-normal cursor-pointer leading-tight text-muted-foreground"
            >
              I agree to the{" "}
              <a
                href={TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href={PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Privacy Policy
              </a>
            </Label>
          </div>
        )}
      />
      <ValidationMessage
        id="auth-terms-error"
        message={error?.message as string | undefined}
      />
    </div>
  );
}
