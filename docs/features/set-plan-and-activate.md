# Set plan and activate caremap

**Status:** Complete

## What it does

The modal behind the title row's CTA. Lists the caremap's plan items (one always-on mandatory item +
four optional on/off toggles), lets the user set a start date, and offers `Save as Draft` (applies
the plan without activating) or `Activate caremap` (applies the plan *and* flips the caremap to
Active with locked-in real + estimated start dates). Once active, the same modal reopens read-only
("View plan settings") with the date/toggles disabled and no submit buttons.

## Implementation notes

- Component: `SetPlanModal`. Plan content comes from `SET_PLAN_ITEMS` — a 5-item list (`sp1` "Assign
  Case manager", `sp3` "Record patient goals and whishes", `sp4` "Record treatment wishes", `sp5`
  "Record emergency records", `sp6` "Review PZP and existing advance directive" — `sp2` "Initial PZP
  conversation" was removed, see decision log). Only `sp1` has `toggle: false` (always included,
  shown as "Mandatory"); the other four have `toggle: true` (shown with a `ToggleField`) and all
  currently share `defaultOn: false` — nothing optional is pre-selected, so a fresh caremap's plan
  starts as just the Case Manager assignment until the GP deliberately switches items on.
- Local toggle state initializes from `caremap.planToggles` if already configured, else
  `defaultPlanToggles()`. Date input defaults to `"2026-08-12"` regardless of caremap creation date
  — not derived from anything.
- **Both** `Save as Draft` and `Activate caremap` call `mergePlanIntoActivities(activities, toggles)`
  followed by `syncCaseManagerActivity(...)` — this is the actual mechanism that populates/refreshes
  the Overview's To-do list. Activating additionally sets `status: "active"` and both start dates.
  See [docs/architecture.md](../architecture.md) § Key derived-state functions.
- `locked = caremap.status === "active"` disables every toggle/date input and hides the
  Save/Activate buttons, leaving only `Cancel`.

## Open questions

- The start-date input's default (`2026-08-12`) is a hardcoded placeholder, not tied to today's date
  or anything caremap-specific — fine for a demo, worth knowing if a "realistic default date" ever
  matters.
- No confirmation/warning shown before activating, even though the modal's own copy says "you will
  not be able to change it anymore" — activation is a single click with no undo.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Overview's 'To do' list is derived from the Set Plan
  config, not a separate list"
