/**
 * ScenarioBuilder — Adjust inputs for income, expenses, churn, seasonality, subscriptions.
 */

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SlidersHorizontal,
  Plus,
  Copy,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScenarioInputs, Scenario } from "@/types/forecasting";
import { DEFAULT_SCENARIO_INPUTS } from "@/types/forecasting";

const INPUT_FIELDS: Array<{
  key: keyof ScenarioInputs;
  label: string;
  suffix?: string;
  asPercent?: boolean;
  min?: number;
  max?: number;
  step?: number;
}> = [
  { key: "revenueGrowth", label: "Revenue growth", suffix: "%", asPercent: true, min: -0.2, max: 0.5, step: 0.01 },
  { key: "expenseGrowth", label: "Expense growth", suffix: "%", asPercent: true, min: -0.1, max: 0.3, step: 0.01 },
  { key: "churnRate", label: "Churn rate", suffix: "%", asPercent: true, min: 0, max: 0.2, step: 0.005 },
  { key: "seasonality", label: "Seasonality factor", min: 0.5, max: 1.5, step: 0.05 },
  { key: "subscriptionDelta", label: "Subscription delta", suffix: "$", min: -500, max: 500, step: 10 },
  { key: "oneOffs", label: "One-off items", suffix: "$", min: -10000, max: 10000, step: 100 },
];

interface ScenarioBuilderProps {
  scenarios: Scenario[];
  selectedScenarioIds: Set<string>;
  onAddScenario: (name: string, inputs: ScenarioInputs) => string;
  onUpdateScenario: (id: string, updates: Partial<{ name: string; inputs: ScenarioInputs }>) => void;
  onRemoveScenario: (id: string) => void;
  onToggleScenario: (id: string) => void;
  onDuplicateScenario: (id: string) => void;
  onResetToBaseline: () => void;
  onInputsChange?: (inputs: ScenarioInputs) => void;
  activeScenarioId: string | null;
  onSetActiveScenario: (id: string | null) => void;
  className?: string;
}

function toPercent(val: number): number {
  return Math.round(val * 100);
}

function fromPercent(val: number): number {
  return val / 100;
}

export function ScenarioBuilder({
  scenarios,
  selectedScenarioIds,
  onAddScenario,
  onUpdateScenario,
  onRemoveScenario,
  onToggleScenario,
  onDuplicateScenario,
  onResetToBaseline,
  onInputsChange,
  activeScenarioId,
  onSetActiveScenario,
  className,
}: ScenarioBuilderProps) {
  const [localInputs, setLocalInputs] = useState<ScenarioInputs>(DEFAULT_SCENARIO_INPUTS);
  const [newName, setNewName] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const activeScenario = activeScenarioId
    ? scenarios.find((s) => s.id === activeScenarioId)
    : null;

  useEffect(() => {
    if (activeScenario) {
      setLocalInputs(activeScenario.inputs);
    } else {
      setLocalInputs(DEFAULT_SCENARIO_INPUTS);
    }
  }, [activeScenario?.id, activeScenario?.inputs]);

  const debouncedNotify = useCallback(
    (inputs: ScenarioInputs) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      const t = setTimeout(() => {
        onInputsChange?.(inputs);
        setDebounceTimer(null);
      }, 300);
      setDebounceTimer(t);
    },
    [onInputsChange, debounceTimer]
  );

  const handleInputChange = useCallback(
    (key: keyof ScenarioInputs, value: number) => {
      const next = { ...localInputs, [key]: value };
      setLocalInputs(next);
      if (activeScenarioId) {
        onUpdateScenario(activeScenarioId, { inputs: next });
      }
      debouncedNotify(next);
    },
    [localInputs, activeScenarioId, onUpdateScenario, debouncedNotify]
  );

  const handleAddScenario = useCallback(() => {
    const name = newName.trim() || `Scenario ${(scenarios?.length ?? 0) + 1}`;
    onAddScenario(name, localInputs);
    setNewName("");
  }, [newName, scenarios?.length, localInputs, onAddScenario]);

  const safeScenarios = scenarios ?? [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <SlidersHorizontal className="h-5 w-5 text-teal" />
          Scenario Builder
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Adjust assumptions to see impact on forecast
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2 flex-1 min-w-[200px]">
            <Input
              placeholder="New scenario name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-9"
            />
            <Button
              size="sm"
              onClick={handleAddScenario}
              className="shrink-0"
              aria-label="Add scenario"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onResetToBaseline}
            aria-label="Reset to baseline"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {safeScenarios.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Scenarios</Label>
            <div className="flex flex-wrap gap-2">
              {safeScenarios.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-1 rounded-md border px-2 py-1.5 text-sm transition-colors",
                    activeScenarioId === s.id
                      ? "border-teal bg-teal/10 text-foreground"
                      : "border-white/[0.03] bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSetActiveScenario(activeScenarioId === s.id ? null : s.id)}
                    className="font-medium truncate max-w-[120px]"
                  >
                    {s.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleScenario(s.id)}
                    className={cn(
                      "ml-1 rounded px-1.5 py-0.5 text-xs",
                      selectedScenarioIds.has(s.id)
                        ? "bg-teal/20 text-teal"
                        : "bg-white/5 text-muted-foreground"
                    )}
                    aria-pressed={selectedScenarioIds.has(s.id)}
                  >
                    {selectedScenarioIds.has(s.id) ? "On" : "Off"}
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onDuplicateScenario(s.id)}
                    aria-label={`Duplicate ${s.name}`}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => onRemoveScenario(s.id)}
                    aria-label={`Delete ${s.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Assumptions</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INPUT_FIELDS.map(({ key, label, suffix, asPercent, min = 0, max = 1, step = 0.01 }) => {
              const raw = localInputs[key] ?? 0;
              const displayVal = asPercent ? toPercent(raw) : raw;
              const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const v = parseFloat(e.target.value) || 0;
                const next = asPercent ? fromPercent(v) : v;
                handleInputChange(key, Math.max(min ?? 0, Math.min(max ?? 1, next)));
              };
              return (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`scenario-${key}`} className="text-xs">
                    {label}
                  </Label>
                  <div className="flex items-center gap-1">
                    {suffix && (
                      <span className="text-xs text-muted-foreground">{suffix}</span>
                    )}
                    <Input
                      id={`scenario-${key}`}
                      type="number"
                      value={displayVal}
                      onChange={handleChange}
                      min={asPercent ? toPercent(min ?? 0) : min}
                      max={asPercent ? toPercent(max ?? 1) : max}
                      step={asPercent ? 1 : step}
                      className="h-9"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
