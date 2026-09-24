# Activities: add/edit, status model, provider & assignee

**Status:** Complete

## What it does

Every activity (whether a plan-derived item or one added ad hoc) carries a status from a fixed
7-value model, each with its own associated input field(s). Activities can optionally be linked to a
provider organization and an assignee at that provider. Clicking any activity row opens an editor
that can change any of this at any time, including for mandatory plan items.

## Implementation notes

**Status model** (`STATUS_CONFIG`, see [docs/architecture.md](../architecture.md) § Data shape for
the full table): `undefined | required | planned | scheduled` = "todo" group; `completed | declined |
cancelled` = "resolved" group. `statusGroup(status)` is the single source of truth for which list an
activity shows up in — there's no separately stored category field to drift out of sync.

- `undefined` → no extra field
- `required` (labeled **"Requested"** in the UI) → `requiredMonth` (month picker)
- `planned` → `planningMonth` (month picker), badge tone `info` (translucent teal tint — the one
  badge that isn't a solid fill)
- `scheduled` → `scheduledDate` (date) **plus** `hour` + `location` (the only status with more than
  one extra field)
- `completed` / `declined` / `cancelled` → their own `*Date` field; rendered as an icon
  (`ResolvedIcon`: green check / red person-x / red X) instead of a badge on the row

`StatusFields` is the shared component that renders the Status `Select` + whatever field(s) the
current status calls for — used identically by both `AddActivityModal` and `EditActivityModal`.

**Add vs. edit**:
- `AddActivityModal` — progressive disclosure: only "Activity type" shows until one is picked, then
  everything else appears (Status, provider, assign-to, comment, "Add document" no-op). Single
  submit button, "Add Activity" — there used to be a second "Save as Draft" button that did the exact
  same thing; removed.
- `EditActivityModal` — everything visible at once, prefilled from the activity being edited. Shows a
  "mandatory plan activity" hint for plan-derived items but otherwise treats them identically to
  custom ones. Submit button: "Save".

**Provider & assignee** (`AssignToField`):
- Regular activities: picking a provider (`PROVIDERS` constant) populates "Assign to" from that
  provider's own staff (`staffForProvider`, filters `MEMBER_POOL` by `org`). Changing provider clears
  any already-picked assignee. No provider selected → "Assign to" is disabled with a hint.
- The row itself displays this as one line under the title: assignee + provider joined by `·` when
  both are set, provider alone if only that's set, `"Unassigned"` as the fallback — computed in
  `ActivityRow` as `assignedLine`.
- The **"Assign Case manager"** task is a special case with its own rules — see
  [assign-case-manager-task.md](assign-case-manager-task.md).

**Auto-population from the plan**: see
[set-plan-and-activate.md](set-plan-and-activate.md) — `mergePlanIntoActivities` /
`syncCaseManagerActivity` are what actually create/update plan-derived activity entries; this file
only covers the per-activity editing UI once an activity exists.

## Open questions

- The `link` field (used for the two questionnaire-style plan items' "Breast cancer questionnaire" /
  "Holistic Needs Assessment" sub-links) is never actually set by any current UI — those two
  `SET_PLAN_ITEMS` entries don't exist in the live `SET_PLAN_ITEMS` list anymore, so `activity.link`
  is effectively dead code right now. Worth confirming whether questionnaire-linked activities are
  still an intended feature before removing it.
- `warning` badge tone is declared in `Badge` but nothing currently uses it (Planned uses `info`
  instead). Harmless, but a future full pass could drop it if it stays unused.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Built a full 7-status model...", "Resolved activities show
  a status icon...", "Pixel-matched the activity-row component...", "'Assign to' is driven by the
  selected provider...", "Dropped the redundant 'Save as Draft' button...", "Renamed the 'Required'
  status label to 'Requested'"
