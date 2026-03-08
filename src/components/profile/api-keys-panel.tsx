/**
 * API Keys panel: create with scopes, list with revoke.
 * Key value shown once on create.
 */

import { useState } from "react";
import { Key, Plus, Trash2, Copy, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { ApiKeyCreateResult } from "@/types/profile";

const SCOPES = ["read", "write", "admin", "billing"] as const;

export function ApiKeysPanel() {
  const { items: keys, isLoading } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const [newKeyResult, setNewKeyResult] = useState<ApiKeyCreateResult | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScopes, setNewScopes] = useState<string[]>([]);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const safeKeys = keys ?? [];

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }
    createKey.mutate(
      { name: newName.trim(), scopes: newScopes.length > 0 ? newScopes : ["read"] },
      {
        onSuccess: (data) => {
          setNewKeyResult(data ?? null);
          setNewName("");
          setNewScopes([]);
          setCreateOpen(false);
        },
      }
    );
  };

  const copyKey = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const closeNewKeyResult = () => setNewKeyResult(null);

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Create and revoke API keys. Copy new keys immediately — they won&apos;t be shown again.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            Create key
          </Button>
        </CardHeader>
        <CardContent>
          {safeKeys.length > 0 ? (
            <ul className="space-y-3">
              {(safeKeys ?? []).map((key) => (
                <li
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{key.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {key.keyPreview ?? key.keyHash}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {(key.scopes ?? []).map((s) => (
                        <span
                          key={s}
                          className="rounded bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                        {key.lastUsedAt && ` · Last used ${formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })}`}
                      </span>
                    </div>
                  </div>
                  {key.revocable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setRevokeId(key.id)}
                      aria-label={`Revoke ${key.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No API keys yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create an API key to access LifeOps programmatically
              </p>
              <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Create key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create key modal */}
      {createOpen && (
        <Card className="border-white/[0.03] bg-card animate-fade-in-up">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New API key</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Development"
                className="bg-input border-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="flex flex-wrap gap-3">
                {SCOPES.map((scope) => (
                  <label key={scope} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={newScopes.includes(scope)}
                      onCheckedChange={(c) =>
                        setNewScopes((s) =>
                          c ? [...s, scope] : s.filter((x) => x !== scope)
                        )
                      }
                    />
                    <span className="text-sm">{scope}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={createKey.isPending || !newName.trim()}
            >
              {createKey.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show key once */}
      {newKeyResult && (
        <Card className="border-primary/30 bg-primary/5 animate-fade-in-up">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Key created — copy it now</CardTitle>
            <Button variant="ghost" size="sm" onClick={closeNewKeyResult}>
              Done
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Input
                readOnly
                value={newKeyResult.key}
                className="font-mono text-sm bg-background"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyKey(newKeyResult.key)}
                aria-label="Copy key"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This is the only time you&apos;ll see this key. Store it securely.
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
            <AlertDialogDescription>
              Applications using this key will stop working. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokeId) {
                  revokeKey.mutate(revokeId);
                  setRevokeId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
