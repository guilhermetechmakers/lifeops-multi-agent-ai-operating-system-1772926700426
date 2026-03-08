/**
 * MessageTraceGraph — node-link diagram of agent-to-agent messages.
 * Supports zoom/pan, filtering by agent or message type.
 */

import { useCallback, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TraceEvent } from "@/types/run-details";

const NODE_RADIUS = 24;
const NODE_GAP = 80;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.2;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export interface MessageTraceGraphProps {
  trace: TraceEvent[];
  selectedAgentId?: string | null;
  onSelectAgent?: (agentId: string | null) => void;
  className?: string;
}

export function MessageTraceGraph({
  trace,
  selectedAgentId,
  onSelectAgent,
  className,
}: MessageTraceGraphProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const events = useMemo(() => {
    const list = Array.isArray(trace) ? trace : [];
    return list.filter((e) => {
      const s = (search ?? "").toLowerCase();
      if (s) {
        const match =
          (e.sender ?? "").toLowerCase().includes(s) ||
          (e.receiver ?? "").toLowerCase().includes(s) ||
          (e.type ?? "").toLowerCase().includes(s);
        if (!match) return false;
      }
      if (filterType && (e.type ?? "") !== filterType) return false;
      return true;
    });
  }, [trace, search, filterType]);

  const agents = useMemo(() => {
    const set = new Set<string>();
    (events ?? []).forEach((e) => {
      if (e.sender) set.add(e.sender);
      if (e.receiver) set.add(e.receiver);
    });
    return [...set].sort();
  }, [events]);

  const types = useMemo(() => {
    const set = new Set<string>();
    (events ?? []).forEach((e) => {
      if (e.type) set.add(e.type);
    });
    return [...set].sort();
  }, [events]);

  const layout = useMemo(() => {
    const agentPos: Record<string, { x: number; y: number }> = {};
    agents.forEach((a, i) => {
      agentPos[a] = {
        x: 100 + (i % 3) * (NODE_GAP * 2.5),
        y: 80 + Math.floor(i / 3) * (NODE_GAP * 2),
      };
    });

    const messagePositions: Array<{
      event: TraceEvent;
      x: number;
      y: number;
      from: { x: number; y: number };
      to: { x: number; y: number };
    }> = [];
    (events ?? []).forEach((e, i) => {
      const from = agentPos[e.sender] ?? { x: 50, y: 50 };
      const to = agentPos[e.receiver] ?? { x: 150, y: 50 };
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      messagePositions.push({
        event: e,
        x: midX,
        y: midY + (i % 2) * 30,
        from,
        to,
      });
    });

    return { agentPos, messagePositions };
  }, [agents, events]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      }
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const svgWidth = 500;
  const svgHeight = Math.max(300, agents.length * 60 + 100);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <CardTitle className="text-base">Agent-to-Agent Message Graph</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
              aria-label="Search messages"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by message type"
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleZoomOut}
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Reset view"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {(events ?? []).length === 0 ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No message trace events. Agent handoffs and negotiations will
            appear here.
          </p>
        ) : (
          <div
            className="relative h-[320px] overflow-hidden rounded-md border border-white/[0.06] bg-secondary/20 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            role="img"
            aria-label="Message trace graph"
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="overflow-visible"
            >
              {/* Edges */}
              <g>
                {layout.messagePositions.map(({ event, from, to }, i) => (
                  <line
                    key={event.id + String(i)}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="rgb(var(--muted-foreground) / 0.4)"
                    strokeWidth={1.5}
                    strokeDasharray={event.type === "alert" ? "4 2" : "0"}
                  />
                ))}
              </g>
              {/* Agent nodes */}
              <g>
                {agents.map((agent) => (
                  <g
                    key={agent}
                    onClick={() => onSelectAgent?.(agent === selectedAgentId ? null : agent)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={layout.agentPos[agent]?.x ?? 0}
                      cy={layout.agentPos[agent]?.y ?? 0}
                      r={NODE_RADIUS}
                      fill={
                        agent === selectedAgentId
                          ? "rgb(var(--primary) / 0.3)"
                          : "rgb(var(--secondary) / 0.8)"
                      }
                      stroke={
                        agent === selectedAgentId
                          ? "rgb(var(--primary))"
                          : "rgb(var(--border))"
                      }
                      strokeWidth={agent === selectedAgentId ? 2 : 1}
                    />
                    <text
                      x={layout.agentPos[agent]?.x ?? 0}
                      y={(layout.agentPos[agent]?.y ?? 0) + 4}
                      textAnchor="middle"
                      className="fill-foreground text-[10px] font-medium"
                    >
                      {agent.length > 10 ? agent.slice(0, 8) + "…" : agent}
                    </text>
                  </g>
                ))}
              </g>
              {/* Message labels */}
              <g>
                {layout.messagePositions.map(({ event, x, y }, i) => (
                  <g key={event.id + "-label" + String(i)}>
                    <rect
                      x={x - 28}
                      y={y - 10}
                      width={56}
                      height={20}
                      rx={4}
                      fill="rgb(var(--card))"
                      stroke="rgb(var(--border))"
                      strokeWidth={1}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[9px]"
                    >
                      {event.type}
                    </text>
                    <title>
                      {formatTime(event.timestamp)} {event.sender} → {event.receiver}: {event.type}
                    </title>
                  </g>
                ))}
              </g>
            </svg>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
