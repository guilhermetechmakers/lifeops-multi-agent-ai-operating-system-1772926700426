/**
 * Training & Meal Planner API — plan generation, calendar sync, grocery aggregate.
 * Mock implementation; structured for future backend integration.
 */

import { api } from "@/lib/api";
import type {
  Plan,
  GeneratePlanPayload,
  CalendarSyncPayload,
  PlanAdjustPayload,
  GroceryItemExtended,
  MealPlanItem,
  WorkoutPlanItem,
  ScheduleItem,
  AgentSuggestion,
} from "@/types/training-meal-planner";

const MOCK_DELAY = 400;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Generate mock meals for a plan */
function mockMeals(count: number): MealPlanItem[] {
  const names = [
    "Oatmeal with berries",
    "Grilled chicken salad",
    "Salmon with vegetables",
    "Eggs and avocado toast",
    "Turkey wrap",
    "Stir-fry tofu",
    "Greek yogurt parfait",
    "Quinoa bowl",
    "Beef stir-fry",
    "Lentil soup",
  ];
  return Array.from({ length: Math.min(count, 14) }, (_, i) => ({
    id: `meal-${i + 1}`,
    name: names[i % names.length] ?? "Meal",
    calories: 400 + Math.floor(Math.random() * 300),
    macros: {
      protein: 25 + Math.floor(Math.random() * 25),
      carbs: 40 + Math.floor(Math.random() * 30),
      fat: 12 + Math.floor(Math.random() * 15),
    },
    ingredients: [
      { name: "Ingredient A", quantity: 100, unit: "g" },
      { name: "Ingredient B", quantity: 50, unit: "g" },
    ],
  }));
}

/** Generate mock workouts for a plan */
function mockWorkouts(count: number): WorkoutPlanItem[] {
  const types = [
    { name: "Strength training", intensity: "high", duration: 45 },
    { name: "Cardio", intensity: "moderate", duration: 30 },
    { name: "Recovery yoga", intensity: "low", duration: 20 },
    { name: "HIIT", intensity: "high", duration: 25 },
    { name: "Running", intensity: "moderate", duration: 40 },
  ];
  return Array.from({ length: Math.min(count, 10) }, (_, i) => {
    const t = types[i % types.length]!;
    return {
      id: `workout-${i + 1}`,
      name: t.name,
      durationMin: t.duration,
      intensity: t.intensity,
      targetCalories: 200 + Math.floor(Math.random() * 200),
    };
  });
}

/** Generate mock schedule items from meals and workouts */
function mockSchedule(meals: MealPlanItem[], workouts: WorkoutPlanItem[]): ScheduleItem[] {
  const items: ScheduleItem[] = [];
  (workouts ?? []).slice(0, 5).forEach((w, i) => {
    items.push({
      id: `sched-w-${w.id}`,
      type: "workout",
      startTime: `08:00`,
      endTime: `08:${String(w.durationMin).padStart(2, "0")}`,
      referenceId: w.id,
      dayOfWeek: i % 7,
      date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
    });
  });
  (meals ?? []).slice(0, 14).forEach((m, i) => {
    const day = Math.floor(i / 3) % 7;
    const mealSlot = i % 3;
    const times = ["07:00", "12:00", "18:00"];
    items.push({
      id: `sched-m-${m.id}`,
      type: "meal",
      startTime: times[mealSlot] ?? "12:00",
      referenceId: m.id,
      dayOfWeek: day,
      date: new Date(Date.now() + day * 86400000).toISOString().slice(0, 10),
    });
  });
  return items;
}

/** Aggregate grocery list from meals */
function aggregateGroceries(meals: MealPlanItem[]): GroceryItemExtended[] {
  const map = new Map<string, { qty: number; unit: string }>();
  (meals ?? []).forEach((m) => {
    (m.ingredients ?? []).forEach((ing) => {
      const key = ing.name.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.qty += ing.quantity;
      } else {
        map.set(key, { qty: ing.quantity, unit: ing.unit });
      }
    });
  });
  return Array.from(map.entries(), ([name, { qty, unit }], i) => ({
    id: `grocery-${i + 1}`,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    quantity: qty,
    unit,
    checked: false,
  }));
}

