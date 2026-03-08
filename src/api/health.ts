/**
 * Health API — habits, training, meals, recovery, workload, groceries.
 * Uses native fetch via src/lib/api.ts. Mock implementation for demo.
 */

import { api, safeArray } from "@/lib/api";
import type {
  Habit,
  HabitSchedule,
  HabitReminder,
  Checkin,
  CoachingAction,
  CoachingContext,
  TrainingPlan,
  MealPlan,
  RecoveryMetric,
  WorkloadRecommendation,
  GroceryItem,
  AuditLog,
  HealthDataSource,
  HealthDataPoint,
  HealthConsents,
  CalendarEvent,
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
    lastCheckInDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  },
  {
    id: "h2",
    userId: "u1",
    name: "Evening journal",
    frequency: "daily",
    streak: 5,
    nextReminder: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    lastCheckInDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
  },
  {
    id: "h3",
    userId: "u1",
    name: "Weekly review",
    frequency: "weekly",
    streak: 3,
    nextReminder: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastCheckInDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
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

/** Habits Tracker: create habit */
export interface CreateHabitPayload {
  name: string;
  category?: string;
  color?: string;
  icon?: string;
  schedule?: HabitSchedule;
  reminders?: HabitReminder[];
  timezone?: string;
}

export async function createHabit(payload: CreateHabitPayload): Promise<Habit> {
  try {
    const data = await api.post<Habit | { data?: Habit }>("/habits", payload);
    const raw = (data as { data?: Habit })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Habit;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  const id = `h${Date.now()}`;
  return {
    id,
    userId: "u1",
    name: payload.name ?? "New habit",
    frequency: payload.schedule?.type ?? "daily",
    streak: 0,
    nextReminder: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    category: payload.category,
    color: payload.color,
    icon: payload.icon,
    schedule: payload.schedule,
    reminders: payload.reminders ?? [],
    timezone: payload.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** Habits Tracker: update habit */
export async function updateHabit(id: string, payload: Partial<CreateHabitPayload>): Promise<Habit> {
  try {
    const data = await api.put<Habit | { data?: Habit }>(`/habits/${id}`, payload);
    const raw = (data as { data?: Habit })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Habit;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  const existing = MOCK_HABITS.find((h) => h.id === id) ?? MOCK_HABITS[0];
  return { ...existing, ...payload, id, updatedAt: new Date().toISOString() };
}

/** Habits Tracker: delete habit */
export async function deleteHabit(id: string): Promise<{ success: boolean }> {
  try {
    await api.delete(`/habits/${id}`);
    return { success: true };
  } catch {
    await delay(MOCK_DELAY);
    return { success: true };
  }
}

/** Habits Tracker: record check-in */
export async function recordCheckin(
  habitId: string,
  payload: { date: string; completed: boolean; notes?: string }
): Promise<Checkin> {
  try {
    const data = await api.post<Checkin | { data?: Checkin }>(`/habits/${habitId}/checkin`, payload);
    const raw = (data as { data?: Checkin })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as Checkin;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return {
    id: `c${Date.now()}`,
    habitId,
    date: payload.date,
    completed: payload.completed,
    notes: payload.notes,
  };
}

/** Habits Tracker: fetch coaching context */
export async function fetchCoachingContext(habitId?: string): Promise<CoachingContext> {
  try {
    const q = habitId ? `?habitId=${habitId}` : "";
    const data = await api.get<CoachingContext | { data?: CoachingContext }>(`/coaching/context${q}`);
    const raw = (data as { data?: CoachingContext })?.data ?? data;
    if (raw && typeof raw === "object") return raw as CoachingContext;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return {
    habitId,
    calendarEvents: [],
    healthSignals: { recoveryScore: 82, workloadLevel: "moderate" },
    nudges: [
      {
        id: "n1",
        habitId: habitId ?? "h1",
        type: "nudge",
        status: "pending",
        message: "Great consistency! Consider adding 2 min for deeper focus.",
        createdAt: new Date().toISOString(),
      },
    ],
    microActions: [],
    adaptiveSuggestions: [],
  };
}

/** Habits Tracker: record coaching action (approve/dismiss) */
export async function recordCoachingAction(
  payload: { actionId: string; approved: boolean }
): Promise<CoachingAction> {
  try {
    const data = await api.post<CoachingAction | { data?: CoachingAction }>("/coaching/actions", payload);
    const raw = (data as { data?: CoachingAction })?.data ?? data;
    if (raw && typeof raw === "object" && "id" in raw) return raw as CoachingAction;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return {
    id: payload.actionId,
    habitId: "h1",
    type: "nudge",
    status: payload.approved ? "approved" : "dismissed",
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  };
}

/** Health data ingestion (HealthKit / Google Fit) — POST /api/health/ingest */
export interface HealthIngestPayload {
  source: HealthDataSource;
  userId: string;
  data: unknown;
}

export interface HealthIngestResponse {
  success: boolean;
  ingested?: number;
  errors?: unknown[];
}

export async function healthIngest(payload: HealthIngestPayload): Promise<HealthIngestResponse> {
  try {
    const res = await api.post<HealthIngestResponse>("/health/ingest", payload);
    return res && typeof res === "object" && "success" in res
      ? (res as HealthIngestResponse)
      : { success: false };
  } catch {
    await delay(MOCK_DELAY);
    return { success: true, ingested: 0 };
  }
}

/** Consents — GET /api/consents, POST /api/consents, PATCH /api/consents */
export async function fetchConsents(userId: string): Promise<HealthConsents | null> {
  try {
    const data = await api.get<HealthConsents | { data?: HealthConsents }>(
      `/consents?userId=${encodeURIComponent(userId)}`
    );
    const raw = (data as { data?: HealthConsents })?.data ?? data;
    return raw && typeof raw === "object" && raw.userId ? (raw as HealthConsents) : null;
  } catch {
    await delay(MOCK_DELAY);
    return {
      userId,
      sources: { healthkit: false, google_fit: false, calendar: false },
    };
  }
}

export async function updateConsents(
  userId: string,
  payload: Partial<Pick<HealthConsents, "sources" | "dataSharingPrefs">>
): Promise<HealthConsents> {
  try {
    const data = await api.patch<HealthConsents | { data?: HealthConsents }>("/consents", {
      userId,
      ...payload,
    });
    const raw = (data as { data?: HealthConsents })?.data ?? data;
    if (raw && typeof raw === "object") return raw as HealthConsents;
  } catch {
    /**/
  }
  await delay(MOCK_DELAY);
  return {
    userId,
    sources: payload.sources ?? { healthkit: false, google_fit: false, calendar: false },
    dataSharingPrefs: payload.dataSharingPrefs,
    updatedAt: new Date().toISOString(),
  };
}

/** Calendar events — GET /api/calendar/events (for workload balancing) */
export async function fetchCalendarEvents(
  userId: string,
  dateRange: { from: string; to: string }
): Promise<CalendarEvent[]> {
  try {
    const params = new URLSearchParams({
      userId,
      from: dateRange.from,
      to: dateRange.to,
    });
    const data = await api.get<CalendarEvent[] | { data?: CalendarEvent[] }>(
      `/calendar/events?${params}`
    );
    const raw = (data as { data?: CalendarEvent[] })?.data ?? data;
    return safeArray<CalendarEvent>(raw);
  } catch {
    await delay(MOCK_DELAY);
    return [];
  }
}

/** Habits Tracker: fetch habit history (checkins for streak/calendar) */
export async function fetchHabitHistory(
  habitId: string,
  range: { from: string; to: string }
): Promise<Array<{ date: string; completed: boolean; notes?: string }>> {
  try {
    const data = await api.get<Array<{ date: string; completed: boolean; notes?: string }>>(
      `/habits/${habitId}/history?from=${range.from}&to=${range.to}`
    );
    const raw = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
    return safeArray<{ date: string; completed: boolean; notes?: string }>(raw);
  } catch {
    await delay(MOCK_DELAY);
    const days = 30;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const date = d.toISOString().slice(0, 10);
      return { date, completed: Math.random() > 0.3 };
    });
  }
}
