/**
 * Credential link dialog: masked display, link to vault / secrets manager.
 * Never renders secrets in plaintext.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export interface CredentialLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Adapter id for context; not rendered. */
  adapterId: string | null;
  adapterName: string;
  onLinked?: (credentialsRef: string) => void;
}

const MASK = "••••••••••••";

export function CredentialLinkDialog({
  open,
  onOpenChange,
  adapterId: _adapterId,
  adapterName,
  onLinked,
}: CredentialLinkDialogProps) {
  void _adapterId;
  const [secretRef, setSecretRef] = useState("");
  const [maskedDisplay] = useState(MASK);

  const handleLink = () => {
    const ref = (secretRef ?? "").trim();
    if (ref) {
      onLinked?.(ref);
      setSecretRef("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Link credentials
          </DialogTitle>
          <DialogDescription>
            Link credentials for {adapterName}. Store secrets in your vault or secrets manager and enter the reference here. Values are never displayed in plaintext.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretRef">Credential reference (e.g. vault path)</Label>
            <Input
              id="secretRef"
              type="text"
              placeholder="vault/adapters/..."
              value={secretRef}
              onChange={(e) => setSecretRef(e.target.value)}
              className="border-white/[0.03] font-mono text-sm"
              aria-describedby="secret-masked"
            />
            <p id="secret-masked" className="text-xs text-muted-foreground">
              Stored value: {maskedDisplay}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/[0.03]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            disabled={!(secretRef ?? "").trim()}
            className="transition-transform hover:scale-[1.02]"
          >
            Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
