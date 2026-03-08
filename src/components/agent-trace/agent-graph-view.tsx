/**
 * AgentGraphView — force/directed graph of agents and messages.
 * Zoom/pan, node hover, selection, tooltips. SVG-based.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Agent, Message } from "@/types/agent-trace";

const NODE_R = 28;
const LAYOUT_R = 180;

function placeAgentsInCircle(agents: Agent[]): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  const n = agents.length;
  agents.forEach((a, i) => {
    const angle = (2 * Math.PI * i) / (n || 1) - Math.PI / 2;
    map.set(a.id, { x: LAYOUT_R * Math.cos(angle), y: LAYOUT_R * Math.sin(angle) });
  });
  return map;
}

export interface AgentGraphViewProps {
  agents: Agent[];
  messages: Message[];
  selectedAgentId?: string | null;
  activeStepAgentId?: string | null;
  onSelectAgent?: (agentId: string | null) => void;
  className?: string;
}

export function AgentGraphView({
  agents,
  messages,
  selectedAgentId,
  activeStepAgentId,
  onSelectAgent,
  className,
}: AgentGraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [hoverAgentId, setHoverAgentId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const positions = useMemo(() => placeAgentsInCircle(agents), [agents]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform((t) => ({
        ...t,
        scale: Math.max(0.3, Math.min(2, t.scale * factor)),
      }));
    },
    []
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && e.target === e.currentTarget) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    }
  }, [transform.x, transform.y]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setTransform((t) => ({
          ...t,
          x: panStart.current.tx + e.clientX - panStart.current.x,
          y: panStart.current.ty + e.clientY - panStart.current.y,
        }));
      }
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => setIsPanning(false), []);
  const handleMouseLeave = useCallback(() => setIsPanning(false), []);

  const messageTypeColor = (type: string) => {
    switch (type) {
      case "handoff": return "stroke-teal";
      case "negotiation": return "stroke-amber";
      case "alert": return "stroke-destructive";
      default: return "stroke-muted-foreground/50";
    }
  };

  const safeAgents = agents ?? [];
  const safeMessages = messages ?? [];

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg border border-white/[0.03] bg-card", className)}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ touchAction: "none" }}
      role="img"
      aria-label="Agent conversation graph"
    >
      <svg
        ref={svgRef}
        viewBox="-250 -250 500 500"
        className="w-full h-full min-h-[320px] cursor-grab active:cursor-grabbing"
        style={{ userSelect: "none" }}
      >
        <g
          transform={`translate(250, 250) translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
        >
          {/* Edges */}
          {safeMessages.map((msg) => {
            const from = positions.get(msg.fromAgentId);
            const to = positions.get(msg.toAgentId);
            if (!from || !to) return null;
            return (
              <line
                key={msg.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={cn("stroke-[2] fill-none opacity-70", messageTypeColor(msg.type))}
                strokeWidth={1.5}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
              className="fill-muted-foreground"
            >
              <polygon points="0 0, 8 3, 0 6" />
            </marker>
          </defs>
          {/* Nodes */}
          {safeAgents.map((agent) => {
            const pos = positions.get(agent.id);
            if (!pos) return null;
            const isSelected = selectedAgentId === agent.id;
            const isActive = activeStepAgentId === agent.id;
            const isHover = hoverAgentId === agent.id;
            return (
              <g
                key={agent.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAgent?.(agent.id);
                }}
                onMouseEnter={() => setHoverAgentId(agent.id)}
                onMouseLeave={() => setHoverAgentId(null)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Agent ${agent.name}, ${agent.type}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectAgent?.(agent.id);
                  }
                }}
              >
                <circle
                  r={NODE_R}
                  className={cn(
                    "fill-secondary stroke-2 transition-all duration-200",
                    isSelected && "stroke-primary ring-2 ring-primary/30",
                    isActive && "stroke-teal",
                    (isHover || isSelected) && "stroke-white/20"
                  )}
                  strokeWidth={2}
                />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  className="fill-foreground text-xs font-medium"
                >
                  {agent.name.slice(0, 8)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      {/* Tooltip */}
      {hoverAgentId && (() => {
        const agent = safeAgents.find((a) => a.id === hoverAgentId);
        if (!agent) return null;
        const msgCount = safeMessages.filter(
          (m) => m.fromAgentId === agent.id || m.toAgentId === agent.id
        ).length;
        return (
          <div
            className="absolute pointer-events-none z-10 rounded-md border border-white/[0.03] bg-secondary px-3 py-2 text-xs text-foreground shadow-lg"
            style={{ left: "50%", top: "8px", transform: "translateX(-50%)" }}
            role="tooltip"
          >
            <div className="font-medium">{agent.name}</div>
            <div className="text-muted-foreground">{agent.type} · {msgCount} messages</div>
          </div>
        );
      })()}
    </div>
  );
}
