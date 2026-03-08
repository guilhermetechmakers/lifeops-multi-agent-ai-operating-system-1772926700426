/**
 * Health API — habits, training, meals, recovery, workload, groceries.
 * Uses native fetch via src/lib/api.ts. Mock implementation for demo.
 */

import { api, safeArray } from "@/lib/api";
import type {
  Habit,
  TrainingPlan,
  MealPlan,
  RecoveryMetric,
  WorkloadRecommendation,
  GroceryItem,
  AuditLog,
} from "@/types/health";

const MOCK_DELAY = 300;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Mock habits */
const MOCK_HABITS: Habit[] = [
  {
    id: "h1",
    userId: "u1",
    name: "Morning meditation",
    frequency: "daily",
    streak: 12,
    nextReminder: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    coachInterventions: ["Great consistency! Consider adding 2 min for deeper focus."],
  },
  {
    id: "h2",
    userId: "u1",
    name: "Evening journal",
    frequency: "daily",
    streak: 5,
    nextReminder: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "h3",
    userId: "u1",
    name: "Weekly review",
    frequency: "weekly",
    streak: 3,
    nextReminder: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/** Mock training plan */
const MOCK_TRAINING: TrainingPlan = {
  id: "tp1",
  userId: "u1",
  goal: "Build strength and endurance",
  calendarSync: true,
  sessions: [
    { date: new Date().toISOString().slice(0, 10), type: "Strength", durationMin: 45 },
    { date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), type: "Cardio", durationMin: 30 },
    { date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), type: "Recovery", durationMin: 20 },
    { date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), type: "Strength", durationMin: 45 },
    { date: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10), type: "Cardio", durationMin: 35 },
  ],
};

/** Mock meal plan */
const MOCK_MEAL: MealPlan = {
  id: "mp1",
  userId: "u1",
  goal: "Balanced macros, 2000 cal",
  meals: [
    { date: new Date().toISOString().slice(0, 10), items: ["Oatmeal + berries", "Grilled chicken salad", "Salmon + veggies"] },
    { date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), items: ["Eggs + avocado", "Turkey wrap", "Stir-fry tofu"] },
  ],
  nutritionSummary: { calories: 2050, protein: 145, carbs: 180, fats: 72 },
};

/** Mock recovery metrics */
const MOCK_RECOVERY: RecoveryMetric[] = [
  { id: "r1", userId: "u1", score: 82, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "r2", userId: "u1", score: 78, timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "r3", userId: "u1", score: 85, timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "r4", userId: "u1", score: 80, timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "r5", userId: "u1", score: 88, timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
];

/** Mock workload recommendations */
const MOCK_WORKLOAD: WorkloadRecommendation = {
  id: "wr1",
  userId: "u1",
  createdAt: new Date().toISOString(),
  recommendations: [
    { id: "rec1", changeDescription: "Move Tuesday meeting block to Thursday afternoon", impact: "Adds 2h recovery window", confidence: 0.92 },
    { id: "rec2", changeDescription: "Shift Wednesday deep work to morning", impact: "Aligns with peak focus", confidence: 0.85 },
    { id: "rec3", changeDescription: "Add 30min buffer before Friday review", impact: "Reduces context switching", confidence: 0.78 },
  ],
};

/** Mock groceries */
const MOCK_GROCERIES: GroceryItem[] = [
  { id: "g1", name: "Chicken breast", quantity: "500g", checked: false },
  { id: "g2", name: "Salmon fillet", quantity: "300g", checked: false },
  { id: "g3", name: "Oats", quantity: "1kg", checked: true },
  { id: "g4", name: "Mixed berries", quantity: "200g", checked: false },
  { id: "g5", name: "Avocado", quantity: "2", checked: false },
  { id: "g6", name: "Spinach", quantity: "200g", checked: false },
];

/** Health snapshot mock */
const MOCK_SNAPSHOT = {
  sleepHours: 7.2,
  recoveryScore: 82,
  weeklyTrainingLoad: 185,
  next7Days: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
    sleep: 6.5 + Math.random() * 1.5,
    recovery: 75 + Math.random() * 20,
    load: 20 + Math.floor(Math.random() * 40),
  })),
};

