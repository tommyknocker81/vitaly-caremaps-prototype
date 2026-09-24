# Notification center

**Status:** Complete

## What it does

A top-level "Notifications" screen (Sidebar nav item + the TopHeader bell icon, both previously
inert) showing simulated notifications for whichever persona is currently active. Two events
generate one: assigning a task or team role to somebody, or sending a message via the caremap's
Messages tab (either a brand-new thread or a reply). Assign an activity or the Case Manager role —
or send/reply to a message — to/with a member who happens to be one of the two switchable staff
personas (Mary Brown, Mike Myers — see [persona-switcher.md](persona-switcher.md)), then switch to
that persona, and the notification is there — same "different roles see different slices of the same
data" idea the persona switcher already demonstrates elsewhere in the app.

Two tabs (Unread / All), a list on the left, a detail panel on the right. The Sidebar's Notifications
item and the TopHeader bell both show a small red dot when the current persona has unread
notifications. An assignment notification's detail shows a "View caremap overview" button, taking you
straight to the (one, live) caremap's Overview tab. A message notification's detail instead shows the
**entire live thread** right there (every message exchanged so far, not just the one that triggered
this particular notification), plus an "Open in Messages" button that jumps straight into the
Messages tab with that exact thread already selected, ready to reply.

Starts pre-seeded with two notifications each for Mary Brown and Mike Myers (one read, one unread)
so the screen has content from the first run instead of an empty inbox — see `SEED_NOTIFICATIONS`
below. Everything generated live during the session (by actually assigning a task or role) works
exactly the same as before and simply prepends onto that seed list.

## Implementation notes

- Root state: `notifications`, an array of `{ id, recipientId, kind, title, body, createdAt, read }`
  plus, for message notifications only, `threadId` and `senderName`. `kind` is `"assignment"` or
  `"message"` — drives both the list row's icon/sender label and which layout `NotificationDetail`
  renders (see below). `recipientId` is a `MEMBER_POOL` id — works directly as a persona filter
  because `PERSONAS`' two staff entries reuse their `MEMBER_POOL` id as `persona.id` (see
  `persona-switcher.md`). Persisted in the same `localStorage` bundle as `screen`/`caremap`/
  `personaId` (see [demo-persistence.md](demo-persistence.md)); "Reset demo" restores it to
  `SEED_NOTIFICATIONS` rather than clearing it to `[]`, matching every other reset-to-a-real-default
  in this app rather than reset-to-empty.
- `SEED_NOTIFICATIONS` (module-level, same shape as a live one — `id`s just start with `seed-`
  instead of `notif-`, all `kind: "assignment"`) is the initial value both on first load (no saved
  demo state yet) and after Reset demo. Content ties into other mock data already in the file rather
  than being invented from scratch: the Mary Brown "Case manager" role notification and "Treatment
  summary appointment" task notification match what `MOCK_CAREMAPS`/`MOCK_TASKS` already assert for
  KLEIN, Calvin and BAUER, Fredric; Mike Myers' physiotherapy notifications reuse `MOCK_TASKS`'
  otherwise-unassigned MATT EVANS, Leroy row and `MOCK_CAREMAPS`' KOWALSKA, Anna. (`MOCK_CAREMAPS`/
  `MOCK_TASKS` are static display-only lists that nothing else reads or writes, so this is a one-way
  narrative borrow, not a data dependency.) No seeded message notifications — the messaging feature
  and its notifications both start empty, same as `caremap.messageThreads` itself.
- `notifyAssignment(recipientId, title, body)` (root) appends a `kind: "assignment"` notification; a
  no-op if `recipientId` is falsy (e.g. "unassign"). Called from three places, each comparing the
  *previous* value to the new one first so notifications only fire on an actual new assignment, not
  every edit: `handleAssign` (team role — Case Manager or any other role), `addActivity` (a
  brand-new activity created with an assignee already set), `updateActivity` (an existing activity's
  assignee changed).
- `notifyMessage(recipientId, title, body, threadId, senderName)` (root) is `notifyAssignment`'s
  sibling for `kind: "message"` notifications. Called from both `startMessageThread` (a new thread's
  first message) and `replyToThread` (any reply) — every message sent notifies whichever thread
  participant *didn't* just send it, resolved from the thread's `participants` (stored as names) via
  `PERSONAS.find(p => p.name === ...)`. `title` follows the same `` `${subject} — ${sender}` ``
  pattern `notifyAssignment`'s titles use.
- `NotificationsScreen` (new, reuses `Sidebar`/`TopHeader` like `Px360Screen` does) filters
  `notifications` to `recipientId === persona.id` first, then further by tab. Selecting a
  notification marks it read (`onMarkRead`) — deliberately looked up from the *unfiltered*
  per-persona list (`mine`), not the tab-filtered one (`tabList`): looking it up in `tabList` was an
  early bug where marking an item read while on the Unread tab immediately dropped it out of that
  same list, which also erased the selection and blanked the detail panel right as it should have
  been showing it.
- Nothing is auto-selected on mount or on tab switch (also fixed during this build) — the initial
  fallback (`tabList[0]`) meant the single unread notification got auto-marked-read (via the
  mark-on-select effect) before the user ever saw it sitting in the Unread tab.
- `unreadCount` (root, `notifications.filter(recipientId === personaId && !read).length`) and
  `onOpenNotifications` (`() => setScreen("notifications")`) are threaded through every screen that
  renders `TopHeader`/`Sidebar` (`Px360Screen`, `CaremapDetail`, `CaremapsListScreen`,
  `TasksListScreen`) the same way `onSwitchPersona`/`onReset` already were.
