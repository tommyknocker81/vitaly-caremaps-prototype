# Team tab, roles, and role assignment

**Status:** Complete

## What it does

Two views of the same underlying `caremap.team` data:

- **Overview's Team card** (`TeamSummary`) — a compact stacked list, shown alongside the Activities
  panel.
- **Team tab** (`TeamTab`) — the full picture: creator, Case Manager, any other role, and anyone
  picked up via an activity assignment, all together in one wrapping card grid with a single "TEAM"
  heading — no "Created by"/"Mandatory"/"Others"/"Assigned via activities" section labels (see Figma
  node `12998:10352`, and the decision log below).

Both surface three categories of person: the **creator** (the GP who created the caremap, always
present, fixed — see below), formally assigned **team roles** (Case Manager, plus any open-ended
role like "Community nurse" or "Oncologist" added via "Add additional roles"), and anyone who's
picked up a task via an **activity assignment** without ever being formally added to the team. The
Case Manager is visually the most prominent person shown, everywhere they appear.

## Implementation notes

- **Creator**: `caremap.createdBy: { name, jobTitle }`, set once in `createCaremap` to
  `CURRENT_USER_NAME`/"GP". It's fixed metadata, not a `team[]` role — no assign/reassign button,
  can't be reassigned or removed. Rendered via `TeamMemberRow` (Overview, plain row, always last) and
  `AssigneeCard` (Team tab, first card in the one flat grid, with the caption overridden to "Created
  this care map" instead of `AssigneeCard`'s default "Assigned via activity").
- `TeamRole` shape: `{ id, label, group: "mandatory" | "others", memberId }`. Only one mandatory slot
  exists (Case Manager), seeded at caremap creation. "Others" roles are created on the fly the first
  time `AssignRoleModal`'s free-text role picker (backed by `ROLE_POOL`) is used for a new label.
- `AssignRoleModal` — the shared "assign someone to a role" modal, opened either **fixed** to a role
  (e.g. clicking the Case Manager card passes `roleLabel="Case manager"`, and the modal shows it as
  plain text) or **open** (the generic `+` / empty "Others" card, `roleLabel=null`, goes straight to
  the person picker — see below, no role concept shown at all for this path anymore). Candidate list
  is the *entire* unfiltered `MEMBER_POOL`, with a search box and a job-title filter `Select` — this
  modal is intentionally broad, unlike activity assignment.
- `handleAssign(roleLabel, memberId)` updates an existing `TeamRole` by label — only ever called with
  a label that's already present (`"Case manager"`, seeded at creation, or another role's own label
  via its card's "Re-Assign member" button), then re-runs `syncCaseManagerActivity` (so assigning the
  Case Manager immediately resolves the "Assign Case manager" to-do item — see
  [assign-case-manager-task.md](assign-case-manager-task.md)).
- **The open-ended "add a member" flow skips choosing a role up front**, per a later request — it
  used to show a `ROLE_POOL` dropdown ("Wijs lid toe aan rol: [Community nurse ▾]") before the person
  picker; that dropdown (and `ROLE_POOL` itself, now unused) was removed. Picking someone now calls
  `handleAddTeamMember(memberId)` instead of `handleAssign`, which always creates a brand-new
  `TeamRole` entry — rather than `handleAssign`'s find-or-create-by-label — labeled with that member's
  own `jobTitle`, the same convention an activity-only assignee is already shown under. Creating
  always-fresh entries (instead of finding-by-label) matters here specifically: without a chosen role
  name to key on, two different people who happen to share a job title (e.g. two "Oncologist"s) would
  otherwise collide onto the same team entry if a find-by-label lookup were reused.
- **Prominence**: `TeamMemberRow` and `RoleCard` both take a `prominent` boolean; it's `true` only
  when `label === "Case manager"` (checked wherever a row/card is rendered, not stored on the data).
  Prominent = teal-filled avatar + white icon; everyone else = light gray avatar + gray icon.
