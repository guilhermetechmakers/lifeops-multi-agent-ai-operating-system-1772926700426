# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Content Pipeline Automation

## Overview
Build an end-to-end Content Pipeline Automation system within LifeOps that enables ideation through publishing with LLM-assisted drafting, research, editing, scheduling, and publishing. The system integrates with publishing connectors (CMS, social platforms, email providers), supports collaborative editing and versioning, and offers a robust Content Dashboard, Content Library, Content Calendar, and Content Editor. All components must be resilient to null/undefined values, guard array operations, and follow the runtime-safety rules specified.

## Components to Build
1. Content LLM Adapter (module-local)
   - Purpose: Proxy requests to the canonical OpenAI API with content-specific constraints and safety checks.
   - Responsibilities:
     - Normalize inputs, apply content constraints (tone, length, safety filters, policy checks).
     - Rate-limit and retry with backoff; capture request/response traces for audit.
     - Enforce schema for prompts, variables, and outputs; validate OpenAI responses.
     - Expose a stable, module-local API surface for other modules (drafting, editing, SEO suggestions, summarization).
   - Interfaces:
     - draftContent({ idea, constraints, context }) -> Draft text
     - editContent({ draftId, edits, constraints }) -> Edited draft
     - researchAssist({ topic, depth, sources }) -> Research notes
     - seoSuggestions({ content, targetKeywords }) -> SEO plan and metadata
     - safetyCheck({ content }) -> pass/fail with rationale
   - Safeguards:
     - Must guard against null/undefined inputs and outputs.
     - Use data ?? {} or data ?? [] as appropriate.
     - Validate response shapes before downstream usage.

2. Content Dashboard Page
   - Overview panel aggregating all content pipelines.
   - Sub-widgets:
     - Content Calendar summary (upcoming publishes, slots)
     - Drafts in progress (list with status)
     - Publishing status (live, scheduled, failed)
     - Pending approvals queue
     - SEO/performance insights (basic KPIs, trends, SERP previews)
   - Data interactions:
     - Pulls from Content Library, Content Calendar, and Publishing Connectors.
     - Real-time appearance with optimistic UI where appropriate.
   - Actions:
     - Approve/reject, move to next workflow step, request revisions, re-run LLM prompts.
   - Design notes:
     - Align with the provided visual style (dark UI, elevated cards, dense data presentation).
     - Ensure all lists/arrays are guarded (e.g., (items ?? []).map(...) or Array.isArray(items) ? items.map(...) : []).

3. Content List / Library Page
   - Browse, filter, and search all content assets and published items with metadata and status.
   - Features:
     - Advanced filtering (status, author, topic, confidence score, publish date window, SEO score, platform).
     - Full-text search on content titles, bodies, summaries.
     - Metadata columns: title, status, author, last edited, publish date, SEO score, version.
     - Bulk actions: archive, move to draft, re-run LLM drafting, schedule re-publish.
   - Data handling:
     - Ensure all arrays are safely handled: const items = Array.isArray(data?.items) ? data.items : [].
   - Versioning:
     - Display version history per asset; allow viewing diffs and restoring prior versions if needed.

4. Content Calendar Page
   - Calendar-based scheduling UI for content items with publishing slots, drag-to-schedule, and conflict detection.
   - Features:
     - Monthly/weekly/daily calendar views.
     - Drag-and-drop scheduling of items into slots; detect conflicts with existing slots.
     - Timezone-aware scheduling; support for draft, scheduled, and publishing states.
     - Conflict detection logic with clear user feedback and resolution prompts.
     - Quick actions: reschedule, cancel schedule, toggle auto-publish windows.
   - Data handling:
     - Only schedule items with approved content and a ready-to-publish status.
     - Guard arrays and results: (slots ?? []).map(...) and Array.isArray(items) ? items : [].

5. Content Editor Page
   - End-to-end editor that supports idea → research → draft → edit → schedule → publish workflows with LLM-assisted writing, versioning, collaboration, and publishing integrations.
   - Features:
     - Idea capture area with lightweight brainstorming prompts.
     - Research pane integrated with live LLM-assisted notes and sources citation tracking.
     - Draft editor with real-time collaborative editing (operational transforms or CRDTs), version history, change tracking, and inline comments.
     - Editing tools: rewriter, summarizer, SEO optimizer, tone/style adjuster via Content LLM Adapter.
     - Versioning: create, view, compare, and revert versions; watermark drafts while in-progress.
     - Collaboration: mentions, comments, assignments, and audit trail per edit.
     - Publishing connectors: CMS publish, social platforms scheduling, email distribution.
     - Scheduling integration: push to Content Calendar with recommended publish date/time.
   - UX considerations:
     - Robust validation for inputs; guard all array methods and data access.
     - Ensure no null/undefined dereferences in editor pipelines.