/** Compute nutrition totals from meals */
function computeNutritionTotals(
  meals: MealPlanItem[],
  schedule: ScheduleItem[],
  _durationWeeks: number
): Plan["nutritionTotals"] {
  const daily: Plan["nutritionTotals"]["daily"] = [];
  const weekly: Plan["nutritionTotals"]["weekly"] = [];
  const mealMap = new Map((meals ?? []).map((m) => [m.id, m]));
  const byDay = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();

  (schedule ?? []).forEach((s) => {
    if (s.type !== "meal" || !s.date) return;
    const meal = mealMap.get(s.referenceId);
    if (!meal) return;
    const existing = byDay.get(s.date) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    existing.calories += meal.calories ?? 0;
    existing.protein += meal.macros?.protein ?? 0;
    existing.carbs += meal.macros?.carbs ?? 0;
    existing.fat += meal.macros?.fat ?? 0;
    byDay.set(s.date, existing);
  });

  Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 7)
    .forEach(([, totals]) => daily.push(totals));

  if (daily.length > 0) {
    const week = daily.reduce(
      (acc, d) => ({
        calories: acc.calories + d.calories,
        protein: acc.protein + d.protein,
        carbs: acc.carbs + d.carbs,
        fat: acc.fat + d.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    weekly.push(week);
  }

  return { daily, weekly };
}

export async function generatePlan(payload: GeneratePlanPayload): Promise<Plan> {
  try {
    const data = await api.post<Plan | { data?: Plan }>("/plan/generate", payload);
    const raw = (data as { data?: Plan })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Plan;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);

  const meals = mockMeals((payload.durationWeeks ?? 2) * 7);
  const workouts = mockWorkouts((payload.durationWeeks ?? 2) * 3);
  const schedule = mockSchedule(meals, workouts);
  const groceryList = aggregateGroceries(meals);
  const nutritionTotals = computeNutritionTotals(meals, schedule, payload.durationWeeks ?? 2);

  return {
    id: `plan-${Date.now()}`,
    userId: payload.userId ?? "u1",
    goals: payload.goals ?? [],
    durationWeeks: payload.durationWeeks ?? 2,
    constraints: payload.constraints ?? {
      dietary: null,
      allergies: [],
      equipment: [],
      macroTargets: null,
    },
    meals,
    workouts,
    nutritionTotals,
    schedule,
    groceryList,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function syncCalendar(payload: CalendarSyncPayload): Promise<{ success: boolean; nextSync?: string }> {
  try {
    const data = await api.post<{ success: boolean; nextSync?: string }>("/calendar/sync", payload);
    const raw = (data as { data?: { success: boolean; nextSync?: string } })?.data ?? data;
    if (raw && typeof raw === "object" && "success" in raw) return raw as { success: boolean; nextSync?: string };
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return { success: true, nextSync: new Date(Date.now() + 86400000).toISOString() };
}

export async function aggregateGroceryList(planId: string): Promise<{ items: GroceryItemExtended[] }> {
  try {
    const data = await api.post<{ items: GroceryItemExtended[] }>("/grocery/aggregate", { planId });
    const raw = (data as { data?: { items: GroceryItemExtended[] } })?.data ?? data;
    if (raw && typeof raw === "object" && Array.isArray((raw as { items: GroceryItemExtended[] }).items)) {
      return raw as { items: GroceryItemExtended[] };
    }
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return { items: [] };
}

export async function adjustPlan(payload: PlanAdjustPayload): Promise<Plan> {
  try {
    const data = await api.post<Plan | { data?: Plan }>("/plan/adjust", payload);
    const raw = (data as { data?: Plan })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Plan;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return generatePlan({
    goals: [],
    durationWeeks: 2,
    constraints: { dietary: null, allergies: [], equipment: [], macroTargets: null },
  });
}

export async function fetchPlan(planId: string): Promise<Plan | null> {
  try {
    const data = await api.get<Plan | { data?: Plan }>(`/plan/${planId}`);
    const raw = (data as { data?: Plan })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Plan;
  } catch {
    /**/
  }
  return null;
}

export async function fetchAgentSuggestions(
  planId: string,
  context?: Record<string, unknown>
): Promise<{ suggestions: AgentSuggestion[] }> {
  try {
    const data = await api.post<{ suggestions: AgentSuggestion[] }>("/agent/suggest", { planId, context });
    const raw = (data as { data?: { suggestions: AgentSuggestion[] } })?.data ?? data;
    const list = Array.isArray((raw as { suggestions: AgentSuggestion[] })?.suggestions)
      ? (raw as { suggestions: AgentSuggestion[] }).suggestions
      : [];
    return { suggestions: list };
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return {
    suggestions: [
      {
        id: "sug-1",
        adjustments: [
          {
            id: "adj-1",
            type: "swap_meal",
            description: "Swap Tuesday lunch for higher-protein option",
            rationale: "Aligns with muscle gain goal",
            confidence: 0.85,
          },
        ],
        explanation: "Based on your goals and recovery score, we suggest this swap.",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
