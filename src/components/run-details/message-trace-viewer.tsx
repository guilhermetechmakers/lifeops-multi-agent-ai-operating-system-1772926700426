/**
 * MessageTraceViewer — timeline of agent-to-agent messages; search/filter; expandable payload.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TraceEvent } from "@/types/run-details";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

function TraceRow({
  event,
  isExpanded,
  onToggle,
}: {
  event: TraceEvent;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const payload = event.fullPayload ?? event.payloadExcerpt;

  return (
    <div className="rounded-md border border-white/[0.06] bg-secondary/20 transition-colors hover:bg-secondary/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-2 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {isExpanded ? (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono text-muted-foreground">{formatTime(event.timestamp)}</span>
            <span className="font-medium text-foreground">{event.sender}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium text-foreground">{event.receiver}</span>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
              {event.type}
            </span>
            {event.outcome != null && (
              <span className="text-xs text-muted-foreground">({event.outcome})</span>
            )}
          </div>
          {event.payloadExcerpt != null && !isExpanded && (
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              {event.payloadExcerpt}
            </p>
          )}
        </div>
      </button>
      {isExpanded && payload != null && (
        <div className="border-t border-white/[0.06] px-3 pb-3 pt-1">
          <pre className="max-h-40 overflow-auto rounded bg-background/80 p-2 font-mono text-xs text-foreground">
            {typeof payload === "string"
              ? payload
              : JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export interface MessageTraceViewerProps {
  trace: TraceEvent[];
  className?: string;
}

export function MessageTraceViewer({ trace, className }: MessageTraceViewerProps) {
  const [search, setSearch] = useState("");
  const [filterSender, setFilterSender] = useState("");
  const [filterReceiver, setFilterReceiver] = useState("");
  const [filterType, setFilterType] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const events = useMemo(() => {
    const list = Array.isArray(trace) ? trace : [];
    return list.filter((e) => {
      const s = (search ?? "").toLowerCase();
      if (s) {
        const match =
          (e.sender ?? "").toLowerCase().includes(s) ||
          (e.receiver ?? "").toLowerCase().includes(s) ||
          (e.type ?? "").toLowerCase().includes(s) ||
          (e.payloadExcerpt ?? "").toLowerCase().includes(s);
        if (!match) return false;
      }
      if (filterSender && (e.sender ?? "") !== filterSender) return false;
      if (filterReceiver && (e.receiver ?? "") !== filterReceiver) return false;
      if (filterType && (e.type ?? "") !== filterType) return false;
      return true;
    });
  }, [trace, search, filterSender, filterReceiver, filterType]);

  const senders = useMemo(() => {
    const list = Array.isArray(trace) ? trace : [];
    return [...new Set(list.map((e) => e.sender).filter(Boolean))].sort();
  }, [trace]);
  const receivers = useMemo(() => {
    const list = Array.isArray(trace) ? trace : [];
    return [...new Set(list.map((e) => e.receiver).filter(Boolean))].sort();
  }, [trace]);
  const types = useMemo(() => {
    const list = Array.isArray(trace) ? trace : [];
    return [...new Set(list.map((e) => e.type).filter(Boolean))].sort();
  }, [trace]);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <CardTitle className="text-base">Agent-to-Agent Message Trace</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search trace…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
              aria-label="Search messages"
            />
          </div>
          <select
            value={filterSender}
            onChange={(e) => setFilterSender(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by sender"
          >
            <option value="">All senders</option>
            {senders.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterReceiver}
            onChange={(e) => setFilterReceiver(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by receiver"
          >
            <option value="">All receivers</option>
            {receivers.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {(events ?? []).length === 0 ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No message trace events. Agent handoffs and negotiations will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {(events ?? []).map((event) => (
              <li key={event.id}>
                <TraceRow
                  event={event}
                  isExpanded={expandedId === event.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === event.id ? null : event.id))
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
