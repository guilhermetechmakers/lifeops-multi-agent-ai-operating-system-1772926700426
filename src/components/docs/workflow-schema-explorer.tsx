import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDocsWorkflowSchema } from "@/api/docs";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Field, WorkflowSchema } from "@/types/docs";

function SchemaFieldNode({
  field,
  depth = 0,
}: {
  field: Field;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = Array.isArray(field?.children) && (field.children ?? []).length > 0;

  return (
    <div className="select-none" style={{ paddingLeft: depth * 16 }}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors duration-120",
          "hover:bg-secondary/50 focus:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        )}
        onClick={() => hasChildren && setOpen((o) => !o)}
        aria-expanded={hasChildren ? open : undefined}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          )
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="font-mono text-teal">{field?.name ?? ""}</span>
        <span className="text-muted-foreground text-xs">{field?.type ?? ""}</span>
        {field?.required && (
          <span className="text-amber text-xs">required</span>
        )}
      </button>
      {field?.description && (
        <p className="text-xs text-muted-foreground pl-6 pr-2 pb-1" style={{ paddingLeft: depth * 16 + 24 }}>
          {field.description}
        </p>
      )}
      {hasChildren && open && (
        <div className="border-l border-white/[0.06] ml-2">
          {(field.children ?? []).map((child, i) => (
            <SchemaFieldNode key={`${child?.name}-${i}`} field={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkflowSchemaExplorer() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["docs", "workflow-schema"],
    queryFn: () => fetchDocsWorkflowSchema(),
  });

  const schema: WorkflowSchema | null = data?.data ?? null;
  const fields = schema?.fields ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-secondary" />
        <div className="h-64 animate-pulse rounded-lg bg-secondary" />
      </div>
    );
  }

  if (isError || !schema) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Failed to load workflow schema.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Workflow schema reference</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Schema fields, types, and validation rules for workflows.
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.03] bg-card overflow-hidden">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <h2 className="font-medium text-foreground">{schema.name ?? "Workflow"}</h2>
          {Array.isArray(schema.relationships) && schema.relationships.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Related: {schema.relationships.join(", ")}
            </p>
          )}
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto" role="tree" aria-label="Schema fields">
          {fields.map((f, i) => (
            <SchemaFieldNode key={`${f?.name}-${i}`} field={f} />
          ))}
        </div>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No schema fields defined.</p>
      )}
    </div>
  );
}