- **Activity-only assignees**: `extraActivityAssignees(activities, team)` returns anyone with an
  `assigneeId` on some activity who isn't already a team member by `memberId`. Rendered via
  `TeamMemberRow` (Overview) or `AssigneeCard` (Team tab) — the latter is explicitly read-only, no
  reassign button, labeled "Assigned via activity" instead of a role name (their `jobTitle` is shown
  instead of a role label, since they don't have one).
- **`TeamTab` is one flat `flex flex-wrap` grid, no section headings.** Previously grouped the
  creator, mandatory role(s), other roles, and activity-only assignees under their own "Created
  by"/"Mandatory"/"Others"/"Assigned via activities" labels, each its own `flex-wrap` row. Figma
  node `12998:10352` has none of that — one "TEAM" heading, one card grid, everyone in it. Merged
  all four groups (`createdBy` → `others` → `extra` → the trailing empty add-slot) into a single
  array render; the different card *types* (`AssigneeCard` vs. `RoleCard` vs. the empty-slot variant
  of `RoleCard`) still exist and still look different from each other — only the grouping labels
  above them were removed, not the distinction between what they represent.
- **`RoleCard` gained a corner ribbon** for the unfilled Case Manager card specifically
  (`isCaseManager && !m`) — pulled from the same Figma node: a `MANDATORY` label on a rotated
  `T.warning`-colored strip in the card's top-right corner, `T.bodyText` (dark) text, clipped to the
  card's rounded corners via `overflow-hidden`. `MandatoryRoleRow` (see below) uses the same device,
  mirrored to the top-left corner since its icon sits on the left rather than centered on top — not
  a different one, despite an earlier, mistaken read of a different Figma node that had this row
  using an inline pill instead (see below for that correction). Disappears once the role is filled,
  same for both.
- **`RoleCard` shows email and phone once a role is filled**, not just the name/role label —
  `m.email`/`m.phone` (both already on every `MEMBER_POOL` entry, added earlier for
  `MemberDetailModal`), styled `T.primary` beneath the role label. The "Re-Assign member" button
  also switches from solid to `variant="outline"` in the filled state (unfilled "Select a member"
  stays solid) — both changes match a design reference the user supplied directly as screenshots
  (no Figma link that time), showing the filled card with contact info and an outline button.
- **`TeamSummary`'s unfilled Case Manager slot** (`MandatoryRoleRow`) replaced the old "Please define
  the core team" placeholder box + "Add team members" button (which just switched to the Team tab).
  It's gated the same way the placeholder was — on whether the Case Manager role specifically is
  filled (`filled.some(t => t.label === "Case manager")`), not team membership generally, since the
  creator row is always present and an "any row filled" check would never trigger it. Visuals now
  pulled from Figma node `13292:181664`: a `HelpCircle` "unknown avatar" icon in the usual prominent
  teal circle, a diagonal `MANDATORY` ribbon banner over the card's top-left corner (`T.warning`
  #FFB853 bg, `T.bodyText` #212529 text, `-rotate-45`, clipped via the row's own `overflow-hidden` —
  the same device `RoleCard` uses, mirrored to the left corner since this row's icon sits on the left
  rather than centered on top) next to the role name. This *replaces* an inline pill badge this row
  briefly had — an earlier session read a different Figma node (`13068:10837`) that turned out not to
  be the authoritative spec for this component and built the pill from that; the ribbon is what the
  row shipped with originally (an ad-hoc guess, since that first request predated having any design
  link) and turned out to be correct after all, once node `13292:181664` was pulled directly. Distinct
  either way from the "Temporary" ribbon removed in the 2026-08-25 decision below: that one marked a
  freshly-*filled* Case Manager (redundant with the teal avatar); this one only ever shows while the
  slot is still *empty*, no overlap between the two. The "Assign a case manager" button (originally
  "Select a member" — reworded, and the "Please assign a Case manager" description line beneath it
  dropped entirely, since the button's own new label already says what the row wants without needing
  a second line to restate it) opens the same `AssignRoleModal` (`fixedRole="Case manager"`) the Team
  tab's `RoleCard` uses, and sits on the right of the name row, matching the Figma frame; the
  name+button row can still wrap onto two lines (button drops below, flush left) if `TeamSummary`'s
  column (1/3-width, see [overview-tab.md](overview-tab.md)) is too narrow for both. Once filled, the
  row becomes a normal (prominent) `TeamMemberRow` — no separate "filled" variant needed.
