/**
 * EncryptionStatusBadge — memory encryption status and key lifecycle hint.
 */

import { Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface EncryptionStatusBadgeProps {
  encrypted: boolean;
  keyHint?: "active" | "rotated" | "expired" | null;
  className?: string;
}

export function EncryptionStatusBadge({
  encrypted,
  keyHint,
  className,
}: EncryptionStatusBadgeProps) {
  const Icon = encrypted ? Lock : Unlock;
  const label = encrypted
    ? keyHint === "expired"
      ? "Encrypted (key expired)"
      : keyHint === "rotated"
        ? "Encrypted (key rotated)"
        : "Encrypted"
    : "Plain";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-muted-foreground border-white/[0.03]",
        encrypted && "text-teal/90",
        className
      )}
      title={label}
    >
      <Icon className="h-3 w-3" aria-hidden />
      <span>{encrypted ? "Encrypted" : "Plain"}</span>
    </Badge>
  );
}
