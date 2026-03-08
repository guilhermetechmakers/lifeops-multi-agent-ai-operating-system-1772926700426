/**
 * Training & Meal Planner API — plan generation, calendar sync, grocery aggregation.
 * Mock implementation for demo; structured for real backend integration.
 */

import { api } from "@/lib/api";
import type {
  Plan,
  PlanConstraints,
  MealPlanItem,
  WorkoutPlanItem,
  ScheduleItem,
  PlanGroceryItem,
  Adjustment,
} from "@/types/training-plan";

const MOCK_DELAY = 400;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const MEAL_NAMES = [
  "Oatmeal + berries",
  "Grilled chicken salad",
  "Salmon + veggies",
  "Eggs + avocado",
  "Turkey wrap",
  "Stir-fry tofu",
  "Greek yogurt parfait",
  "Quinoa bowl",
  "Grilled fish tacos",
  "Mediterranean bowl",
];
const WORKOUT_TYPES = ["Strength", "Cardio", "Recovery", "HIIT", "Yoga"];

function generateMockPlan(payload: {
  userId: string;
  goals: string[];
  durationWeeks: number;
  constraints: PlanConstraints;
}): Plan {
  const { userId, goals, durationWeeks, constraints } = payload;
  const meals: MealPlanItem[] = [];
  const workouts: WorkoutPlanItem[] = [];
  const schedule: ScheduleItem[] = [];
  const dailyTotals: { calories: number; protein: number; carbs: number; fat: number }[] = [];
  const daysTotal = Math.min(durationWeeks * 7, 14);

  for (let d = 0; d < daysTotal; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);

    const dayMeals = 3;
    let dayCal = 0;
    let dayP = 0;
    let dayC = 0;
    let dayF = 0;

    for (let m = 0; m < dayMeals; m++) {
      const cal = 400 + Math.floor(Math.random() * 400);
      const p = Math.floor(cal * 0.25 / 4);
      const c = Math.floor(cal * 0.45 / 4);
      const f = Math.floor(cal * 0.3 / 9);
      const mealId = `meal-${d}-${m}`;
      meals.push({
        id: mealId,
        name: MEAL_NAMES[(d + m) % MEAL_NAMES.length] ?? "Meal",
        calories: cal,
        macros: { protein: p, carbs: c, fat: f },
        ingredients: [
          { name: "Chicken breast", quantity: 100, unit: "g" },
          { name: "Rice", quantity: 50, unit: "g" },
          { name: "Broccoli", quantity: 80, unit: "g" },
        ],
      });
      dayCal += cal;
      dayP += p;
      dayC += c;
      dayF += f;
      schedule.push({
        id: `s-${mealId}`,
        type: "meal",
        startTime: ["08:00", "12:30", "18:00"][m] ?? "08:00",
        referenceId: mealId,
        date: dateStr,
      });
    }

    const workoutType = WORKOUT_TYPES[d % WORKOUT_TYPES.length] ?? "Strength";
    const duration = 30 + (d % 3) * 15;
    const workoutId = `workout-${d}`;
    workouts.push({
      id: workoutId,
      name: workoutType,
      durationMin: duration,
      intensity: d % 3 === 0 ? "high" : d % 3 === 1 ? "medium" : "low",
      targetCalories: duration * 8,
    });
    schedule.push({
      id: `s-${workoutId}`,
      type: "workout",
      startTime: "07:00",
      endTime: `07:${String(duration).padStart(2, "0")}`,
      referenceId: workoutId,
      date: dateStr,
    });

    dailyTotals.push({ calories: dayCal, protein: dayP, carbs: dayC, fat: dayF });
  }

  const weeklyTotals = dailyTotals.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      carbs: acc.carbs + d.carbs,
      fat: acc.fat + d.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const groceryList: PlanGroceryItem[] = [
    { name: "Chicken breast", quantity: 1000, unit: "g" },
    { name: "Salmon fillet", quantity: 400, unit: "g" },
    { name: "Oats", quantity: 500, unit: "g" },
    { name: "Mixed berries", quantity: 300, unit: "g" },
    { name: "Avocado", quantity: 4, unit: "pcs" },
    { name: "Spinach", quantity: 300, unit: "g" },
    { name: "Rice", quantity: 500, unit: "g" },
    { name: "Broccoli", quantity: 400, unit: "g" },
  ];

  return {
    id: `plan-${Date.now()}`,
    userId,
    goals: goals ?? ["maintenance"],
    durationWeeks: durationWeeks ?? 2,
    constraints: constraints ?? {
      dietary: null,
      allergies: [],
      equipment: [],
      macroTargets: null,
    },
    meals,
    workouts,
    nutritionTotals: {
      daily: dailyTotals,
      weekly: [weeklyTotals],
    },
    schedule,
    groceryList,
  };
}

