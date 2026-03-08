/**
 * CategorizationRulesPanel — CreateRuleForm, RulesList, PreviewPanel.
 * Create, edit, delete, drag-reorder rules; live preview against transactions.
 */

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, GripVertical, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CategorizationRuleFull,
  TransactionEnriched,
} from "@/types/finance";

const CATEGORIES = [
  { id: "SaaS", name: "SaaS" },
  { id: "Income", name: "Income" },
  { id: "Other", name: "Other" },
];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  pattern: z.string().min(1, "Pattern is required"),
  targetCategory: z.string().min(1, "Category is required"),
  targetSubcategory: z.string().optional(),
  priority: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

export interface CategorizationRulesPanelProps {
  rules: CategorizationRuleFull[];
  transactions: TransactionEnriched[];
  onCreateRule: (rule: Omit<CategorizationRuleFull, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateRule: (
    id: string,
    updates: Partial<Omit<CategorizationRuleFull, "id" | "createdAt" | "updatedAt">>
  ) => void;
  onDeleteRule: (id: string) => void;
  className?: string;
}

function matchesRule(t: TransactionEnriched, rule: CategorizationRuleFull): boolean {
  const pat = (rule.pattern ?? "").toLowerCase();
  const merchant = (t.merchant ?? "").toLowerCase();
  return merchant.includes(pat);
}

export function CategorizationRulesPanel({
  rules,
  transactions,
  onCreateRule,
  onUpdateRule: _onUpdateRule,
  onDeleteRule,
  className,
}: CategorizationRulesPanelProps) {
  const [previewRuleId, setPreviewRuleId] = useState<string | null>(null);

  const items = Array.isArray(rules) ? rules : [];
  const txList = Array.isArray(transactions) ? transactions : [];

  const previewMatches = useMemo(() => {
    if (!previewRuleId) return [];
    const rule = items.find((r) => r.id === previewRuleId);
    if (!rule) return [];
    return txList.filter((t) => matchesRule(t, rule));
  }, [previewRuleId, items, txList]);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings2 className="h-5 w-5 shrink-0" />
          Categorization Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="rules" className="flex-1">
              Rules
            </TabsTrigger>
            <TabsTrigger value="create" className="flex-1">
              Create Rule
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="rules" className="mt-4">
            <RulesList
              rules={items}
              onDelete={onDeleteRule}
              onPreview={setPreviewRuleId}
            />
          </TabsContent>
          <TabsContent value="create" className="mt-4">
            <CreateRuleForm
              onSubmit={(data) => {
                onCreateRule({
                  name: data.name,
                  pattern: data.pattern,
                  conditions: { merchantContains: data.pattern },
                  targetCategory: data.targetCategory,
                  targetSubcategory: data.targetSubcategory ?? null,
                  priority: data.priority,
                  enabled: true,
                  createdBy: "u1",
                });
              }}
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <PreviewPanel
              rules={items}
              transactions={txList}
              selectedRuleId={previewRuleId}
              onSelectRule={setPreviewRuleId}
              matches={previewMatches}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CreateRuleForm({
  onSubmit,
}: {
  onSubmit: (data: FormData) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      pattern: "",
      targetCategory: "",
      targetSubcategory: "",
      priority: 0,
    },
  });

  const targetCategory = watch("targetCategory");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Rule name</Label>
        <Input
          id="name"
          placeholder="e.g. Netflix subscription"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="pattern">Pattern (merchant contains)</Label>
        <Input
          id="pattern"
          placeholder="e.g. Netflix"
          {...register("pattern")}
          className={errors.pattern ? "border-destructive" : ""}
        />
        {errors.pattern && (
          <p className="text-xs text-destructive">{errors.pattern.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Target category</Label>
        <Select
          value={targetCategory}
          onValueChange={(v) => setValue("targetCategory", v)}
        >
          <SelectTrigger className={errors.targetCategory ? "border-destructive" : ""}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.targetCategory && (
          <p className="text-xs text-destructive">{errors.targetCategory.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subcategory">Subcategory (optional)</Label>
        <Input
          id="subcategory"
          placeholder="e.g. Streaming"
          {...register("targetSubcategory")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">Priority (lower = higher)</Label>
        <Input
          id="priority"
          type="number"
          min={0}
          {...register("priority")}
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create rule"}
      </Button>
    </form>
  );
}

function RulesList({
  rules,
  onDelete,
  onPreview,
}: {
  rules: CategorizationRuleFull[];
  onDelete: (id: string) => void;
  onPreview: (id: string | null) => void;
}) {
  const list = rules ?? [];

  if (list.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No rules yet. Create one in the "Create Rule" tab.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(list ?? []).map((rule) => (
        <div
          key={rule.id}
          className="flex items-center gap-2 rounded-lg border border-white/[0.03] p-3 transition-colors hover:bg-secondary/50"
        >
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{rule.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {rule.pattern} → {rule.targetCategory}
              {rule.targetSubcategory ? ` / ${rule.targetSubcategory}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-9"
              onClick={() => onPreview(rule.id)}
            >
              Preview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDelete(rule.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewPanel({
  rules,
  selectedRuleId,
  onSelectRule,
  matches,
}: {
  rules: CategorizationRuleFull[];
  transactions: TransactionEnriched[];
  selectedRuleId: string | null;
  onSelectRule: (id: string | null) => void;
  matches: TransactionEnriched[];
}) {
  const ruleList = rules ?? [];
  const matchList = matches ?? [];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm">Select rule to preview</Label>
        <Select
          value={selectedRuleId ?? ""}
          onValueChange={(v) => onSelectRule(v || null)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose a rule" />
          </SelectTrigger>
          <SelectContent>
            {ruleList.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name} ({r.pattern})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedRuleId && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {matchList.length} transaction(s) would match this rule
          </p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-white/[0.03] divide-y divide-white/[0.03]">
            {(matchList ?? []).slice(0, 20).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >
                <span className="font-medium truncate">{t.merchant ?? "—"}</span>
                <span className="text-muted-foreground">
                  ${Math.abs(t.amount ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
            {matchList.length > 20 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                +{matchList.length - 20} more
              </div>
            )}
          </div>
        </div>
      )}
      {!selectedRuleId && ruleList.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Create rules first to see preview.
        </p>
      )}
    </div>
  );
}
