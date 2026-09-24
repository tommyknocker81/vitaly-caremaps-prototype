# Persona switcher (account menu)

**Status:** Complete

## What it does

The account block in `TopHeader` (top-right, where "Dr. HENLEY, Maria" sits) is a click-to-open
menu listing three personas. Switching persona changes who's "logged in" and re-filters the
Caremaps and Tasks lists to what that persona is responsible for — demonstrating how different
roles would see different slices of the same patient's data, without needing real multi-user auth.

## Implementation notes

- `PERSONAS` (near `MEMBER_POOL`): `dr-henley` (the default, unfiltered view — today's original
  behavior, `org: null`, `role: "GP"` — matching her `createdBy.jobTitle` elsewhere; originally
  labeled "Care coordinator", corrected per explicit request since she's the GP who creates the
  caremap, not a separate coordinator role) plus two real `MEMBER_POOL` identities reused as
  personas: Mary Brown (`m8`, Community Nurse, Regional Homecare) and Mike Myers (`m9`,
  Physiotherapist, UMC Utrecht - Physiotherapy). Reusing real member records means their `org` lines
  up exactly with `provider` on activities and with `PROVIDERS`/`staffForProvider` elsewhere in the
  app.
- Root state: `personaId` (`useState`, default `"dr-henley"`) + derived `persona`. Passed down to
  `CaremapDetail`, `CaremapsListScreen`, and `TasksListScreen`, which all forward it to `TopHeader`.
- `AccountMenu` — the dropdown itself. Local `open` state, closes on selecting a persona or clicking
  a full-screen invisible backdrop (`fixed inset-0`) rendered behind it while open.
- **Caremaps list filtering**: when `persona.id !== "dr-henley"`, rows are filtered to
  `careManager === persona.name`. Title switches to "My Caremaps".
- **Tasks list filtering**: when `persona.id !== "dr-henley"`, a row counts as "mine" if
  `responsible === persona.name` **or** it's unassigned and `provider === persona.org` — the second
  condition is the "claimable queue": an unassigned task at your own organization shows up even
  before anyone's picked it up. Title switches to "My Tasks". This required adding `assigneeId` and
  `provider` to the live row shape in `TasksListScreen` (previously only carried the resolved
  `responsible` name).
- **Self-assignment** needed no new mechanism — clicking a claimable task opens the existing
  `EditActivityModal` (via `openActivityFromTasksList`, same as any other Tasks-list click), whose
  "Assign to" dropdown is already scoped to the selected provider's own staff
  (`staffForProvider`/`AssignToField`), so the current persona can just pick themselves.
- MOCK_CAREMAPS/MOCK_TASKS decorative rows are unaffected structurally — they already happen to
  reuse "Mary Brown" as a name in several rows, so switching to her persona also surfaces those mock
  rows for free (a side effect, not something specifically wired).
- **"Case manager" quick-switch shortcut** — a row at the top of `AccountMenu`, above the regular
  "Switch persona" list, that jumps straight to whichever of the 3 personas currently holds the live
  caremap's Case Manager role (`caremap.team.find(r => r.label === "Case manager")?.memberId`). It's
  not a 4th identity — clicking it calls the same `onSwitchPersona` as any other row, just pre-picking
  the right one, so you don't have to know or remember which of Mary Brown/Mike Myers/Dr. Henley was
  last assigned before you can view the app as them.
  - `caseManagerPersonaId` (root, alongside `persona`) resolves to that `memberId` only when it
    matches one of the three switchable `PERSONAS` — Dr. Henley isn't in `MEMBER_POOL` so can never
    be a `memberId`, and the Team tab can assign the role to *any* `MEMBER_POOL` member (not just
    Mary Brown/Mike Myers), so an assignee outside the three demo personas resolves to `null` and the
    shortcut has nothing to point at. Threaded down the same way `persona`/`onSwitchPersona` already
    are, to every screen that renders `TopHeader`.
  - When `null` (unassigned, or assigned to a non-switchable member), the row shows disabled text
    reusing the existing "Please assign a Case manager" string rather than disappearing — an absent
    shortcut read as broken in an earlier, similar case (see notifications.md's "View caremap
    overview" decision), so this one stays visible and just explains why it's inert.
  - When resolvable, the row's active/highlighted state matches whether that persona is the one
    currently active — same "rgba(0,128,163,0.08)" treatment as the regular persona rows below it —
    so it's visually obvious when you're already viewing as the Case Manager.

## Open questions

- Only 3 personas exist, and only two (Mary Brown, Mike Myers) are filterable staff — enough to
  demonstrate the mechanism, not meant as a complete roster.
- The Case Manager shortcut only resolves for those same two switchable staff personas — assigning
  the role to any other `MEMBER_POOL` member (e.g. one of the specialists) makes the shortcut show its
  disabled state even though someone *is* technically assigned, since there's no persona to jump to.
- The claimable-queue rule only applies to the live caremap's real activities; `MOCK_TASKS` rows
  don't carry a `provider` field, so they can only ever match a persona via the `responsible` name
  fallback, never via org-claiming.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Added a persona switcher instead of real multi-user auth",
  "Added a Case manager quick-switch shortcut to the persona switcher"
