/**
 * CiCdConnectorsManager — configure connectors, credentials, tokens; rotation and validation.
 */

import { Key, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Connector } from "@/types/integrations";

export interface CiCdConnectorsManagerProps {
  connectors: Connector[];
  onValidate?: (connectorId: string) => void;
  onRotateToken?: (connectorId: string) => void;
  className?: string;
}

export function CiCdConnectorsManager({
  connectors = [],
  onValidate,
  onRotateToken,
  className,
}: CiCdConnectorsManagerProps) {
  const list = Array.isArray(connectors) ? connectors : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Key className="h-5 w-5 text-muted-foreground" />
          CI/CD Connectors
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Tokens and credentials are stored securely. Never exposed in UI.
        </p>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No connectors configured.
          </p>
        ) : (
          <div className="space-y-2">
            {(list as Connector[]).map((conn) => (
              <div
                key={conn.id}
                className="flex items-center justify-between gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-medium">{conn.provider}</span>
                  <span className="text-xs text-muted-foreground">
                    Token: ••••••••
                  </span>
                </div>
                <div className="flex gap-1">
                  {onValidate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onValidate(conn.id)}
                      aria-label={`Validate ${conn.provider} token`}
                    >
                      Validate
                    </Button>
                  )}
                  {onRotateToken && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onRotateToken(conn.id)}
                      aria-label={`Rotate ${conn.provider} token`}
                    >
                      Rotate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
