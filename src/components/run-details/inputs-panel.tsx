/**
 * InputsPanel — bound inputs, effective inputs, scope, permissions. Collapsible; JSON with copy.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputsPanelProps {
  inputs?: unknown;
  effectiveInputs?: unknown;
  scope?: string[];
  permissions?: string[];
  className?: string;
}

function JsonBlock({ value, label }: { value: unknown; label: string }) {
  const [copied, setCopied] = useState(false);
  const str =
    value === undefined || value === null
      ? "—"
      : JSON.stringify(value, null, 2);

  const copy = () => {
    void navigator.clipboard.writeText(str).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={copy}
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          Copy
        </Button>
      </div>
      <pre className="max-h-48 overflow-auto rounded-md border border-white/[0.06] bg-secondary/30 p-3 font-mono text-xs text-foreground">
        {str}
      </pre>
    </div>
  );
}

export function InputsPanel({
  inputs,
  effectiveInputs,
  scope = [],
  permissions = [],
  className,
}: InputsPanelProps) {
  const [open, setOpen] = useState(true);
  const hasInputs =
    inputs !== undefined ||
    effectiveInputs !== undefined ||
    (scope?.length ?? 0) > 0 ||
    (permissions?.length ?? 0) > 0;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="cursor-pointer select-none p-4 md:p-5" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            Inputs & Context
          </CardTitle>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="border-t border-white/[0.03] pt-4">
          {!hasInputs ? (
            <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
              No input payload or context recorded for this run. If this run used template variables, they would appear here after binding.
            </p>
          ) : (
            <div className="space-y-4">
              {inputs !== undefined && (
                <JsonBlock value={inputs} label="Original input (template / bound variables)" />
              )}
              {effectiveInputs !== undefined && (
                <JsonBlock value={effectiveInputs} label="Effective input used for this run" />
              )}
              {Array.isArray(scope) && scope.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Scope</span>
                  <p className="font-mono text-xs text-foreground">
                    {(scope ?? []).join(", ") || "—"}
                  </p>
                </div>
              )}
              {Array.isArray(permissions) && permissions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Permissions</span>
                  <p className="font-mono text-xs text-foreground">
                    {(permissions ?? []).join(", ") || "—"}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