- Notification title/body are plain English strings baked in at creation time, not `t()`-translated
  — same scoping call as PX360's ported content: naive word-by-word Dutch translation of a freely
  composed sentence like "You've been assigned X on Y for Z" reads badly, and the screen's own chrome
  (tab labels, empty states) is translated normally.
- **"View caremap overview"** (`NotificationDetail`) always leads to the one live caremap
  (`onOpenCaremap`, root: `() => setScreen(caremap ? "detail" : "start")`), never a
  notification-specific one — this app only ever has one real, navigable caremap (De Vries, Jan's),
  even though several `SEED_NOTIFICATIONS` bodies mention other, purely-decorative mock patients
  (KOWALSKA, Anna; BAUER, Fredric — see their own note above) that have no caremap object to open.
  Rather than build real caremaps for those mock patients (well beyond what was asked), every
  notification points at the same single live caremap, consistent with how the rest of the app
  already treats "De Vries, Jan" as the only interactive patient. The button is always shown —
  originally it was omitted when there was no live caremap yet (e.g. right after Reset demo, since
  seed notifications persist through a reset but `caremap` resets to `null`), reasoning that landing
  on a blank `"detail"` screen (which renders nothing without a `caremap`) would be a dead link. In
  practice a *missing* button read as "this doesn't work" rather than a deliberate absence, so it's
  unconditional now and falls back to the HIS/EMR start screen (`"start"`) — a real, useful
  destination (it's where "Create new caremap" lives) — instead of hiding.
- **Notification titles are specific, not generic.** Originally every notification's `title` was a
  fixed category string ("New task assigned" / "New role assigned"), shown as the bold line in the
  list — meaning you had to open each one just to see what it was about. `title` is now built as
  `` `${activityTitleOrRoleLabel} — ${patientName}` `` (e.g. "Physiotherapy — MATT EVANS, Leroy"),
  both in `notifyAssignment`'s three call sites and in `SEED_NOTIFICATIONS`, so the list itself
  answers "what do I need to do, and for whom" without opening anything. `body` (the fuller sentence
  shown once opened) is unchanged.
- **Message notifications show the live thread, not a frozen snapshot.** `NotificationDetail` looks
  the thread up fresh by `notification.threadId` in `caremap.messageThreads` every time it renders,
  rather than storing a copy of the messages at notification-creation time — so opening an old
  notification from a conversation that's since grown several more replies still shows the whole,
  current exchange (every `MessageBubble`, reusing the exact component the Messages tab itself uses),
  not just the one message that originally triggered it. Falls back to the generic
  Bell/"Vitaly Assistant"/body/"View caremap overview" layout if the thread can't be found (e.g. a
  dangling `threadId` after some future change wipes `messageThreads` independently of
  `notifications` — doesn't happen today, since Reset demo clears both together).
- **List-row identity differs by `kind`.** Assignment notifications keep the existing system framing
  (Bell icon, "Vitaly Assistant" as sender) since they're generated by the app itself, not a person.
  Message notifications show a `MessageSquare` icon and the actual sender's name (`senderName`,
  captured at send time) instead — reads as "who actually messaged me," which an assignment
  notification has no equivalent of.
- **"Open in Messages" deep-links straight to the specific thread**, not just the Messages tab in
  general. Root state `openThreadId` (nullable, set by the notification's "Open in Messages" button
  right before navigating to `"detail"`) is read once by `CaremapDetail` at mount — into its own
  `tab` state's initializer (`"messages"` instead of `"overview"` when set) and passed down to
  `MessagesTab` as `initialSelectedId` (also only read once, into `MessagesTab`'s own `selectedId`
  initializer). `CaremapDetail` clears `openThreadId` back to `null` at root in a mount-only effect
  right after reading it, so a later, unrelated visit to `"detail"` (e.g. from the HIS start screen)
  can't inherit a stale thread-open request — relies on `CaremapDetail` always fully
  unmounting/remounting on every `"detail"` navigation (true today, since `screen` values are
  mutually exclusive), not on any explicit reset elsewhere.

## Open questions

- Task/role assignment and messages are the only two events that generate a notification. No other
  event type (comments, caremap status changes) does — not asked for, and the reference screenshot's
  rich "New referral received" style history was treated as a layout reference only, not a content
  requirement.
- No i18n for notification title/body content, or for message subjects/text (see above) — all
  freely-typed by the user at send time in the Messages case, so translation was never on the table
  for those; assignment titles/bodies stay the earlier scoping call.
- "View caremap overview" (assignment notifications) always opens the one live caremap regardless of
  which patient a notification's body mentions (see above) — fine for this single-patient prototype,
  but would need real per-patient routing if this app ever supported more than one.
- When there's no live caremap yet, both the "View caremap overview" and "Open in Messages" buttons
  land on the HIS start screen rather than their nominal destination (there isn't one to show) —
  technically not what either button's own label says, but the narrowest window this can happen in
  (right after Reset demo, before creating a caremap) made a perfectly-accurate label not worth the
  extra conditional text. For "Open in Messages" specifically this is somewhat moot in practice: a
  message notification can't exist without a caremap, since `caremap.messageThreads` is where threads
  live — Reset demo clears both together.
- Every message sent (not just the first one in a thread) generates its own notification — an active
  back-and-forth conversation produces one notification per reply, same as a real messaging app,
  rather than being batched or deduplicated per thread.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Added a notification center, driven by task/role
  assignment", "Notifications link to the caremap overview", "Messages now generate notifications,
  showing the whole live thread"