## Implementation Requirements

### Frontend
- Frameworks: React (with TypeScript), state management via Redux or React Context, and server-state syncing (e.g., SWR, React Query).
- Architecture:
  - Feature-based modules with isolated state and reducers for content, calendar, and editor.
  - Reusable UI components following the design system (cards, panels, navigation, charts).
- Components to build:
  - Card: dark elevated container with gradient background and top icon.
  - ListView: generic list with safe mapping and virtualization if necessary.
  - DataTable: sortable, filterable, paginated list for Content Library.
  - Calendar: drag-and-drop scheduler with conflict detection visuals.
  - EditorPane: collaborative editor with version controls, diff view, and LLM controls.
  - Modals/Dialogs: Approvals, Revisions, Publishing confirmations.
  - LLM Controls: prompts, constraints, model selection, temperature, max tokens, safety toggles.
  - Connectors UI: CMS, social platforms, email provider connectors status and actions.
  - Activity/Audit Trail: logs with human-readable explanations and inter-agent trace references.
- Safety and guards:
  - All array operations guarded: (array ?? []).map(...), Array.isArray(array) ? array.map(...) : [].
  - Use appropriate defaults for useState:
    - const [items, setItems] = useState<any[]>([]);
    - const [drafts, setDrafts] = useState<ContentDraft[]>([]);
    - const [versions, setVersions] = useState<Version[]>([]);
  - Null checks before any nested property access: data?.items ?? [].
- Data validation:
  - Propagate validation errors to UI with clear messaging.
  - Normalize API responses: const list = Array.isArray(response?.data) ? response.data : [].

### Backend
- APIs (REST or GraphQL) to support:
  - Content idea, research notes, draft, edit, and publish workflows.
  - Draft/SEO requests via Content LLM Adapter.
  - Collaboration and versioning endpoints per asset.
  - Publishing connectors: CMS, social, email; webhooks for publish events.
  - Calendar events: slots, conflicts, scheduling actions.
  - Approvals queue management.
- Data Models (schemas):
  - ContentAsset
    - id, title, slug, status (idea/research/draft/review/scheduled/published/archived), authorId, createdAt, updatedAt
    - version: number, versions: Version[]
    - content: { idea, researchNotes, draft, editedDraft, seoMeta, summary }
    - publishInfo: { scheduledAt, publishedAt, platformStatus, connectors } 
    - seoScore, readability, wordCount, topics[]
  - Version
    - id, assetId, versionNumber, contentSnapshot, changedBy, changedAt, comments
  - CalendarSlot
    - id, publishDate, publishWindow, assetId, status
  - Approval
    - id, assetId, approverId, status, comments, createdAt, updatedAt
  - Connector
    - id, type (CMS, Social, Email), provider, config, status, lastSynced
  - AuditLog
    - id, assetId, action, actorId, timestamp, details
- Functions/Services:
  - LLMAdapterService: route requests to OpenAI API with constraint layer.
  - ContentWorkflowService: orchestrates idea → research → draft → edit → schedule → publish steps; handles versioning and approvals.
  - PublishingService: interface with CMS and other connectors; handles publish status and webhooks.
  - CalendarService: manage slots, conflicts, and rescheduling.
  - ValidationService: enforce schema validations, safety rails, and permission checks.
- Data Safety:
  - All inputs/outputs validated against schemas; use null checks, default values, and strict typing.
  - Audit trail must capture all user actions, generated prompts, and agent messages.

### Integration
- Communication Model:
  - Central orchestrator (LifeOps) enabling agent-to-agent messages with traceability.
  - Content LLM Adapter acts as a gateway for LLM-enabled actions.
  - Connectors expose publish endpoints; webhooks propagate publish events back into the system.
- Data Flow:
  - Idea → Research: content prompts to LLM Adapter; store results in ContentAsset. 
  - Draft → Edit: collaborative editor; each save creates a new Version.
  - Schedule: updates to ContentCalendar; conflicts flagged; approvals may be required.
  - Publish: invoke connectors; update asset status; push back to dashboard.
- Security:
  - Authentication/Authorization for all endpoints (RBAC with roles like Editor, Approver, Publisher, Admin).
  - Permissions checked before any state-changing operation (approve, publish, archive).
  - Audit logs immutable or append-only; ensure traceability.

