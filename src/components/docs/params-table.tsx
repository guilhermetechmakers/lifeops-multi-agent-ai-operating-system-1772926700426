import { cn } from "@/lib/utils";
import type { Param } from "@/types/docs";

export interface ParamsTableProps {
  params: Param[];
  className?: string;
}

export function ParamsTable({ params, className }: ParamsTableProps) {
  const list = Array.isArray(params) ? params : [];
  if (list.length === 0) return null;

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-white/[0.06]", className)}>
      <table className="w-full text-sm" role="table" aria-label="Parameters">
        <thead>
          <tr className="border-b border-white/[0.06] bg-secondary/30">
            <th className="px-4 py-2 text-left font-medium text-foreground">Name</th>
            <th className="px-4 py-2 text-left font-medium text-foreground">In</th>
            <th className="px-4 py-2 text-left font-medium text-foreground">Type</th>
            <th className="px-4 py-2 text-left font-medium text-foreground">Required</th>
            <th className="px-4 py-2 text-left font-medium text-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p, i) => (
            <tr
              key={`${p.name}-${p.in}-${i}`}
              className="border-b border-white/[0.03] last:border-0 hover:bg-secondary/20 transition-colors duration-120"
            >
              <td className="px-4 py-2 font-mono text-teal">{p.name}</td>
              <td className="px-4 py-2 text-muted-foreground">{p.in}</td>
              <td className="px-4 py-2 text-muted-foreground">{p.type}</td>
              <td className="px-4 py-2">{p.required ? "Yes" : "No"}</td>
              <td className="px-4 py-2 text-muted-foreground">{p.description ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
