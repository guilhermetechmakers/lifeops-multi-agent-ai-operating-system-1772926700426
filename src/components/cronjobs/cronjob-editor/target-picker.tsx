/**
 * TargetPicker: Searchable selector for Agent or Workflow Template.
 */

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchAgents, fetchWorkflows } from "@/api/agents-workflows";
import type { AgentTarget, WorkflowTarget } from "@/api/agents-workflows";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Bot, GitBranch, ChevronDown } from "lucide-react";

export interface TargetValue {
  kind: "agent" | "workflow";
  id: string;
  name: string;
}

interface TargetPickerProps {
  value: TargetValue | null;
  onChange: (v: TargetValue) => void;
  className?: string;
}

export function TargetPicker({ value, onChange, className }: TargetPickerProps) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"agent" | "workflow">(
    value?.kind ?? "agent"
  );

  useEffect(() => {
    if (value?.kind) setKind(value.kind);
  }, [value?.kind]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [agents, setAgents] = useState<AgentTarget[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTarget[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (kind === "agent") {
        const list = await fetchAgents(debouncedSearch || undefined);
        setAgents(Array.isArray(list) ? list : []);
      } else {
        const list = await fetchWorkflows(debouncedSearch || undefined);
        setWorkflows(Array.isArray(list) ? list : []);
      }
    } finally {
      setLoading(false);
    }
  }, [kind, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const items = kind === "agent" ? agents : workflows;
  const displayValue = value
    ? `${value.name} (${value.id})`
    : "Select target...";

  const handleSelect = (id: string, name: string) => {
    onChange({ kind, id, name });
    setOpen(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={kind === "agent" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setKind("agent");
            setSearch("");
          }}
          className="gap-2"
        >
          <Bot className="h-4 w-4" />
          Agent
        </Button>
        <Button
          type="button"
          variant={kind === "workflow" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setKind("workflow");
            setSearch("");
          }}
          className="gap-2"
        >
          <GitBranch className="h-4 w-4" />
          Workflow
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Target</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal bg-input border-white/[0.03]"
            >
              <span className="truncate">{displayValue}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={`Search ${kind}s...`}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {loading ? "Loading..." : `No ${kind}s found.`}
                </CommandEmpty>
                <CommandGroup>
                  {(items ?? []).map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.name} ${item.id}`}
                      onSelect={() => handleSelect(item.id, item.name)}
                    >
                      {kind === "agent" ? (
                        <Bot className="mr-2 h-4 w-4" />
                      ) : (
                        <GitBranch className="mr-2 h-4 w-4" />
                      )}
                      {item.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({item.id})
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