## User Experience Flow
1. Ideation
   - User opens Content Dashboard → starts with an idea card or creates a new idea.
   - Idea captures title, brief, objectives, required tone; optional topics.
   - LLM Adapter suggests initial research questions and potential angles.
2. Research
   - User toggles to Research pane; prompts are sent to LLM Adapter for notes and sources.
   - Sources are stored, annotated, and linked to the idea.
3. Draft
   - User initiates Draft via LLM-assisted drafting; auto-generated draft appears with suggested outline.
   - Draft is saved as Version 1; user can accept/reject edits, request rewrites.
4. Edit
   - Editor collaborates in real-time; inline comments/claims are tracked.
   - SEO assistant suggests keywords, readability improvements, and meta descriptions.
5. Schedule
   - User drags content to a calendar slot in Content Calendar; conflict detection triggers if slot already taken.
   - If approval-required, item enters Approvals queue; otherwise auto-schedule.
6. Publish
   - User triggers Publish; content is pushed to configured CMS, social channels, and email providers.
   - Publish results captured; status updated in Dashboard; success/failure logs surfaced.
7. Post-publish
   - Performance/SEO insights update; audit logs show the complete run; user can initiate re-run or revisions.

## Technical Specifications

### Data Models (Schemas)
- ContentAsset
  - id: string
  - slug: string
  - title: string
  - status: 'idea' | 'research' | 'draft' | 'edit' | 'scheduled' | 'published' | 'archived'
  - authorId: string
  - createdAt: string (ISO)
  - updatedAt: string
  - publishInfo: {
      scheduledAt?: string
      publishedAt?: string
      platformStatuses: Record<string, 'pending'|'success'|'failed'>
    }
  - content: {
      idea: string
      researchNotes: string[]
      draft: string
      editedDraft: string
      seoMeta: {
        keywords: string[]
        metaDescription: string
        readability: number
      }
      summary?: string
    }
  - versionHistory: Version[]
  - topics: string[]
  - metrics: {
      wordCount: number
      readTime: number
      seoScore?: number
    }

- Version
  - id: string
  - assetId: string
  - versionNumber: number
  - contentSnapshot: string
  - changedBy: string
  - changedAt: string
  - notes?: string

- CalendarSlot
  - id: string
  - assetId: string
  - startAt: string
  - endAt: string
  - status: 'scheduled' | 'blocked' | 'released'

- Approval
  - id: string
  - assetId: string
  - approverId: string
  - status: 'pending' | 'approved' | 'rejected'
  - comments?: string
  - createdAt: string
  - updatedAt: string

- Connector
  - id: string
  - type: 'CMS' | 'Social' | 'Email'
  - provider: string
  - config: object
  - status: 'connected' | 'disconnected' | 'error'
  - lastSynced?: string

- AuditLog
  - id: string
  - assetId: string
  - action: string
  - actorId: string
  - timestamp: string
  - details: string

### API Endpoints

- Content LLM Adapter (module-local)
  - POST /llm/draft
    - body: { idea, constraints, context }
    - returns: { draft, promptsUsed, debugInfo }
  - POST /llm/edit
    - body: { draftId, edits, constraints }
    - returns: { editedDraft, changes }
  - POST /llm/research
    - body: { topic, depth, sources }
    - returns: { notes, sources }
  - POST /llm/seo
    - body: { content, targetKeywords }
    - returns: { seoMeta, recommendations }
  - POST /llm/safety-check
    - body: { content }
    - returns: { allowed: boolean, rationale }

- ContentAssets
  - GET /assets
    - query: { filter, sort, page, pageSize }
    - returns: { data: ContentAsset[], total }
  - GET /assets/{id}
  - POST /assets
    - body: { title, authorId, topics, ... }
    - returns: Created ContentAsset
  - PUT /assets/{id}
  - DELETE /assets/{id}

- Versions
  - GET /assets/{id}/versions
  - GET /assets/{id}/versions/{versionId}
  - POST /assets/{id}/versions
    - body: { contentSnapshot, changedBy, notes }

- Calendar
  - GET /calendar/slots
  - POST /calendar/slots
  - PUT /calendar/slots/{slotId}
  - DELETE /calendar/slots/{slotId}

- Approvals
  - GET /approvals
  - POST /approvals
  - PUT /approvals/{id}

- Connectors
  - GET /connectors
  - POST /connectors
  - POST /connectors/{id}/test
  - POST /connectors/{id}/publish

