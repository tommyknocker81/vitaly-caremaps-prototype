# "Assign Case manager" task (special-cased activity)

**Status:** Complete

## What it does

The `sp1` plan item ("Assign Case manager") is an activity like any other, but its edit modal is
narrower than a regular activity's: no provider field, and its "Assign to" dropdown only offers
people plausible as a case manager (GPs and community nurses), not the full staff roster or a
provider-filtered subset.

## Implementation notes

- `EditActivityModal` checks `activity.id === CASE_MANAGER_ACTIVITY_ID` (`"sp1"`) and, when true:
  - skips rendering the "Select provider" `Field` entirely
  - passes `members={CASE_MANAGER_CANDIDATES}` to `AssignToField` instead of `provider={provider}`,
    which makes it source from a fixed list rather than `staffForProvider`
  - forces `provider: ""` in the saved payload regardless of local state, so no stale provider value
    can persist on this activity
- `CASE_MANAGER_CANDIDATES = MEMBER_POOL.filter(m => ["GP", "Community Nurse"].includes(m.jobTitle))`
  — currently resolves to 4 people (Mary Brown, Dr. Mark Southerland, James Wilson, Anna de Boer).
- `AssignToField` gained a `members` override specifically to support this (see
  [activities-and-status-model.md](activities-and-status-model.md)) — any future activity that needs
  a fixed, non-provider-driven candidate pool can reuse the same prop rather than inventing a new
  mechanism.
- **This task's own assignee is independent of the actual Case Manager team-role assignment.**
  Picking someone here does *not* set them as the caremap's Case Manager (that only happens via
  `AssignRoleModal`, see [team-tab-and-roles.md](team-tab-and-roles.md)) — and conversely, assigning
  the real Case Manager role auto-resolves this task's *status* to Completed
  (`syncCaseManagerActivity`) without touching this task's `assigneeId`. The two "assign the case
  manager" actions are cosmetically similar but functionally separate right now.

## Open questions

- The independence noted above (task assignee vs. team role) hasn't been explicitly raised with the
  user — it wasn't part of the "no provider, case managers only" request, but it's a real gap if this
  task is ever expected to *be* the mechanism for assigning the Case Manager role rather than a
  parallel, cosmetic echo of it. Worth confirming intent before touching it further.

## Related decisions

- [docs/decisions.md](../decisions.md) — "'Assign Care manager' is a special-cased task: no provider
  field, curated candidate pool"
