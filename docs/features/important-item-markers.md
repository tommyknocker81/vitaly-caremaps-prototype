# Important-item markers

**Status:** Complete

## What it does

A small red dot flags "something important is hiding here" in two places: on the caremap's own
**Comments** and **Messages** tab labels (when there's an important-flagged comment, or a message
thread marked critical that's still unresolved), and on the live patient's row in the cross-patient
**Caremaps** list — so you can spot a caremap with something urgent without opening it first.

## Implementation notes

- Two small helpers, `caremapHasImportantComment(caremap)` and `caremapHasUrgentMessage(caremap)`
  (module-level, right above `CaremapDetail`), are the single source of truth for what counts as
  "important" — used by both the tab-strip dots and the Caremaps-list row marker, so the two surfaces
  can't drift out of agreement about what they're flagging.
  - A comment counts if `comment.important` is set (the existing "Mark as important" checkbox in
    `CommentsTab` — no new data). Comments have no resolved state, so an important comment keeps
    flagging indefinitely — there's no way to "clear" it today.
  - A message thread counts only if it's `critical` **and not** `resolved` — a critical thread that's
    since been resolved has already been dealt with, so it stops flagging once resolved (verified
    live: resolving the one critical thread in a session removed the Messages tab's dot immediately,
    while an important comment kept the Comments tab's dot lit, since comments have no equivalent
    "handled" state to key off).
- **Tab strip**: `CaremapDetail`'s `TABS.map` renders a `w-2 h-2 rounded-full bg-red-500` dot next to
  the "Comments"/"Messages" label when the respective helper returns true — placed before Comments'
  existing blue unread-count badge, not replacing it (the count badge says "how many," the red dot
  says "and one of them needs attention").
- **Caremaps list**: `CaremapsListScreen` computes `liveRow.important` the same way (only the live
  row can ever be `true` — `MOCK_CAREMAPS` rows have no real `comments`/`messageThreads` to check,
  so they're never flagged), and `CaremapListRow` renders a small red dot in the top-right corner of
  the patient's `GenderAvatar` (same `-top-0.5 -right-0.5` corner-badge convention used elsewhere in
  this app, e.g. the Sidebar's notification-bell dot) when `row.important` is set. `GenderAvatar`
  itself wasn't changed — the dot is an absolutely-positioned sibling in a `relative` wrapper added
  only at this one call site, so `TaskListRow`'s separate `GenderAvatar` usage is unaffected.

## Open questions

- Only the live caremap can ever show the Caremaps-list marker — the decorative `MOCK_CAREMAPS` rows
  have no real comments/messages, so there's nothing to check for them.
- No equivalent marker on the Tasks list or Notifications screens — not asked for.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Added important-item red-dot markers to Comments/Messages
  tabs and the Caremaps list"
