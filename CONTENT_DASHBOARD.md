# Content Dashboard

The Content Dashboard is the central overview for content pipelines within LifeOps. It aggregates content ideas, research tasks, drafts, scheduled publications, and analytics.

## Routes

- **`/dashboard/content`** or **`/content-dashboard`** — Main Content Dashboard (redirects to `/dashboard/content`)
- **`/dashboard/content/editor`** or **`/content-dashboard/editor`** — Content Editor (redirects to `/dashboard/content/editor`)

## Components

| Component | Purpose |
|-----------|---------|
| **ContentDashboardShell** | Layout: composes global search, filters, and a responsive grid of panels. Manages search, scope, and filter state. |
| **ContentCalendarPanel** | Calendar grid with drag-and-drop reschedule. Uses `@dnd-kit` for DnD; moving an item updates scheduling and invalidates queries. |
| **DraftsPanel** | Kanban-style view of drafts by stage (idea → research → draft → edit → ready to publish). Inline actions: Open, Advance stage. |
| **PublishingQueuePanel** | List of scheduled posts with status, next run, channels, retries. Retry action for failed items. |
| **AgentRecommendationsPanel** | Suggested topics with rationale and confidence; "Use in Editor" opens the editor with the idea. |
| **SEOPerformancePanel** | Keyword recommendations, search volume, difficulty, and "Open in Editor" CTA per insight. |
| **GlobalSearchBar** | Search input plus scope selector (All, Content, Projects, Cronjobs, Runs, Users). |
| **ModuleFiltersBar** | Status pills and project dropdown to filter content. |
| **ContentEditorShortcutHub** | Quick link to editor, recent items, and starter templates. |
| **DataVizDrawer** | KPI summary (drafts count, published count) and sparkline. |
| **AuditTrailPanel** | Collapsible panel showing run artifacts, logs, and diffs when a run ID is selected. |

## Data Flow

- **Content items** — `useContentItems({ filters, search, limit })` from `@/hooks/use-content-dashboard`. Data is normalized with `data ?? []` and `Array.isArray` guards.
- **Publishing queue** — `usePublishingQueue()`; retry via `useRetryPublish().mutate(id)`.
- **SEO insights** — `useSEOInsights(contentItemId?)`.
- **Agent recommendations** — `useAgentRecommendations()`.
- **Calendar move** — `useMoveContentCalendar().mutate({ id, scheduledAt })`; on success, content queries are invalidated.
- **Stage advance** — `useAdvanceContentStage().mutate(id)` for moving a draft to the next stage.

## Extending the Dashboard

### Adding a new panel

1. Create the component under `src/components/content-dashboard/` (e.g. `my-panel.tsx`).
2. Use the same card styling: `Card` with `border-white/[0.03] bg-card`, `CardHeader`/`CardTitle`, and `CardContent`.
3. Fetch data via a hook in `use-content-dashboard.ts` that uses `QUERY_KEYS` and invalidates on mutations as needed.
4. Add the panel to `ContentDashboardShell` in the grid (e.g. in the right column or a new row).
5. Export the panel from `src/components/content-dashboard/index.ts`.

### Adding a new data source (e.g. analytics)

1. Add API functions in `src/api/content-dashboard.ts` (and corresponding mocks in `content-dashboard-mock.ts`).
2. Add a query key in `QUERY_KEYS` in `use-content-dashboard.ts` and a `useX()` hook that returns `{ ...query, items: data ?? [] }` (or equivalent safe shape).
3. Use the hook in your panel; guard all array/object access with `?? []`, `Array.isArray()`, and optional chaining.

## Audit trail and run artifacts

- **Storage**: Run artifacts are fetched via `GET /api/audit/run/{runId}` (or mock). The AuditTrailPanel shows status, logs, and diffs for a given `runId`.
- **When a run is created**: Calendar move and other actions can trigger backend jobs that return a `runId`. The shell can set `selectedRunId` from that response and pass it to `AuditTrailPanel` to show the latest run.
- **Querying**: `useRunAudit(runId)` in `use-content-dashboard.ts` fetches the run artifact; the panel supports controlled `runArtifact`/`runId` from the parent or internal fetch when `runId` is provided.

## Runtime safety

All dashboard code follows:

- `const items = data ?? []` for Supabase/API array results.
- `(items ?? []).map(...)` or `Array.isArray(items) ? items.map(...) : []` before any array methods.
- `useState<Type[]>([])` for array state.
- `const list = Array.isArray(response?.data) ? response.data : []` for API responses.
- Optional chaining (`obj?.property`) and destructuring with defaults (`const { items = [] } = response ?? {}`).

## Design system

- **Colors**: `background`, `card`, `secondary`, `muted-foreground`, `primary` (accent #FF3B30), `teal`, `amber`, `purple` for charts and status.
- **Cards**: Dark elevated cards, `rounded-lg`, `border-white/[0.03]`, 16–20px padding, hover lift and shadow.
- **Spacing**: 8px baseline; gap-6 between sections; 16–20px card padding.
- **Typography**: Inter; headings 600–700, body 400, captions 300–400.
