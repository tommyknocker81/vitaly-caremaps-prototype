# Architecture

Everything lives in `src/CaremapsPrototype.jsx` (~1,420 lines), rendered by `src/main.jsx`. This
document maps what's actually in that file today. See the "Splitting it up later" section at the
bottom for how it could be decomposed — not a recommendation to do it now.

## Screen flow

The root component (`CaremapsPrototype`, default export) holds seven top-level `screen` states:

```
"start"         → <HISShell>       the legacy-HIS app picker; only the Caremaps card is interactive
"list"          → <CaremapsListScreen>  the Caremaps nav destination (cross-patient list)
"tasks"         → <TasksListScreen>     the Tasks nav destination (cross-patient list)
"detail"        → <CaremapDetail>  the caremap itself, once one exists
"px360"         → <Px360Screen>    the native-ported Patient 360 / Encounters view (see below)
"documents"     → <DocumentsScreen> the native-ported Patient 360 / Documents view (see below)
"notifications" → <NotificationsScreen>  simulated notifications for the active persona (see below)
```

There is no router. Navigation goes through `handleNavigate(label)` (fired by `Sidebar`'s logo/nav
items and `PatientBar`'s tabs alike) or direct `setScreen(...)` calls, and there is at most one
caremap in memory at a time (`caremap` state is `null` until `Create Caremap` is submitted).

### `HISShell` (start screen)

- `<LegacyEHRPanel>` — static, non-interactive left-hand mock of the Dutch legacy EHR chrome
  (Dutch labels, hardcoded De Vries, Jan patient data, unified with the rest of the app). Pure
  scenery, no props, no state. `<HISChromeBar>` sits above it and the Vitaly panel both, mimicking
  the host HIS's own outer window chrome.
- Right side: the "Choose the application you would like to open" picker. Four `<AppRow>`s (ACP,
  MDT, Px360, Caremaps) — only the Caremaps row's `Create new caremap` button is wired
  (`onCreate` → opens the `create` modal). The other three rows render disabled buttons.
  `Show (1) active caremap` appears once `caremap` is non-null and jumps straight to `"detail"`.

### `Px360Screen` (PX360 tab)

A native port of the sibling `vitaly-encounters-prototype` repo's Patient 360 / Encounters
simulation — reuses this app's own `Sidebar`/`TopHeader`/`PatientBar` rather than that repo's own
duplicate shell (see [features/px360-tab.md](features/px360-tab.md) for the full rationale).
Reachable via `PatientBar`'s PX360 tab from anywhere `PatientBar` renders; its own "Back" goes to
`"start"`, same as `CaremapDetail`'s. Now translated the same way as the rest of the app.

### `DocumentsScreen` (DOCUMENTS tab)

A native port of the sibling `vitaly-documents-prototype` repo's Patient 360 / Documents view — same
chrome-reuse treatment as `Px360Screen` (see [features/documents-tab.md](features/documents-tab.md)).
Reachable via `PatientBar`'s DOCUMENTS tab; "Back" goes to `"start"`. Built bilingual from the start
(unlike PX360's initial English-only ship), and its 3 mock sources are scripted to always succeed —
no failed-fetch state exists on this tab, unlike PX360's Encounters.

### `NotificationsScreen` (Notifications)

Reachable via Sidebar's "Notifications" item or the TopHeader bell (both previously inert) from any
screen. Shows simulated notifications — the only kind generated is a task/role assignment — filtered
to whichever persona is currently active; see [features/notifications.md](features/notifications.md).

### `CaremapDetail` (the caremap itself)

Owns its own `tab` state (`"overview" | "pzp" | "questionnaires" | "comments" | "team" | "messages"`,
default `"overview"` — `"activities"` was a real value once but that tab was removed as a duplicate of
Overview). Renders, top to bottom:

1. `<Sidebar>` + `<TopHeader>` + `<PatientBar>` — static chrome, no per-caremap data
2. Title row: `caremap.title`, `caremap.careFocus`, and the primary CTA (`Set plan and activate`
   when draft, `View plan settings` when active — both open the same `SetPlanModal`)
3. Tab strip (`TABS` constant) with a Framer Motion `layoutId` underline on the active tab
4. A status bar (`Status: Draft` badge, or `Status: Active` + both start dates once activated)
5. Tab body:
   - **`overview`** — `<ActivitiesPanel>` (2/3 width) + a right column of `<TeamSummary>` (includes
     the fixed "created by" GP row) + three `<StubCard>`s (Clinical Consultant, Emergency Contact,
     Additional Information — the first two become real cards once filled in, Additional Information
     stays a permanently disabled placeholder)
   - **`pzp`** renders `<PzpTab>` — a left section list + right detail-fields panel, static authored
     content (see [features/pzp-tab.md](features/pzp-tab.md))
   - **`team`** renders `<TeamTab>`
   - **`comments`** renders `<CommentsTab>`; **`messages`** renders `<MessagesTab>`
   - **`questionnaires`** is the only tab still rendering the generic "Not part of this prototype"
     placeholder block

So functionally there are six real tab bodies and one stub tab (`questionnaires`).

## Modal state machine

One `modal` state string on the root component gates which modal renders (`null` when none open):

| `modal` value | Component | Opened from |
|---|---|---|
| `"create"` | `CreateCaremapModal` | Caremaps row's `Create new caremap` |
| `"setPlan"` | `SetPlanModal` | Title row CTA (draft or active) |
| `"assign"` | `AssignRoleModal` | `Add team members` (Overview), Team tab's role cards, or the `+` on the Team tab header |
| `"addActivity"` | `AddActivityModal` | Activities panel's `+` button |
| `"editActivity"` | `EditActivityModal` | Clicking any activity row |

Two extra pieces of root state track *which* thing a modal is acting on:

- `assignFixedRole` — the role label `AssignRoleModal` is locked to (e.g. `"Case manager"`), or
  `null` for an open-ended "pick any role" assignment (used by the Team tab's generic `+` and the
  "Others" empty-slot card)
- `editingActivityId` — which activity `EditActivityModal` is editing; the actual activity object is
  looked up fresh from `caremap.activities` each render (`editingActivity`), so edits always reflect
  latest state

All five modals are plain conditionally-rendered JSX (`{modal === "x" && <X />}`) — no portal
library, no animation on open/close (see `docs/ui-patterns.md`).

## Data shape

One `caremap` object in root state (`null` until created):

```js
{
  unit, template,              // from CreateCaremapModal, only used to build the title
  title,                        // `${template} Caremap`
  careFocus,                    // static string, same for every caremap
  status: "draft" | "active",
  startDate,                    // set on activation, a DMY string (e.g. "28/7/2026")
  planConfigured: boolean,             // true once Set Plan has been saved at least once (draft or active)
  planToggles: { [SET_PLAN_ITEMS id]: boolean },  // current toggle state for the two optional plan items
  activities: [ ...Activity ],
  team: [ ...TeamRole ],
}
```

**Activity** (plan-derived items and user-added ones share one shape):

```js
{
  id,                          // "sp1", "sp3".."sp6" for plan items, "a-<timestamp>" for custom ones
  title,
  cadence,                     // display string, e.g. "(1/1)", "(1/5)"
  status,                      // one of the 7 STATUS_CONFIG keys — see below
  mandatory: boolean,          // plan items only; true when the item has no on/off toggle
  sub,                         // plan items only; the static "Due: X" / "At activation" fallback label
  assigneeId,                  // MEMBER_POOL id or null
  provider,                    // string from PROVIDERS, or "" — always "" for the Case Manager task
  comment,
  link,                        // questionnaire items only (never actually set by any current UI path)
  // status-specific fields, only the ones relevant to the current status are populated:
  requiredMonth, planningMonth, scheduledDate, hour, location,
  completedDate, declinedDate, cancelledDate,
}
```

Status model (`STATUS_CONFIG`): `undefined | required | planned | scheduled` are the "todo" group;
`completed | declined | cancelled` are "resolved". Each status carries a display `label` (note:
`required`'s label is **"Requested"**, not "Required" — the internal key wasn't renamed, only the
copy), a badge `tone`, and (except `undefined`) an associated field spec (`{ key, label, type }`)
that `StatusFields` renders dynamically. `scheduled` additionally reveals Hour + Location inputs
(`extra: true`).

**TeamRole**:

```js
{ id, label, group: "mandatory" | "others", memberId }
```

Seeded on caremap creation with exactly one entry: the mandatory Case Manager slot
(`memberId: null`). Every other role (Community nurse, Oncologist, etc.) is created on demand the
first time someone is assigned to it, via `AssignRoleModal`'s free-text role picker.

**MEMBER_POOL** — a flat, module-level array of 13 mock people (`{ id, name, jobTitle, org, email }`)
that every "assign someone" UI in the app draws from, filtered differently depending on context:

- `staffForProvider(provider)` — filters by `org === provider`, used for regular activity assignment
- `CASE_MANAGER_CANDIDATES` — filtered to `jobTitle ∈ {"GP", "Community Nurse"}`, used only by the
  "Assign Case manager" task
- `AssignRoleModal` shows the full unfiltered pool (with a job-title dropdown filter + free-text
  search) for team-role assignment

### Key derived-state functions

These aren't stored — they're recomputed from `activities`/`team` wherever needed, which is what
keeps the plan config, the team, and the activity list from drifting out of sync with each other:

- `mergePlanIntoActivities(activities, toggles)` — rebuilds the plan-derived slice of `activities`
  from `SET_PLAN_ITEMS` + current toggles, preserving any status already set on existing items and
  leaving custom (non-plan) activities untouched. Called by both `saveDraft` and `activatePlan`.
- `syncCaseManagerActivity(activities, team)` — flips the `"sp1"` ("Assign Case manager") activity to
  `completed` the moment the team's Case Manager role has a `memberId`. Called after every team
  assignment and every plan save/activate.
- `extraActivityAssignees(activities, team)` — anyone with an `assigneeId` on some activity who isn't
  already a formal team member; used to render the "Assigned via activities" rows/cards in both
  `TeamSummary` and `TeamTab`.

## Splitting it up later

If this file keeps growing, the natural seams (based on the section comments already in the file)
are:

- `components/chrome/` — `Sidebar`, `TopHeader`, `PatientBar`, `HISShell`, `LegacyEHRPanel`, `AppRow`
- `components/ui/` — `Badge`, `Btn`, `Modal`, `Field`, `Select`, `ToggleField` (the generic building
  blocks, currently used across every screen)
- `components/modals/` — the five modal components, which already only depend on props + the shared
  `Field`/`Select`/`AssignToField`/`StatusFields` primitives
- `components/team/` — `TeamMemberRow`, `TeamSummary`, `RoleCard`, `AssigneeCard`, `TeamTab`
- `components/activities/` — `ActivityRow`, `ActivitiesPanel`, `ResolvedIcon`, `StatusFields`
- `data.js` — `MEMBER_POOL`, `SET_PLAN_ITEMS`, `STATUS_CONFIG`, `PROVIDERS`, `ROLE_POOL`, etc., plus
  the derived-state helper functions
- `tokens.js` — the `T` design-token object

This isn't urgent — a single file has kept edits easy to reason about across a long series of
targeted changes so far, and premature splitting would mean more files to keep in sync for very
little payoff at this size. Revisit if the file crosses somewhere around 2,000+ lines or multiple
people start working on it concurrently.