- Publish
  - POST /publish/{assetId}
  - POST /publish/{assetId}/retry

- Audit
  - GET /assets/{id}/audit

### Security
- Authentication: OAuth2/OpenID Connect or JWT-based; all endpoints require valid authentication.
- Authorization: Role-based access control (RBAC)
  - Editor: create/edit drafts, request revisions, schedule
  - Approver: approve/reject, manage approvals queue
  - Publisher: publish assets, manage connectors
  - Admin: manage connectors, system settings, audit logs
- Data validation: Strict server-side validation for all inputs; sanitize content to prevent injection.
- Logging: Audit trails for all user actions and system actions; traces for inter-agent communications.

### Validation & Runtime Safety
- Data Handling:
  - Always guard arrays: (data?.items ?? []) and Array.isArray(data?.items) ? data.items.map(...) : [].
  - Supabase-like expectations: use data ?? [] for results; default to empty arrays.
  - API responses: const assets = Array.isArray(response?.data) ? response.data : [].
  - Optional chaining and defaults for nested shapes: const seo = asset?.content?.seoMeta ?? {}.
- React state:
  - Initialize arrays: useState<ContentAsset[]>([]), useState<Version[]>([]), etc.
  - Avoid null returns in components; render loading/empty states gracefully.
- Destructuring with defaults:
  - const { items = [], count = 0 } = response ?? {};

### Acceptance Criteria
- [ ] LLM Adapter correctly enforces content constraints and safety checks; all responses validated against defined schemas.
- [ ] All frontend components guard array operations and use proper useState defaults; no runtime crashes due to undefined arrays.
- [ ] Content Editor supports real-time collaboration with version history and non-destructive edits.
- [ ] Content Calendar provides drag-and-drop scheduling with conflict detection and clear UX feedback.
- [ ] Publishing connectors successfully publish to CMS/Social/Email and reflect statuses in the dashboard.
- [ ] Approvals workflow enforces role-based access and maintains an auditable record.
- [ ] All API endpoints validate inputs and return well-formed shapes; error responses are consistent and descriptive.
- [ ] UI adheres to the specified design system, typography, color palette, and layout constraints.

## UI/UX Guidelines

Apply the project’s design system (dark UI, high-contrast typography, dense information architecture) with the following considerations:
- Card Design: 8–12px radius, gradient background, subtle inner highlight, 1px border with rgba(255,255,255,0.03), soft shadow, hover lift.
- Navigation: left-aligned vertical navigation with icons; active item shows left accent pill in #FF3B30 and a brighter icon.
- Data Visualization: minimal charts with muted gridlines; series colors from teal #00C2A8, amber #FFB020, purple #8B5CF6.
- Typography: Inter-like sans; section headings 20–28px, body 12–14px, microcopy 11–12px.
- Spacing: 8px baseline, 16/24/32 multiples; generous gutters between sidebar and content.

## Visual Style Summary (From the provided palette)
- Background: #0B0B0C
- Surfaces: #151718, #1F1F20
- Text: #FFFFFF (primary), #9DA3A6 (secondary), #56595B (disabled)
- Accent: #FF3B30
- Highlights: #CFCFCF, #E6E7E8
- Chart colors: teal #00C2A8, amber #FFB020, purple #8B5CF6
- Borders: rgba(255,255,255,0.03)
- Gradients: #111213 → #1A1A1B

## Deliverables
- Fully wired frontend pages: Content Dashboard, Content List/Library, Content Calendar, Content Editor.
- Backend services and REST/GraphQL endpoints with documented contracts.
- Content LLM Adapter module with a clean API surface and safety gate.
- Database schemas, migrations, and seed data to support initial use.
- Comprehensive test plan (unit, integration, end-to-end) with example test cases for:
  - LLM adapter safety checks
  - Calendar conflict handling
  - Versioning and diffs
  - Approvals workflow
  - Publishing connectors success/failure handling
- Runbook for deployment, monitoring, and rollback procedures.

If you need a ready-to-run starter repository, I can provide a seed project structure (monorepo) with:
- Next.js or Remix frontend
- Node/Express or Nest backend
- PostgreSQL with Prisma or TypeORM
- WebSocket/Socket.IO for real-time collaboration
- OpenAI API client with a pluggable adapter
- Example content assets and seed data

Would you like me to generate a boilerplate project scaffolding (file tree, package.json scripts, and initial code for the core modules) to accelerate your workflow?

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
