/**
 * SortableRuleItem — Draggable rule row for CategorizationRulesPanel.
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategorizationRuleFull } from "@/types/finance";

export interface SortableRuleItemProps {
  rule: CategorizationRuleFull;
  onEdit?: () => void;
  onDelete: () => void;
}

export function SortableRuleItem({ rule, onDelete }: SortableRuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2",
        isDragging && "opacity-50"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm">{rule.name}</span>
        <span className="text-muted-foreground text-xs ml-2">
          “{rule.pattern}” → {rule.targetCategory}
          {rule.targetSubcategory && ` / ${rule.targetSubcategory}`}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">P{rule.priority}</span>
      <Button size="sm" variant="ghost" className="h-7" onClick={onDelete} aria-label="Delete rule">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
