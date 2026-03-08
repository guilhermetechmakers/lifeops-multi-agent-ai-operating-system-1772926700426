/**
 * ScopedMemoryInspector — key/value store with encryption indicators, scope filter,
 * redact controls, export/import memory snapshots.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { Search, Eye, EyeOff, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EncryptionStatusBadge } from "./encryption-status-badge";
import type { MemoryScope, MemoryEntry } from "@/types/agent-trace";

export interface ScopedMemoryInspectorProps {
  scopes: MemoryScope[];
  entries: MemoryEntry[];
  selectedScopeId?: string | null;
  onScopeChange?: (scopeId: string) => void;
  onImportSnapshot?: (snapshot: { scopes: MemoryScope[]; entries: MemoryEntry[] }) => void;
  runId?: string;
  className?: string;
}

function safeStringify(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "—";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function ScopedMemoryInspector({
  scopes,
  entries,
  selectedScopeId,
  onScopeChange,
  onImportSnapshot,
  runId,
  className,
}: ScopedMemoryInspectorProps) {
  const [search, setSearch] = useState("");
  const [revealSensitive, setRevealSensitive] = useState(false);
  const [redactedKeys, setRedactedKeys] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeScopes = scopes ?? [];
  const safeEntries = entries ?? [];

  const scopeId = selectedScopeId ?? (safeScopes[0]?.id ?? null);
  const filteredEntries = useMemo(() => {
    let list = scopeId
      ? safeEntries.filter((e) => e.scopeId === scopeId)
      : safeEntries;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((e) => e.key.toLowerCase().includes(q));
    return list;
  }, [scopeId, safeEntries, search]);

  const currentScope = safeScopes.find((s) => s.id === scopeId);

  const handleExport = useCallback(() => {
    const snapshot = {
      scopes: safeScopes,
      entries: safeEntries.map((e) => ({
        ...e,
        value: redactedKeys.has(e.id) ? "••••••" : e.value,
      })),
      exportedAt: new Date().toISOString(),
      runId,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-snapshot-${runId ?? "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [safeScopes, safeEntries, redactedKeys, runId]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImportSnapshot) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          const scopes = Array.isArray(data?.scopes) ? data.scopes : [];
          const entries = Array.isArray(data?.entries) ? data.entries : [];
          onImportSnapshot({ scopes, entries });
        } catch {
          // ignore invalid JSON
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [onImportSnapshot]
  );

  const toggleRedact = useCallback((entryId: string) => {
    setRedactedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  }, []);

  return (
    <Card className={cn("rounded-lg border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">Scoped Memory</CardTitle>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setRevealSensitive(!revealSensitive)}
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title={revealSensitive ? "Mask sensitive values" : "Reveal sensitive values"}
              aria-label={revealSensitive ? "Mask sensitive values" : "Reveal sensitive values"}
            >
              {revealSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleExport}
              aria-label="Export memory snapshot"
            >
              <Download className="h-4 w-4" />
            </Button>
            {onImportSnapshot && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                  aria-hidden
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleImportClick}
                  aria-label="Import memory snapshot"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {safeScopes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onScopeChange?.(s.id)}
              className={cn(
                "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                s.id === scopeId
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-white/[0.03] bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {s.scope} · {s.agentId.slice(0, 8)}
            </button>
          ))}
        </div>
        {currentScope && (
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <EncryptionStatusBadge encrypted={currentScope.encrypted} />
            {currentScope.ttl != null && (
              <span className="text-[10px] text-muted-foreground" title="TTL (seconds)">
                TTL: {currentScope.ttl}s
              </span>
            )}
            {currentScope.governance != null && Object.keys(currentScope.governance).length > 0 && (
              <span className="text-[10px] text-muted-foreground" title="Governance rules">
                Governance: {Object.keys(currentScope.governance).length} rules
              </span>
            )}
          </div>
        )}
        <div className="relative pt-2">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 bg-secondary border-white/[0.03]"
            aria-label="Filter memory entries by key"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-[240px] rounded-md border border-white/[0.03] bg-secondary/30">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-secondary/90 text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3 font-medium">Key</th>
                <th className="text-left py-2 px-3 font-medium">Value</th>
                <th className="text-left py-2 px-3 font-medium w-24">Time</th>
                <th className="text-left py-2 px-3 font-medium w-16">Redact</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">
                    No entries in this scope
                  </td>
                </tr>
              ) : (
                (filteredEntries ?? []).map((entry) => {
                  const isRedacted = redactedKeys.has(entry.id);
                  const displayValue =
                    isRedacted || (entry.encrypted && !revealSensitive)
                      ? "••••••"
                      : safeStringify(entry.value);
                  return (
                    <tr
                      key={entry.id}
                      className="border-t border-white/[0.03] hover:bg-white/[0.02]"
                    >
                      <td className="py-2 px-3 font-mono text-xs">{entry.key}</td>
                      <td className="py-2 px-3 text-muted-foreground break-all max-w-[200px]">
                        {displayValue}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground text-xs">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : "—"}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          onClick={() => toggleRedact(entry.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                          title={isRedacted ? "Reveal value" : "Redact value"}
                          aria-label={isRedacted ? "Reveal value" : "Redact value"}
                        >
                          {isRedacted ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