- **Every row in `TeamSummary` is clickable** (`TeamMemberRow` is a `<button>`), opening
  `MemberDetailModal` — a profile popup (job title, organisation, email, phone) for whichever member
  or creator was clicked. `MEMBER_POOL` carries all four fields; `createdBy` only carries
  `name`/`jobTitle`, so the popup just shows fewer fields for that row (`DetailRow`, reused from the
  PX360 port, silently skips an undefined field rather than rendering an empty one).
- **Filled `RoleCard`s in the Team tab are clickable too**, opening that same `MemberDetailModal` —
  added per a later request to make removal reachable from both places, not just Overview. The
  avatar/name/role/contact-info block is wrapped in its own inner `<button>` (disabled, and not
  wrapped at all in spirit, for the unfilled state, which has nothing to show); the existing
  "Re-Assign member" button stays a separate sibling control on the card, unchanged.
- **`MemberDetailModal` gained a "Remove from team" action**, gated by a `roleId` prop that's only
  set when the person being viewed is a formal team role (Case Manager or another named role) —
  passed as `{ member, roleLabel, roleId: t.id }` from both `TeamSummary` and `TeamTab`'s `viewing`
  state. Someone shown via an activity assignment, or the creator, has no `roleId` and so gets the
  same popup with no removal option: unassigning them isn't a single team-entry change, it would mean
  editing every activity that references them — a different, larger feature than this one added.
  `handleRemoveTeamMember(roleId)` (root component) branches on the role's label: removing the **Case
  Manager** clears `memberId` back to `null` rather than deleting the team entry, since it's the one
  mandatory slot — it reverts to the unfilled `MandatoryRoleRow` (Overview) / prominent empty
  `RoleCard` (Team tab) instead of disappearing. Removing **any other role** deletes the team entry
  outright, since those roles only exist in the first place because someone was assigned to them via
  `AssignRoleModal`'s free-text picker (see above) — removal is the inverse of that, not a "please
  reassign" state for a role that never existed before. Either way, `syncCaseManagerActivity` re-runs
  afterward — see below.
- **`syncCaseManagerActivity` now reverts, not just advances.** It previously only ever flipped the
  "Assign Case manager" to-do item to `completed` once a Case Manager was assigned, with no path back
  (nothing before this feature ever cleared that role's `memberId`). Removing the Case Manager is now
  that path, so the function also flips the to-do item back to `undefined` (dropping `completedDate`)
  whenever the role becomes unassigned while the item is still marked completed — otherwise a removed
  Case Manager would leave a stale "done" task behind, saying the assignment was resolved when it no
  longer is.
- **The "TEAM" heading itself links to the Team tab.** `SectionHeading` (shared with
  `ActivitiesPanel`'s "ACTIVITIES" heading) now takes an optional `onClick` — passed only by
  `TeamSummary` (`onOpenTeamTab`, wired at the `CaremapDetail` call site to `() => setTab("team")`),
  rendering it as a `<button>` instead of a plain `<div>`. `ActivitiesPanel` doesn't pass one and
  stays non-interactive — there's no separate "Activities" tab to link to (Overview *is* the
  activities view; the old `Activities` tab was removed as a duplicate, see decision log). The
  trailing chevron on both headings was always there implying a link; only `TEAM`'s was ever wired.

## Open questions

- None currently open.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Care Manager stands out via a prominent teal avatar; the
  orange 'Temporary' ribbon was removed", "Activity assignees surface in the Team panel/tab even
  without a formal role", "Team now always shows the GP who created the caremap", "Replaced
  TeamSummary's core-team placeholder with an inline Case Manager assign row and per-member detail
  popups", "Flattened the Team tab into one grid, removed its section headings"