export async function fetchHabits(): Promise<Habit[]> {
  try {
    const data = await api.get<Habit[] | { data?: Habit[] }>("/health/habits");
    const raw = (data as { data?: Habit[] })?.data ?? data;
    return safeArray<Habit>(raw);
  } catch {
    await delay(MOCK_DELAY);
    return [...MOCK_HABITS];
  }
}

export async function fetchTrainingPlans(): Promise<TrainingPlan[]> {
  try {
    const data = await api.get<TrainingPlan[] | { data?: TrainingPlan[] }>("/health/plans/training");
    const raw = (data as { data?: TrainingPlan[] })?.data ?? data;
    const list = safeArray<TrainingPlan>(raw);
    return list.length > 0 ? list : [MOCK_TRAINING];
  } catch {
    await delay(MOCK_DELAY);
    return [MOCK_TRAINING];
  }
}

export async function fetchMealPlans(): Promise<MealPlan[]> {
  try {
    const data = await api.get<MealPlan[] | { data?: MealPlan[] }>("/health/plans/meals");
    const raw = (data as { data?: MealPlan[] })?.data ?? data;
    const list = safeArray<MealPlan>(raw);
    return list.length > 0 ? list : [MOCK_MEAL];
  } catch {
    await delay(MOCK_DELAY);
    return [MOCK_MEAL];
  }
}

export async function fetchRecovery(): Promise<RecoveryMetric[]> {
  try {
    const data = await api.get<RecoveryMetric[] | { data?: RecoveryMetric[] }>("/health/recovery");
    const raw = (data as { data?: RecoveryMetric[] })?.data ?? data;
    const list = safeArray<RecoveryMetric>(raw);
    return list.length > 0 ? list : [...MOCK_RECOVERY];
  } catch {
    await delay(MOCK_DELAY);
    return [...MOCK_RECOVERY];
  }
}

export async function fetchWorkloadRecommendations(): Promise<WorkloadRecommendation | null> {
  try {
    const data = await api.get<WorkloadRecommendation | { data?: WorkloadRecommendation }>("/health/workload/recommendations");
    const raw = (data as { data?: WorkloadRecommendation })?.data ?? data;
    return raw && typeof raw === "object" && Array.isArray((raw as WorkloadRecommendation).recommendations)
      ? (raw as WorkloadRecommendation)
      : MOCK_WORKLOAD;
  } catch {
    await delay(MOCK_DELAY);
    return MOCK_WORKLOAD;
  }
}

export async function fetchGroceries(): Promise<GroceryItem[]> {
  try {
    const data = await api.get<GroceryItem[] | { data?: GroceryItem[] }>("/health/groceries");
    const raw = (data as { data?: GroceryItem[] })?.data ?? data;
    const list = safeArray<GroceryItem>(raw);
    return list.length > 0 ? list : [...MOCK_GROCERIES];
  } catch {
    await delay(MOCK_DELAY);
    return [...MOCK_GROCERIES];
  }
}

export async function fetchHealthSnapshot(): Promise<typeof MOCK_SNAPSHOT> {
  try {
    const data = await api.get<typeof MOCK_SNAPSHOT | { data?: typeof MOCK_SNAPSHOT }>("/health/snapshot");
    const raw = (data as { data?: typeof MOCK_SNAPSHOT })?.data ?? data;
    if (raw && typeof raw === "object" && "sleepHours" in raw) {
      return raw as typeof MOCK_SNAPSHOT;
    }
    return MOCK_SNAPSHOT;
  } catch {
    await delay(MOCK_DELAY);
    return MOCK_SNAPSHOT;
  }
}

export async function applyWorkloadAdjustment(payload: {
  recommendationId: string;
  accepted: boolean;
}): Promise<{ success: boolean }> {
  try {
    await api.post("/health/workload/apply", payload);
    return { success: true };
  } catch {
    await delay(MOCK_DELAY);
    return { success: true };
  }
}

export async function syncCalendar(): Promise<{ success: boolean }> {
  try {
    await api.post("/health/calendar/sync", {});
    return { success: true };
  } catch {
    await delay(MOCK_DELAY);
    return { success: true };
  }
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const data = await api.get<AuditLog[] | { data?: AuditLog[] }>("/health/audit/logs");
    const raw = (data as { data?: AuditLog[] })?.data ?? data;
    return safeArray<AuditLog>(raw);
  } catch {
    await delay(MOCK_DELAY);
    return [];
  }
}
