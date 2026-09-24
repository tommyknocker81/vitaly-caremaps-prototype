# Overview tab

**Status:** Complete

## What it does

The caremap's main landing view: a title row (name, care focus, primary CTA), a status bar
(Draft/Active), the Activities list (To do / Resolved), a Team summary card, and two disabled stub
cards (Clinical Consultant, Emergency Contact). There used to be a separate `Activities` tab
rendering this exact same body — it was removed as a redundant duplicate of Overview (see decision
log). A third stub card, Additional Information, was removed outright per user request; see decision
log.

## Implementation notes

- Rendered by `CaremapDetail` when `tab === "overview"`, as a 3-column grid: `ActivitiesPanel` takes
  2 columns, the right column stacks `TeamSummary` + the two remaining `StubCard`s.
- **Activities list is not independent data** — it's the live `caremap.activities`, which is kept in
  sync with the Set Plan modal's mandatory/toggle config (see
  [set-plan-and-activate.md](set-plan-and-activate.md)) rather than being its own separate mock list.
  This was a correction partway through the build; see the decision log.
- Empty state: before the plan has ever been saved (`!caremap.planConfigured && activities.length ===
  0`), `ActivitiesPanel` shows "It looks like you haven't added any active tasks..." with an inline
  `Set plan and activate` link/button instead of the To-do/Resolved lists.
- `TeamSummary`'s own empty state — an inline "Mandatory" Case Manager row with an "Assign a case
  manager" button, not a separate placeholder box — is independent of the activities empty state. It's
  driven specifically by whether the Case Manager role has a `memberId`, and disappears the moment it does
  (replaced by a normal member row), even if activity-assigned people (`extraActivityAssignees`) are
  also showing. The caremap's creator (`caremap.createdBy`, a fixed GP row, not a `team[]` role) is
  always rendered regardless of this empty state, and every row (creator, Case Manager, other roles,
  activity assignees) opens a read-only member-detail popup on click. See
  [team-tab-and-roles.md](team-tab-and-roles.md) for how that list is built.
- Status bar: `Status: Draft` (gray badge) before activation; `Status: Active` (green badge) +
  `startDate` (a DMY string) after. Used to also show a second "Start date … (Estimated)" field
  (`estimatedStartDate`, start + 2 months) — removed; see decision log.
- The two remaining `StubCard`s are permanently non-interactive (`disabled` CTA buttons) — not wired
  to anything, by design, per the original brief's scope. A third, "Additional Information," was
  removed outright rather than kept as an inert stub — see decision log.
- **"My tasks" / "All tasks" toggle** (`TaskFilterToggle`, Figma node 13276:179528) sits next to the
  "To do" heading and filters both the To-do and Resolved lists to `activity.assigneeId ===
  persona.id` when set to "My tasks". Defaults to "All tasks" for everyone — a `useEffect` keyed on
  `[persona.id]` resets it to that default on every persona switch, so a manual pick on one persona
  doesn't leak into the next, but otherwise a manual click just sticks. This was originally a
  per-persona default (the caremap's assigned Case Manager got "All tasks", everyone else got "My
  tasks") — simplified to one universal default per user feedback once it existed; see decision log.

## Open questions

- None currently open on this screen specifically.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Overview's 'To do' list is derived from the Set Plan
  config, not a separate list", "Overview shows a true empty state until the plan has been saved at
  least once", "Pixel-matched the activity-row component to the Figma dev-mode spec exactly",
  "Removed the estimated start date from the status bar", "Added a My tasks / All tasks toggle to
  the Activities panel, defaulted by the caremap's own Case Manager assignment", "Simplified the My
  tasks / All tasks default to All tasks for everyone", "Removed the Additional Information stub card"