export interface GeneratePlanPayload {
  userId: string;
  goals: string[];
  durationWeeks: number;
  constraints: PlanConstraints;
}

export async function generatePlan(payload: GeneratePlanPayload): Promise<Plan> {
  try {
    const data = await api.post<Plan | { data?: Plan }>("/plan/generate", payload);
    const raw = (data as { data?: Plan })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) {
      return raw as Plan;
    }
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return generateMockPlan(payload);
}

export interface SyncCalendarPayload {
  planId: string;
  calendarProvider: "local" | "google" | "apple";
  timezone?: string;
}

export async function syncCalendar(payload: SyncCalendarPayload): Promise<{ success: boolean; nextSync?: string }> {
  try {
    await api.post("/calendar/sync", payload);
    return { success: true, nextSync: new Date(Date.now() + 86400000).toISOString() };
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return { success: true };

}

export async function aggregateGroceries(planId: string): Promise<{ items: PlanGroceryItem[] }> {
  try {
    const data = await api.post<{ items: PlanGroceryItem[] } | { data?: { items: PlanGroceryItem[] } }>(
      "/grocery/aggregate",
      { planId }
    );
    const raw = (data as { data?: { items: PlanGroceryItem[] } })?.data ?? data;
    const items = Array.isArray((raw as { items?: PlanGroceryItem[] })?.items)
      ? (raw as { items: PlanGroceryItem[] }).items
      : [];
    return { items };
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return {
    items: [
      { name: "Chicken breast", quantity: 1000, unit: "g" },
      { name: "Salmon fillet", quantity: 400, unit: "g" },
      { name: "Oats", quantity: 500, unit: "g" },
    ],
  };
}

export interface AdjustPlanPayload {
  planId: string;
  adjustments: Adjustment[];
}

export async function adjustPlan(payload: AdjustPlanPayload): Promise<Plan> {
  try {
    const data = await api.post<Plan | { data?: Plan }>("/plan/adjust", payload);
    const raw = (data as { data?: Plan })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Plan;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  const existing = (payload as unknown as { _plan?: Plan })._plan;
  return (
    existing ??
    generateMockPlan({
      userId: "u1",
      goals: ["maintenance"],
      durationWeeks: 2,
      constraints: {
        dietary: null,
        allergies: [],
        equipment: [],
        macroTargets: null,
      },
    })
  );
}

export async function getPlan(planId: string): Promise<Plan | null> {
  try {
    const data = await api.get<Plan | { data?: Plan }>(`/plan/${planId}`);
    const raw = (data as { data?: Plan })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Plan;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return null;
}

export interface AgentSuggestPayload {
  planId: string;
  context?: Record<string, unknown>;
}

export async function agentSuggest(payload: AgentSuggestPayload): Promise<{ suggestions: Adjustment[] }> {
  try {
    const data = await api.post<{ suggestions: Adjustment[] } | { data?: { suggestions: Adjustment[] } }>(
      "/agent/suggest",
      payload
    );
    const raw = (data as { data?: { suggestions: Adjustment[] } })?.data ?? data;
    const suggestions = Array.isArray((raw as { suggestions?: Adjustment[] })?.suggestions)
      ? (raw as { suggestions: Adjustment[] }).suggestions
      : [];
    return { suggestions };
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return {
    suggestions: [
      {
        id: "adj1",
        type: "swap_meal",
        description: "Swap Tuesday lunch for higher-protein option",
        rationale: "Aligns with muscle gain goal",
      },
      {
        id: "adj2",
        type: "modify_rest",
        description: "Add 10 min rest between sets on Wednesday",
        rationale: "Recovery score suggests moderate fatigue",
      },
    ],
  };
}
