# Decisions

One entry per non-trivial decision made while building this prototype. Trivial stuff (copy tweaks,
obvious bug fixes, one-line styling corrections) is skipped — this is for choices that had a real
alternative, not everything that happened.

Format: date, decision, why, what was ruled out, related feature doc.

---

**2026-08-24 — Reused the existing Vitaly design tokens and chrome instead of building new ones**
Why: `vitaly-encounters-prototype` and `vitaly-documents-prototype` already had the sidebar, top
header, and patient bar built and pixel-matched to the same Figma system. Re-deriving colors/spacing
from scratch for a third prototype in the same family would produce visual drift between the three.
Ruled out: designing Caremaps' chrome independently, or generalizing a shared component library
across the three repos (would have meant touching the other two prototypes, out of scope for this
one).
Related: [docs/features/his-start-screen.md](features/his-start-screen.md)

**2026-08-24 — Kept the one-repo-per-prototype + `gh-pages` deploy pattern**
Why: established convention across the other two sibling prototypes; consistency in how all three
get built, previewed, and shared outweighs any benefit of a different approach for just this one.
Ruled out: a monorepo with all three prototypes, or a different hosting target.
Related: see `CLAUDE.md` § Deployment.

**2026-08-25 — Overview's "To do" list is derived from the Set Plan config, not a separate list**
Why: pulling the actual Figma dev-mode nodes for the Set Plan modal and the Overview screen showed
they're the *same* activity set — the Overview's to-do items are literally the plan's mandatory items
plus whichever optional ones are toggled on. The original build had invented a separate, unrelated
mock activity list for the Overview, which was simply wrong once checked against source.
Ruled out: keeping Overview and Set Plan as two independently-maintained lists (this is what the
first pass shipped, and it was corrected).
Related: [docs/features/set-plan-and-activate.md](features/set-plan-and-activate.md),
[docs/features/overview-tab.md](features/overview-tab.md)

**2026-08-25 — Overview shows a true empty state until the plan has been saved at least once**
Why: matches the actual Figma empty-state frame ("It looks like you haven't added any active
tasks..."), rather than a caremap materializing with mandatory activities pre-filled the instant
it's created.
Ruled out: seeding `activities` at caremap-creation time.
Related: [docs/features/overview-tab.md](features/overview-tab.md)

**2026-08-25 — Built a full 7-status model with per-status fields, replacing ad-hoc status strings**
Why: the user supplied six status mockups (Required/Planned/Scheduled/Completed/Declined by
patient/Cancelled), each pairing the status with a different associated field (month picker, date,
date+hour+location). A single flat `status` string plus a separate `category` field couldn't express
that without special-casing everywhere it was read.
Ruled out: keeping status as a free string and hand-rolling per-screen conditionals; kept `category`
as its own stored field (replaced by computing it from `STATUS_CONFIG[status].group` instead, so
status and category can't drift apart).
Related: [docs/features/activities-and-status-model.md](features/activities-and-status-model.md)

**2026-08-25 — Resolved activities show a status icon + date + assignee, not a text badge**
Why: matches the user-supplied Resolved-section mockup (green check / red person-x / red X) directly;
applied to *all* resolved activities (plan-derived and custom) for consistency rather than only new
ones.
Ruled out: keeping the green "RESOLVED" text badge used by the earlier draft.
Related: [docs/features/activities-and-status-model.md](features/activities-and-status-model.md)

**2026-08-25 — Pixel-matched the activity-row component to the Figma dev-mode spec exactly**
Why: the user pointed at a specific Figma prototype link; pulling that node's dev-mode code revealed
several precise values worth correcting rather than approximating: the "Planned" badge is a
translucent teal tint (`rgba(0,128,163,.11)`), not a solid light-blue fill; row padding is asymmetric
(`pl-25/pr-11/py-13`); the icon is 20px in a 16px gap, not 24px/18px.
Ruled out: leaving the earlier hand-tuned approximation in place once the exact spec was available.
Related: [docs/features/activities-and-status-model.md](features/activities-and-status-model.md)

**2026-08-25 — Discovered and fixed native `<select>` losing its arrow padding**
Why: user flagged the dropdown arrow sitting flush against the box edge once custom padding was
applied to selects. Native `<select>` styling doesn't reserve space for its own arrow consistently
across padding customizations.
Ruled out: tweaking padding per-instance; instead built one `Select` wrapper (`appearance-none` +
manually positioned `ChevronDown`) and switched every `<select>` in the app to it, so the fix is
structural rather than local.
Related: see `docs/ui-patterns.md` § Component patterns.

**2026-08-25 — "Assign to" is driven by the selected provider, not the caremap's core team**
Why: user explicitly asked for this — assigning an activity is about who at a given provider does
the work, not who's formally on the patient's care team. The original brief had specified "team
members only," but that turned out to produce a near-always-empty dropdown in the demo (most
activities get added before the team is fully staffed).
Ruled out: keeping the team-only restriction from the original brief. Added a couple of extra mock
staff per provider (previously most providers had exactly one person) so switching providers
visibly changes the candidate list.
Related: [docs/features/activities-and-status-model.md](features/activities-and-status-model.md)

**2026-08-25 — Dropped the redundant "Save as Draft" button from the activity modal**
Why: it duplicated the primary submit action with no actual behavioral difference (both created/saved
the same activity). Renamed the remaining buttons to match their real verb: "Add Activity" when
creating, "Save" when editing.
Ruled out: implementing a real draft-vs-final distinction for individual activities (out of scope —
the caremap itself already has a draft/active distinction; activities don't need a second one).
Related: [docs/features/activities-and-status-model.md](features/activities-and-status-model.md)

**2026-08-25 — Care Manager stands out via a prominent teal avatar; the orange "Temporary" ribbon was removed**
Why: once the teal-avatar treatment existed, the diagonal "Temporary" ribbon (originally always shown
on a freshly-assigned Care Manager) was redundant visual noise on top of it. Removed the `temporary`
field from the data model entirely rather than leaving it half-wired, since nothing else in the app
ever set it.
Ruled out: keeping both signals (ribbon + prominence); keeping the `temporary` field "just in case"
for a future role that might need it (adds dead-code risk for a hypothetical that hasn't come up).
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-08-25 — Activity assignees surface in the Team panel/tab even without a formal role**
Why: user asked that anyone assigned a task show up under the patient's team, not just people
explicitly added via "Assign member a role." Implemented as a derived list
(`extraActivityAssignees`) rather than writing these people into `caremap.team`, since they don't
occupy a role slot and shouldn't be reassignable the way a role is.
Ruled out: auto-creating a team-role entry for them (would blur the line between "formal team" and
"whoever touched an activity," and would need an invented role label for people who don't have one).
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-08-25 — "Assign Care manager" is a special-cased task: no provider field, curated candidate pool**
Why: user pointed out a care manager isn't tied to a provider organization the way a physiotherapy
session is, and asked that the assignee list be restricted to people plausible as a care manager. No
explicit "Care Manager" job title exists in the mock data, so the candidate pool was defined as GP +
Community Nurse — matching who actually plays Care Manager in the reference screenshots.
Ruled out: showing the full unfiltered `MEMBER_POOL` (rejected — too broad, includes neurologists/
oncologists/physiotherapists who wouldn't case-manage); inventing a dedicated `isCareManager` flag on
each member (more machinery than the job-title filter needed).
Related: [docs/features/assign-case-manager-task.md](features/assign-case-manager-task.md)

**2026-08-25 — Renamed the "Required" status label to "Requested"**
Why: direct user request. Only the display `label` in `STATUS_CONFIG` changed — the internal status
key stays `"required"` (and the associated field key stays `requiredMonth`) since neither is
user-facing, avoiding a wider rename across the codebase for a copy-only change.
Related: [docs/features/activities-and-status-model.md](features/activities-and-status-model.md)

**2026-08-25 — Replaced the hand-drawn SVG logo mark with the real PNG asset**
Why: user supplied the actual `vitaly-logo.png` (228×72, a 2x asset); using it directly gives an
exact match instead of an approximated vector redraw. Sized via `h-9`/`h-8 w-auto` so the 2x file
renders crisp at its true 114×36 logical size.
Ruled out: continuing with the hand-drawn SVG diamond + text lockup used in the other two sibling
prototypes (kept there since no real asset was supplied for those); redrawing the mark as a new SVG
from the PNG (unnecessary once the real file was available).
Related: [docs/features/his-start-screen.md](features/his-start-screen.md)

**2026-08-26 — Renamed "Case manager" to "Care manager" throughout the app**
Why: the Team tab dev-mode node (12998-10352) labels the mandatory role "Care manager", not
"Case manager" — the name used everywhere in the codebase up to this point. Since the Caremaps list
screen (built earlier the same day, from its own Figma node) already used "Care manager" for its
column header, keeping "Case manager" in the Team tab/Set Plan/Activities would have meant the same
role showing two different names depending on which screen you're looking at. Renamed the role label,
the "Assign Care manager" plan item/task, and every internal identifier that spelled out "case
manager" (`CARE_MANAGER_ACTIVITY_ID`, `CARE_MANAGER_CANDIDATES`, `syncCareManagerActivity`, etc.) for
consistency between the display strings and the code that implements them.
Also fixed `RoleCard`'s empty state to match the same dev-mode node: an unfilled named role (Care
manager or an "Others" role) now shows its own role name as the title and "Please assign member for a
role" as the subtext, instead of the generic "Add additional roles" text it was showing before — that
generic copy is now scoped correctly to only the actual "add another role" slot. The empty Care
manager card also keeps its prominent teal avatar and gets a light teal card tint (matching the spec)
so it visually reads as "needs attention" before anyone's assigned to it.
Ruled out: keeping "Case manager" in the Team tab and renaming the Caremaps list column instead —
rejected because "Care manager" is what two independently-fetched Figma screens for this same product
agree on, so it's the more likely source-of-truth term.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md),
[docs/features/assign-case-manager-task.md](features/assign-case-manager-task.md)

**2026-08-27 — Removed the "Activities" tab**
Why: direct user request. It rendered the exact same body as Overview (title row, status bar,
Activities list, Team summary, stub cards) — a duplicate view with no content of its own, so dropping
it loses nothing. Simplified `CaremapDetail`'s content condition from `tab === "overview" || tab ===
"activities"` down to just `tab === "overview"` rather than leaving the now-unreachable branch in.
Related: [docs/features/overview-tab.md](features/overview-tab.md)

**2026-08-27 — Added a persona switcher instead of real multi-user auth**
Why: user wanted to demonstrate how different roles (a care coordinator, a Community Nurse, a
Physiotherapist) see different slices of the same patient — specifically, a Care Manager creating an
unassigned Physiotherapy task at a given provider, and the Physiotherapist at that provider seeing it
and self-assigning. The app has no backend/auth (see `CLAUDE.md`), so a click-to-switch account menu
that swaps a `personaId` in root state was the natural fit — it reuses two existing `MEMBER_POOL`
records (Mary Brown, Mike Myers) as personas so their `org` already lines up with `provider` on
activities, and reuses the existing `EditActivityModal`/`AssignToField` for the actual self-assign
action rather than building a new "claim" mechanism.
Ruled out: a fuller mock-auth system with login/logout and session state (unnecessary ceremony for a
single-session, no-persistence prototype — a simple switcher demonstrates the same point).
Related: [docs/features/persona-switcher.md](features/persona-switcher.md)

**2026-08-27 — Added a Messages tab wired to the persona switcher**
Why: user supplied dev-mode-style screenshots of a Messages tab (thread list with Open/Awaiting
response/Resolved filters, a critical flag, and a compose form) and asked for staff to be able to
message different personas. Rather than storing a thread's status as its own field, it's derived
per-viewer from who sent the last message — "Open" if the current persona did, "Awaiting response"
if the other party did — so the same thread reads differently depending on which persona is logged
in, without any read/unread bookkeeping to keep in sync. Recipients in the "To" field are `PERSONAS`
minus the current persona, reusing the same list the account-menu switcher already uses.
Ruled out: a stored status field with explicit transitions (more state to keep consistent for no
real benefit over the derived rule); group threads with more than one recipient (not asked for, and
the two-party derived-status rule doesn't generalize cleanly to more parties).
Related: [docs/features/messages-tab.md](features/messages-tab.md)

**2026-08-27 — Team now always shows the GP who created the caremap**
Why: user wanted the initial team state to show the creating GP as an already-defined member (not
just the empty mandatory Care manager slot), per a Figma reference showing a "GP" row sitting below
the mandatory role card. Added `caremap.createdBy: { name, jobTitle }`, set once in `createCaremap`
to `CURRENT_USER_NAME`/"GP" — it's fixed metadata, not a `team[]` role slot, so it has no
assign/reassign button and can't be edited. `TeamSummary`'s empty-state prompt ("Please define the
core team") now keys off whether the Care manager role specifically is filled, rather than whether
any team row is filled, since the creator row is now always present regardless. `TeamTab` gets a new
"Created by" section above Mandatory, rendered via the existing `AssigneeCard` (reused for its
read-only square-card look) with a custom caption ("Created this care map") instead of its default
"Assigned via activity" text.
Ruled out: adding the GP into `team[]` as a fixed mandatory-group entry — rejected because RoleCard
always renders a "Re-Assign member" button for anything in `team[]`, and the creator isn't meant to
be reassignable.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md),
[docs/features/overview-tab.md](features/overview-tab.md)

**2026-08-27 — Added localStorage autosave + a Reset demo action for practice**
Why: user wanted to rehearse the demo repeatedly without losing progress on every reload, plus a
clean way to get back to a blank slate between rehearsals. Chose plain `localStorage` (one JSON blob
under a single key) over anything fancier — this is a no-backend static-hosted prototype, and the
root state that needed persisting (`screen`, `caremap`, `personaId`) was already a small, self
contained set. "Reset demo" lives in the account menu (next to persona switching, since both are
about "who/what state you're currently in") and is gated by a native `window.confirm()` rather than a
new custom confirmation modal, since this is the only place in the app that needs one.
Ruled out: named/multiple snapshots for jumping between different rehearsal checkpoints — not asked
for; a single continuous autosave covers "practice repeatedly, reset when done." Can revisit if
demoing multiple distinct scenarios turns out to need it.
Related: [docs/features/demo-persistence.md](features/demo-persistence.md)

**2026-08-28 — Built the PZP tab with authored palliative-care content**
Why: user supplied the dev-mode node for the PZP tab (a left section list + right detail-fields
panel) and asked for it to be built with content relevant to a palliative care plan. Figma only had
one of the six sections ("Clinical context") actually designed; the other five (General information,
Capacity and representation, What matters to the patient, Treatment wishes and boundaries,
Anticipatory care arrangements) were authored to read as a coherent, realistic PZP for the app's
single hardcoded patient (De Vries, Jan) — referencing roles/concepts that already exist elsewhere
(Care manager, Community Nurse, MDT referral) rather than inventing unrelated facts. One cleanup: the
Figma reference's "Relevant comorbidity" field ran two unrelated facts together ("Moderate COPD
Palliative phase marked: 12 August 2026"); split into a clean comorbidity fact and a properly-homed
"Palliative phase marked" fact under the new General information section.
Ruled out: making PZP editable in this pass (the header's edit icon is present but decorative, same
treatment as other not-wired controls) — not asked for, and would mean moving this from a static
module constant onto `caremap` state; can revisit if a future session needs it.
Related: [docs/features/pzp-tab.md](features/pzp-tab.md)

**2026-08-28 — Added a full English/Dutch language toggle**
Why: user needs to present the prototype in both English and Dutch, live, with the ability to switch
mid-demo. Chose a lightweight identity-key dictionary (`t("English text")` → Dutch or itself) over a
formal i18n library or a keyed translation system — this app had zero i18n infrastructure going in,
and a two-language, single-file prototype doesn't need namespaced keys or pluralization machinery.
Went through the entire file (nav, chrome, every modal, every tab, both list screens, all mock data,
the full PZP content) rather than just UI chrome, per explicit request to do "everything in one
pass." Data values used in comparisons (status keys, role labels like "Care manager", job titles)
were deliberately left untranslated — only render sites call `t()` on them — so existing equality
checks throughout the app keep working unchanged.
Ruled out: react-i18next or similar (unnecessary machinery for two languages in one file); a second
full English/Dutch build pair (can't switch languages mid-demo, doubles the deploy); auto-translating
the PZP clinical content via an API (risked inaccurate medical Dutch in front of stakeholders — the
whole PZP section was hand-translated instead).
Related: [docs/features/i18n-english-dutch.md](features/i18n-english-dutch.md)

**2026-08-29 — Renamed "Care manager" back to "Case manager" throughout the app**
Why: explicit user request, reversing the 2026-08-26 rename. Applied the same global-rename approach
as that earlier pass, in reverse: display strings ("Care manager" → "Case manager", including inside
the PZP content and mock list data), identifiers (`CARE_MANAGER_*` → `CASE_MANAGER_*`,
`careManager`/`CareManager` → `caseManager`/`CaseManager`, the `t-care-manager` team-role id →
`t-case-manager`), and the NL dictionary — both the entry's key and its Dutch value, which changed
from the invented "Zorgcoördinator" to "Casemanager" (a real, commonly-used Dutch term in elderly/
palliative care networks, arguably a better fit than the earlier invented translation). Left
`"Care coordinator"` (Dr. Henley's own persona role, a different concept) and `decisions.md`'s past
entries untouched — the latter are a historical record of what things were called at the time, not
living documentation.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md),
[docs/features/assign-case-manager-task.md](features/assign-case-manager-task.md)

**2026-08-30 — Natively ported the Encounters prototype as the PX360 tab**
Why: user wanted PatientBar's PX360 tab to actually open the sibling `vitaly-encounters-prototype`
repo's Patient 360 view, and specifically asked for it to feel native to this app rather than an
iframe or external link. Ported the Encounters simulation logic (~1,250 of that repo's ~1,370
lines) into a new `Px360Screen`, reusing this app's own Sidebar/TopHeader/PatientBar rather than
that repo's own duplicate shell — its design tokens turned out to already be value-identical to
this app's `T` (same source Figma file), so no token merging was needed. Patient identity came
along for free by reusing this app's own `PatientBar` (already "DE VRIES, Jan") instead of the
source repo's hardcoded "Leroy Matt Evans, 16yo." The mock encounter content itself (diagnoses,
visit types) was also rewritten — the original was authored for a teenager (pediatrics, sports
injuries, asthma) and would have read as obviously wrong next to a 73-year-old's palliative story —
while every date/delay/pagination-count/org-name/failure-retry mechanic was left untouched, so the
loading behavior demonstrated is identical to the original prototype.
Ruled out: an iframe embed (would nest that repo's own sidebar/header inside this one's) and a
plain external link (breaks the "one connected app" feel and lands on the wrong patient) — both
explicitly discussed with the user before starting; also ruled out translating PX360's content into
Dutch in this pass — not asked for, and comparable in size to the whole port itself.
Related: [docs/features/px360-tab.md](features/px360-tab.md)

**2026-08-31 — Fixed the CAREMAPS patient-bar tab and made "Klachten en diagnoses" /
"Treatment restrictions" real categories instead of decorative placeholders**
Why: two separate user reports. First, the "Open" button on the HIS start screen's Patient 360 card
and PatientBar's own CAREMAPS tab both needed to actually navigate — the latter turned out to be a
pre-existing bug (its tab label `"CAREMAPS"` never matched the Sidebar's `"Caremaps"` string that
`handleNavigate` checked for, so it silently did nothing everywhere, not just from PX360); fixed to
jump straight to this patient's own Caremap Overview rather than the Sidebar's cross-patient list,
since PatientBar is always in a single-patient context. Second, the user supplied reference
screenshots and asked for the left rail's other two categories to show real palliative-relevant mock
content with the same card/expand interaction as Encounters, instead of just a fake-loading tick
that never led anywhere (true in both this port and the original `vitaly-encounters-prototype`
source). Added an `activeCategory` switch over the same right column and reused the Encounters
card/expand pattern rather than inventing a new visual language. The diagnosis content deliberately
reuses the PZP tab's own "Main diagnosis"/"Relevant comorbidity" wording, and the treatment
restrictions show a two-record history (a 2023 "with limitations" GP record, then a 2026 "Not for
resuscitation" record matching the PZP tab's resuscitation field word-for-word) so PX360 visibly
aggregates data that changed over time, rather than just restating the current PZP state once.
Ruled out: leaving the two categories permanently inert (was the status quo, but directly
contradicted by the user's request); writing a wholly separate visual style for the new categories
instead of reusing Encounters' card pattern (would violate "same interaction" and double the code to
maintain).
Related: [docs/features/px360-tab.md](features/px360-tab.md)

**2026-08-31 — Replaced TeamSummary's core-team placeholder with an inline Case Manager assign row
and per-member detail popups**
Why: user supplied reference screenshots and asked for the Overview tab's Team card to show the
Case Manager slot inline (a "Mandatory" ribbon + "Select a member" button when empty, a normal
member row once filled) instead of the old "Please define the core team" text box + a button that
just switched to the Team tab; and asked for every member row to open a small popup with dummy
contact info on click. `TeamSummary` now renders `MandatoryRoleRow` (unfilled) or a plain
`TeamMemberRow` (filled) for the Case Manager, wired to the same `onOpenAssign`/`AssignRoleModal`
flow the Team tab's `RoleCard` already used (`fixedRole="Case manager"`) rather than a new modal
path. `TeamMemberRow` became a `<button>` so every row — Case Manager, other roles, activity
assignees, and the creator — opens `MemberDetailModal`, a new read-only popup; `MEMBER_POOL` gained
a `phone` field (previously only name/jobTitle/org/email) since a 4-field profile needed one more
data point than existed. Note this reintroduces a diagonal ribbon on this same widget after the
2026-08-25 decision below removed one — that removed ribbon marked a freshly-*filled* Case Manager
(redundant once the teal-avatar prominence existed); this new one only shows while the slot is still
*empty*, a different state with no overlap, not a reversal of that decision.
Ruled out: keeping the placeholder box (the user explicitly asked to remove it); a new bespoke
"assign" flow for this card instead of reusing `AssignRoleModal` (would duplicate the Team tab's
logic for no benefit — the two views already shared the same `caremap.team` data).
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md),
[docs/features/overview-tab.md](features/overview-tab.md)

**2026-08-31 — Replaced Reset demo's native window.confirm() with an in-app modal**
Why: user reported clicking "Reset demo" did nothing. Reproduced it and confirmed the click handler
itself fired correctly every time (`window.confirm()` was genuinely being called) — the actual cause
is that `window.confirm()` (and `alert`/`prompt`) render nothing and silently return `false` in some
embedded/preview browser contexts (sandboxed iframes without dialog permissions, some webviews),
which looks indistinguishable from the button being broken. Replaced it with a small in-app `Modal`
(local `confirmingReset` state in `AccountMenu`) using the same `Modal`/`Btn` components every other
confirmation in the app already uses — guaranteed to render regardless of embedding context, and
visually consistent with the rest of the UI instead of a native browser chrome dialog.
Ruled out: leaving it as `window.confirm()` (was the original reasoning, documented in
`demo-persistence.md`, that no reusable confirm-modal existed for a one-off case — no longer true
once this one was built, and the silent-failure risk outweighs the few lines saved).
Related: [docs/features/demo-persistence.md](features/demo-persistence.md)

**2026-08-31 — Added a notification center, driven by task/role assignment**
Why: user wanted the previously-inert Sidebar "Notifications" item and TopHeader bell wired up, with
a simulated notification appearing for whoever a task or role gets assigned to. Scoped the trigger
to exactly that — task/role assignment — rather than also inventing content for other event types,
since that's what was actually asked for; the reference screenshot's rich "New referral received"
history was read as a layout reference (Unread/All tabs, list + detail panel), not a request to
pre-seed that specific content. Notifications are keyed by `MEMBER_POOL` id and filtered to the
active persona, reusing the existing fact that the two switchable staff personas' `persona.id`
already equals their `MEMBER_POOL` id — so "assign a task to Mike Myers, switch to his persona, see
the notification" works without any new persona/member-linking logic. Found and fixed two related
bugs during build: auto-selecting the first item on mount silently marked it read (and thus
invisible in the Unread tab) before the user ever saw it there, and looking up the selected
notification from the tab-filtered list (instead of the full per-persona list) meant marking an item
read while on the Unread tab yanked it out of its own selection and blanked the detail panel.
Ruled out: generating notifications for other events (comments, messages, status changes) — not
asked for; translating the notification title/body — freely composed dynamic sentences translate
badly word-by-word, same call already made for PX360's content.
Related: [docs/features/notifications.md](features/notifications.md)

**2026-08-31 — EMR-only caremap creation, continuing straight into Set plan and activate**
Why: user wanted confirming the EMR/HIS start screen's "Create new caremap" dialog to hand off
straight into Vitaly with "Set plan and activate" already open, so the demo flow keeps going instead
of leaving the user on the Overview tab to click that themselves. Rather than threading an "origin"
flag through to conditionally auto-open the lightbox only for EMR-initiated creates, removed the
Caremaps-list screen's own "+"/create entry point entirely (per explicit instruction — creating a
caremap needs the patient context the EMR hand-off provides, which a cross-patient list screen
doesn't have) so `modal === "create"` has exactly one path in, and `createCaremap` can unconditionally
open Set Plan afterward. `TopHeader`'s Add/`+` button is now conditionally rendered on `onAdd` being
passed, instead of always rendering and silently no-op'ing when it wasn't (which is what the
Caremaps-list "+" would otherwise have quietly become) — this also incidentally fixed the Tasks list
screen showing the same dead "+" whenever there was no live caremap to add an activity to.
Ruled out: keeping the Caremaps-list create button and gating the auto-open behind an origin check
(more state to thread through for a path the user explicitly said shouldn't exist); disabling
(grayed-out, still visible) instead of removing that button — asked for removal specifically.
Related: [docs/features/create-caremap.md](features/create-caremap.md),
[docs/features/his-start-screen.md](features/his-start-screen.md)

**2026-08-31 — Pre-seeded the notification center instead of leaving it empty until the demo user
triggers something**
Why: user felt an empty inbox on first load didn't sell the feature, but explicitly still wanted the
live assign-a-task/role behavior working, not a switch to purely static content. Added
`SEED_NOTIFICATIONS` — the initial value of `notifications` (on first load and after Reset demo)
instead of `[]` — using the exact same data shape live-generated notifications use, so seeded and
live entries are indistinguishable in the UI and simply share one list (new ones prepend). Content
was written to match this app's own existing mock data rather than invented independently: reuses
patient names and assignments already asserted by `MOCK_CAREMAPS`/`MOCK_TASKS` (Mary Brown as KLEIN,
Calvin's Case Manager; Mike Myers picking up MATT EVANS, Leroy's previously-unassigned Physiotherapy
task), so the notification center reads as part of the same demo world instead of disconnected
filler text.
Ruled out: generating the seed notifications through the same live `notifyAssignment` path at app
init (would mean either replaying fake assignment actions against a caremap that doesn't exist yet,
or maintaining a second parallel data path for "startup assignments" — more moving parts than just
authoring the four notification objects directly, since the shape is trivial and stable).
Related: [docs/features/notifications.md](features/notifications.md)

**2026-08-31 — Corrected the unfilled Case Manager row to the real Figma spec (pill badge, not a
ribbon)**
Why: the mandatory-role row was originally built without a design link — the user described "a
Mandatory ribbon" from a different reference screenshot, so a diagonal corner ribbon was invented to
match that description. The user then supplied the actual Figma node
(`13068:10837`), which turned out to use a completely different device: an inline, fully-rounded
"MANDATORY" pill badge sitting next to the role name, plus a `HelpCircle` "unknown avatar" icon
instead of the generic person icon. Corrected both to match the spec exactly (colors pulled straight
from Figma's own tokens, which happened to already equal this app's existing `T.warning`/`T.bodyText`
— no new tokens needed). Kept the button on its own line below the text rather than matching the
Figma frame's single-row layout: that frame is full-width, `TeamSummary` is a narrower 1/3-column
card, and forcing one row would mean everything overlapping or truncating badly at that width — an
intentional, documented deviation rather than a missed detail.
Ruled out: keeping the ribbon since it was already shipped and "close enough" — the user asked
specifically to match this design, and the ribbon wasn't a simplification of the spec, it was a
guess made before the spec existed; squeezing the button onto the same row regardless of width
(measured: the column is far too narrow, verified during the ribbon-era build of this same
component).
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-08-31 — Kept "Select a member" on the right of the row instead of dropping it below**
Why: user asked why the button wasn't on the right, matching the Figma frame — the entry directly
above this one had just moved it below the text, reasoning that `TeamSummary`'s 1/3-width column
couldn't fit avatar+text+button on one row at typical desktop widths. Re-checked against an actual
rendered row rather than the single 1440px measurement the earlier reasoning relied on: at that
width the row genuinely is tight, but making only the name/badge/subtitle block flexible
(`flex-1 min-w-0`) inside one `items-center` flex row — instead of stacking the whole avatar+text
block above the button — keeps the avatar and button pinned to either edge at any width; the text in
the middle just wraps onto more lines when the column is narrow, rather than the button needing to
move at all. Verified at both a very wide viewport (matches Figma's own single-line frame exactly)
and 1440px (button stays right, text wraps to three lines — tighter, but never breaks layout).
Ruled out: reverting to the previous entry's own reasoning (it was a real width constraint at
1440px, but solvable with a better flex structure rather than accepting the tradeoff); a fixed
`w-*` cap on the text block that could still overflow at extreme widths instead of `min-w-0`'s
proper shrink behavior.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-08-31 — Flattened the Team tab into one grid, removed its section headings**
Why: user supplied the real Figma frame for the Team tab (node `12998:10352`) and asked for
everything to sit in one grid with no category labels. The tab previously grouped cards under
"Created by"/"Mandatory"/"Others"/"Assigned via activities" headings, each its own wrapping row —
none of that grouping exists in the spec, just one "TEAM" heading followed by a single card grid
containing the creator, every role, and every activity-only assignee together. Merged all four
groups into one array render in `TeamTab`; the underlying card components (`AssigneeCard`,
`RoleCard`, and `RoleCard`'s empty-slot variant) were untouched; only the labels and the separate
`flex-wrap` containers around each group went away. Also picked up a second, more precise fix from
the same design pull: the unfilled Case Manager card gets a diagonal corner ribbon (`RoleCard`,
`isCaseManager && !m`) — this component had no "still mandatory, still empty" visual signal at all
before, unlike `MandatoryRoleRow`'s pill badge on the Overview tab's row layout. Confirmed this is a
deliberate difference in the spec, not an inconsistency to resolve toward one shared treatment: the
grid card is wide enough for a corner ribbon, the list row isn't, and Figma draws each shape's own
device rather than reusing one across both.
Ruled out: keeping the section labels as smaller/lighter text instead of removing them outright —
the user asked for no category labels, not de-emphasized ones; unifying the ribbon and the pill into
one shared component now that both mark the same underlying state (would mean picking one shape and
overriding what Figma actually draws for the other).
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-08-31 — Filled Team-tab role cards show email/phone and switch the reassign button to outline**
Why: user supplied a reference screenshot of the Team tab's filled `RoleCard` state showing contact
info and an outline-style button, wanting the app to match. `MEMBER_POOL` already carried
`email`/`phone` on every entry (added for `MemberDetailModal` earlier the same session), so this was
just surfacing data that already existed rather than adding a new field. Styled both lines
`T.primary`, matching how contact info already renders elsewhere in the app (e.g.
`AssignRoleModal`'s candidate table). The button switching solid→outline once filled mirrors the
existing unfilled/filled tonal distinction elsewhere in this same component (light teal card tint
while empty vs. plain card bg once filled) — filled states already read as "settled," not needing
the loudest possible affordance.
Ruled out: making email/phone clickable `mailto:`/`tel:` links — no other contact info in the app is
an actual link (same table in `AssignRoleModal` renders emails as styled plain text), so an anchor
here would be an inconsistent one-off given this is a demo prototype, not a real directory.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-08-31 — Gave Diagnoses and Treatment restrictions the same Status/Sort/Filters row as
Encounters**
Why: user pointed out that PX360's Diagnoses and Treatment restrictions categories (added earlier
this session) had the same card style as Encounters but not the same interaction — no Past/Planned
pills, no working sort, no filters — and asked for the experience to be identical across all three.
Extracted Encounters' own toolbar row into a shared `CategoryToolbar` component instead of copying
the JSX three times; reused the existing `sortOrder`/`sortMenuOpen`/`filtersOpen` state for all three
categories rather than tripling it, since the categories are mutually exclusive (only one is ever
mounted). Sort needed a category-appropriate date parser (`parseDMY`) since Diagnoses/Treatment's
`date` fields are plain `DD/MM/YYYY` strings, unlike Encounters' own `sortDate`. Filters kept
Encounters' existing Status/Encounter type/Care provider sections completely untouched and gave
Diagnoses/Treatment their own single "Type" section each, derived from each category's own
`label.split("|")[0]` prefixes (`DIAGNOSIS_FILTER_TYPES`/`TREATMENT_FILTER_TYPES`) — a deliberately
different, much simpler taxonomy from Encounters' `FILTER_TYPES`/`encounterTypeKey`, since encounter
visit-types don't apply to diagnosis/complaint or treatment-restriction records.
Ruled out: making Diagnoses/Treatment share Encounters' own `typeFilters` state and `FILTER_TYPES`
list (their content doesn't fit that taxonomy at all — "Diagnosis"/"Complaint" and "Cardiopulmonary
resuscitation" aren't encounter visit-types); making the Past/Planned pills interactive/live-filtered
for the new categories when Encounters' own pills aren't either — matching what's actually there,
not adding scope Encounters itself doesn't have.
Related: [docs/features/px360-tab.md](features/px360-tab.md)

**2026-08-31 — Unified the "Sources (N/5 loaded)" breakdown across Encounters/Diagnoses/Treatment**
Why: user pointed out the sources breakdown panel (the collapsible list showing each of the 5
organisations' individual fetch status, with per-source retry) was still Encounters-only, even after
the Status/Sort/Filters row had already been unified across all three categories in the previous
entry. Rather than building three independent fetch simulations, made the existing one genuinely
shared: `sourceStatus`/`loadedCount`/`failedCount`/`allSettled` were already computed once at
`EncountersSection`'s top level, not scoped to the Encounters branch, so Diagnoses/Treatment could
read the same values directly. This is also the more honest narrative — PX360 aggregates one
integration against 5 organisations, not three separate integrations that coincidentally share 5
names — so a source failing or a retry succeeding now visibly affects all three categories at once,
not just the one you happened to be looking at. Extracted the header/breakdown markup into a shared
`SourcesHeader` component and the left-rail's live counter into `SourceCountIndicator`, and deleted
Diagnoses/Treatment's old independent `CategoryTick` fake-timer simulation (a 4–12s random delay
with no relation to the real fetch) along with the now-dead `CategoryTick` component itself.
Ruled out: giving Diagnoses/Treatment their own separate 5-source fetch simulations (would mean
three unrelated random outcomes for organisations that are supposed to be the same integration, and
tripling the simulation code for no real benefit); keeping the old fake per-category timers
alongside the new shared Sources panel (would have let the left-rail tick show "done" while that
same category's own just-added Sources panel still showed sources loading — a direct
self-contradiction on one screen).
Related: [docs/features/px360-tab.md](features/px360-tab.md)

**2026-08-31 — Made the Sources panel's per-source counts category-aware**
Why: user caught that the newly-shared Sources breakdown (previous entry) still showed Encounters'
own pagination numbers — e.g. "Latest 10 of 16 records loaded" for Maastricht UMC+ — under
Diagnoses, where Maastricht only contributes 1 of that category's 4 total entries. Sharing the fetch
*simulation* (settled/failed/empty state) across categories was correct, but the *record counts*
in the subtext are inherently Encounters-specific (that org's real 16-record encounter history) and
were never meant to describe Diagnoses/Treatment's own much smaller lists. Added a `categoryEntries`
prop to `SourcesHeader` (the category's own array, omitted for Encounters) and a `countByOrg`
helper; when set, each source's subtext counts that category's own records from that org instead of
reading `status.fetched`/`.total`. Also found and fixed a bug this exposed: `RESTRICTION_ENTRIES`'
`r1` had `source: "GP"`, which doesn't match any of the 5 real org names, so it would have silently
never counted toward any source's total — corrected to `"GP Practice de Linde, Amersfoort"` (also a
better read: one practice's resuscitation-decision history over time, not an anonymous "GP").
Ruled out: leaving the Encounters-derived counts as an approximation ("close enough") — the user
was explicit that the numbers should reflect what's actually visible per category, not a shared
number that happens to be in the right ballpark for one of the three.
Related: [docs/features/px360-tab.md](features/px360-tab.md)

**2026-08-31 — Wired the Overview tab's "TEAM" heading to open the Team tab**
Why: user pointed out the "TEAM >" heading (chevron already implying a link) didn't do anything.
Gave the shared `SectionHeading` component (also used by `ActivitiesPanel`'s "ACTIVITIES") an
optional `onClick`, rendering as a `<button>` when passed and a plain `<div>` otherwise — only
`TeamSummary` passes one, wired to `CaremapDetail`'s own `setTab("team")`. `ActivitiesPanel` was
deliberately left alone: Overview already *is* the activities view (the separate `Activities` tab
was removed earlier as a duplicate), so there's no other tab for that heading to link to.
Ruled out: a one-off `<button>` wrapper specific to `TeamSummary` instead of extending
`SectionHeading` itself — the component already renders the exact chevron-heading look everywhere
it's used, so the click affordance belongs on it generically, not duplicated at the call site.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-09-01 — Fixed Open/Awaiting response being swapped in the Messages tab**
Why: user described the intended semantics (sender's own copy sits in "Awaiting response", the
recipient sees it in "Open") and asked me to confirm before touching anything. Reproduced it first
— sent a message as Dr. Henley to Mike Myers and checked both personas' tabs — and confirmed
`threadStatusForPersona` had it backwards: `last.author === personaName ? "open" : "awaiting"` put
the *sender's own* thread under "Open" and the *recipient's* under "Awaiting response", the reverse
of how an inbox actually reads (you're not "done" the moment you hit send; the other party is the
one with an open item waiting on them). Flipped the ternary. Also verified — before assuming they
needed fixing too — that "Resolve" → Resolved tab, the "!!!" critical flag showing up as an alert
icon in the thread list, and "Show only critical" filtering all already worked correctly; only the
Open/Awaiting swap was an actual bug.
Ruled out: reinterpreting "Open" as "conversation not yet resolved" (a third meaning distinct from
either party's turn) — not what was described, and would collapse the sender/recipient distinction
the two tabs exist to show in the first place.
Related: [docs/features/messages-tab.md](features/messages-tab.md)

**2026-09-01 — Removed the estimated start date from the status bar**
Why: user asked to remove it on ethical grounds — estimating how long a palliative patient has left
isn't something this prototype should imply it can do. The field itself (`estimatedStartDate`,
literally `startDate + 2 months`, labeled "Start date … (Estimated)") was never actually about life
expectancy — it read more like a placeholder second milestone date — but in a palliative caremap
next to the real activation date, an unexplained "estimated" date invites exactly that
misreading, which was reason enough to drop it rather than argue the label was technically fine.
Removed it fully rather than just hiding it: the field, its `addMonthsDMY` helper (now with no other
callers), and the `"(Estimated)"` translation entry (also now orphaned) are all deleted, not just
unrendered. Left the PZP tab's own "Estimated life expectancy" field ("Weeks to a few months")
untouched — that one is a deliberate, explicit clinical field in an authored palliative-care
document, a different thing from an unexplained date badge in the caremap status bar, and wasn't
what was asked about; flagged it to the user in case they want it addressed too, but didn't change
it unilaterally.
Ruled out: keeping the field but relabeling it to something unambiguous (e.g. "Review date") — the
user asked for removal specifically, and inventing a new meaning for a field nothing else reads
would be adding scope, not following the instruction.
Related: [docs/features/overview-tab.md](features/overview-tab.md)

**2026-09-01 — Notifications link to the caremap overview**
Why: user asked that each notification lead to a patient's caremap overview. Added a "View caremap
overview" button to `NotificationDetail`'s expanded card rather than making the whole row navigate
on click — the row click already does useful work (selecting, marking read, showing the message
body), and an explicit button is a clearer, more deliberate action than an entire row silently
becoming a navigation link. It always opens the one live caremap (`caremap ? () =>
setScreen("detail") : undefined`), regardless of which patient a given notification's body actually
mentions: several `SEED_NOTIFICATIONS` reference other mock patients (KOWALSKA, Anna; BAUER,
Fredric) that only exist as flavor text in `MOCK_CAREMAPS`/`MOCK_TASKS` and have no real caremap
object to open, so "the patient's caremap" can only ever mean the one real, interactive caremap
this whole app is built around (De Vries, Jan's) — consistent with every other place in the app that
already treats other patients as decorative-only. The button is omitted entirely (not shown
disabled) when there's no live caremap, since that's a real dead-end state reachable right after
Reset demo (seed notifications persist through a reset; `caremap` doesn't).
Ruled out: building real caremap objects for the other mock patients so each notification could
route to its own specific patient — far beyond what was asked, and would need to extend past
notifications into every other place those same mock patients already appear as decoration
(`MOCK_CAREMAPS`, `MOCK_TASKS`, the Caremaps/Tasks list screens); making the whole notification row
navigate on click instead of a dedicated button — would remove the existing read/preview experience
built earlier the same session, trading it for a plain link-list with no real benefit.
Related: [docs/features/notifications.md](features/notifications.md)

**2026-09-01 — Made "View caremap overview" unconditional, and gave notifications specific titles**
Why: user reported the caremap link "doesn't work" — they were looking at a notification in a
session state with no live caremap yet, where the button (per the immediately preceding decision)
was deliberately omitted rather than shown as a dead link. That reasoning was sound but the result
read as broken, not deliberate, since there was nothing on screen to explain the absence. Made the
button always render and fall back to the HIS start screen (`setScreen("start")`) instead of hiding
when there's no caremap — a real, useful destination (it's where "Create new caremap" lives), so the
button is never simply missing. Same message also asked for notification list rows to be more
meaningful "so users see what they have to do and for who" without opening each one — titles were a
fixed category string ("New task assigned"/"New role assigned") shown as the list's bold line, so
you couldn't tell anything apart without clicking in. Changed `title` to
`` `${task-or-role} — ${patient}` `` (e.g. "Physiotherapy — MATT EVANS, Leroy") at all four
`notifyAssignment` call sites (3 live + `SEED_NOTIFICATIONS`); `body` (the full sentence in the
detail panel) is unchanged.
Ruled out: keeping the button hidden and instead adding explanatory text for why it's missing —
more UI for a problem an unconditional button with a sane fallback solves more simply; a separate
`summary` field for the list row instead of reusing `title` — no second field was needed once
`title` itself became the specific string, and the detail panel's heading reads just as well with
the new title as it did with the old generic one.
Related: [docs/features/notifications.md](features/notifications.md)

**2026-09-02 — Translated PX360's content area to follow the language toggle**
Why: user noticed switching the app to Dutch left PX360 (Encounters/Diagnoses/Treatment, the Sources
panel, filters, detail cards) in English while the rest of the chrome switched correctly — this had
been a known, documented gap from the original port, but the user now wanted it closed. Followed the
existing `t()`/`NL` dictionary convention throughout rather than inventing a different i18n approach
for this one screen. Two implementation details worth recording: (1) `genericDetail(item, t)`
translates the *whole* `item.label` first, then splits the translated string on `"|"` — this only
works because every new `NL` entry for a `"Type | Detail"` label preserves the `"|"` in the same
position as the English source, which is now a hard constraint on any future entries in that shape;
(2) fixing `DetailRow` (shared with the Team tab's `MemberDetailModal`) to actually call `t()` on its
`label` prop retroactively translated Team's detail-field labels too, which had dictionary entries
sitting unused since earlier work. Also fixed a pre-existing, unrelated inconsistency noticed while
doing this: the left rail's "KLACHTEN EN DIAGNOSES" heading was hardcoded Dutch text regardless of
the language toggle (a leftover from the original port) — given a proper English base + `NL` pair so
it now follows the toggle like everything else.
Ruled out: leaving "Patient 360" (the screen's own heading) untranslated as a deliberate exception —
kept, on the same reasoning already established for "CAREMAPS"/"PX360" elsewhere: these read as
product/module names, not UI copy, so no `NL` entry was added for it.
Related: [docs/features/px360-tab.md](features/px360-tab.md)

**2026-09-02 — Added a My tasks / All tasks toggle, defaulted by the Case Manager assignment, not persona identity**
Why: user asked for a switcher (from Figma node 13276:179528) to filter the Activities panel's To-do
list to tasks assigned to the current persona, with one rule: "care manager" defaults to All tasks,
everyone else defaults to My tasks. The open question was what "care manager" means in an app where
no persona is permanently labeled that — `PERSONAS` only carries a static `role` string ("Care
coordinator" for Dr. Henley, "Community Nurse" for Mary Brown, "Physiotherapist" for Mike Myers), and
`TasksListScreen` already has a *similar*-looking split (`persona.id !== "dr-henley"` decides who
sees a claimable queue vs. everything) that could have been reused directly. Asked the user directly
which rule they meant; their answer ("what if you select other Care manager") confirmed they want the
default tied to whoever is *currently assigned* the Case Manager team role on *this specific
caremap* (`caremap.team.find(r => r.label === "Case manager")?.memberId === persona.id`) — so
reassigning the role, e.g. from unassigned to Mary Brown, changes whose persona gets the All-tasks
default, independent of any persona's fixed identity or static `role` label.
Ruled out: reusing `TasksListScreen`'s `persona.id !== "dr-henley"` check — that ties "sees
everything" to one specific, fixed persona rather than to the caremap's actual Case Manager
assignment, which is exactly the distinction the user's follow-up question ruled out. Also ruled out
matching on `persona.role === "Care coordinator"` (Dr. Henley's static PERSONAS label) for the same
reason — it doesn't move if the Case Manager role is reassigned to someone else.
Related: [docs/features/overview-tab.md](features/overview-tab.md)

**2026-09-02 — Simplified the My tasks / All tasks default to "All tasks" for everyone**
Why: the per-persona default (assigned Case Manager → All tasks, everyone else → My tasks) worked as
designed and was verified live, but the user asked to make it All tasks for everybody instead,
calling the conditional version harder to reason about. Removed the `isCaseManager` branch entirely
— `filterMode` now just starts at `"all"` and resets to `"all"` on every persona switch (so a manual
pick doesn't leak from one persona to the next), rather than resetting to a persona-dependent value.
`ActivitiesPanel` no longer needs the `caseManagerId` prop it was taking for this — dropped from both
its signature and the `CaremapDetail` call site. The team-role-lookup pattern this replaced didn't go
to waste: `CaremapDetail` still computes `caseManagerMemberId`/`caseManagerPersonaId` for the new
persona-switcher shortcut added the same session (see below), just no longer feeds it into this
toggle.
Ruled out: keeping both — a "smart default that also has a manual override" is arguably more
powerful, but the user explicitly asked for the simpler behavior, and a single universal default is
easier to explain in a demo than "it depends who's logged in."
Related: [docs/features/overview-tab.md](features/overview-tab.md)

**2026-09-02 — Added a Case manager quick-switch shortcut to the persona switcher**
Why: user wanted a way to simulate viewing the app as "the Case manager" from the persona switcher —
previously the only path was Team tab → assign someone → then separately switch to that persona from
the account menu, with no direct link between the two. Considered two shapes before building either:
(1) a genuinely new, 4th switchable identity literally called "Case manager", auto-assigned to that
role; (2) a quick-switch shortcut that jumps to whichever of the existing personas currently holds the
role, with no new identity. Asked the user directly; they picked the shortcut. Implemented as a small
section at the top of `AccountMenu`, above "Switch persona" — computes `caseManagerPersonaId` (root
state, alongside `persona`) from `caremap.team`, resolving to `null` unless the assigned `memberId`
matches one of the three switchable `PERSONAS` (Dr. Henley can never match, since she isn't in
`MEMBER_POOL`; an assignee outside the three personas also resolves to `null`). Threaded through every
screen that renders `TopHeader`, the same way `persona`/`onSwitchPersona` already are.
Ruled out: the new-4th-persona approach — would need its own seed data, its own place in
`PERSONAS`, and a rule for what happens to it if the *real* Case Manager assignment changes
independently, adding complexity for a scenario the shortcut already covers by reusing the two real
switchable staff personas that can actually be assigned the role today.
Related: [docs/features/persona-switcher.md](features/persona-switcher.md)

**2026-09-03 — Messages now generate notifications, showing the whole live thread**
Why: user wanted a message sent via the caremap's Messages tab to also surface under Notifications —
previously only task/role assignment did. Confirmed two specifics before building: (1) reply should
stay in the Messages tab itself, not become a second place a reply can be typed from — so the
notification's detail is read-only, with an "Open in Messages" button rather than an inline compose
box; (2) the notification list should visually differentiate message notifications from assignment
ones, not just read the same with different words. Added `kind: "assignment" | "message"` to the
notification shape; message notifications additionally carry `threadId` (so the detail panel can look
the thread up live, rather than freezing a copy of its messages at notification-creation time — an
older notification from a conversation that's since grown more replies shows the current, full
exchange) and `senderName` (so the list row can show who actually sent it, with a `MessageSquare`
icon, instead of the system-branded "Vitaly Assistant"/Bell treatment assignment notifications keep).
"Open in Messages" deep-links to the exact thread, not just the tab — a new root `openThreadId`,
read once into `CaremapDetail`'s `tab` state initializer and `MessagesTab`'s `selectedId` initializer,
then cleared at the root in a mount-only effect so it can't leak into an unrelated later visit to the
caremap.
Ruled out: notifying only on a thread's first message (not every reply) — would miss the point of "a
message was sent," since an active back-and-forth would then only ever notify once; landing "Open in
Messages" on the Messages tab in general without preselecting the thread — cheaper to build, but the
whole point of showing the live thread first was to let the user act on it immediately, and making
them re-find it in a possibly long thread list would undercut that.
Related: [docs/features/notifications.md](features/notifications.md),
[docs/features/messages-tab.md](features/messages-tab.md)

**2026-09-03 — Reverted MandatoryRoleRow's inline "Mandatory" pill back to a corner ribbon**
Why: user linked Figma node 13292:181664 and asked to fix `MandatoryRoleRow`'s design to match it —
that node shows the same diagonal ribbon banner `RoleCard` already uses, mirrored to the top-left
corner, not the inline pill badge this row had been using. That pill came from reading a different
Figma node (13068:10837) earlier in the project, which a code comment at the time explicitly framed
as the corrected, authoritative spec superseding the row's original ribbon (itself an ad-hoc guess
predating any design link at all) — in hindsight that earlier read was the mistaken one, not the
original guess. Removed the pill, added a ribbon matching `RoleCard`'s exact technique (`T.warning`
bg, `T.bodyText` text, `rotate`, clipped via `overflow-hidden` on the row) but mirrored to the left
since this row's icon sits on the left edge rather than centered on top of a vertical card. Corrected
the code comments and `team-tab-and-roles.md` that had asserted the pill was the deliberate,
Figma-verified choice, rather than leaving them stale now that the underlying claim doesn't hold.
Ruled out: leaving both devices (`RoleCard`'s ribbon and `MandatoryRoleRow`'s pill) as "different
Figma components for different card shapes, not an inconsistency" — that was the read this decision
overturns; the two really are the same design pattern applied to two card shapes, not two designs.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-09-03 — Wired up the sidebar's Collapse menu button**
Why: user asked for the sidebar to actually collapse to an icon-only rail (logo-symbol-only, no
wordmark) when clicking "Collapse menu," which had been present but inert since the app's earliest
version. Put the collapsed/expanded flag in root state rather than local to `Sidebar` — every
top-level screen (`Px360Screen`, `NotificationsScreen`, `CaremapDetail`, `CaremapsListScreen`,
`TasksListScreen`) mounts its own fresh `Sidebar` instance, since `screen` values are mutually
exclusive, so component-local state would have silently reset every time the user navigated between
them, undermining the point of a persistent layout preference. Cropped the collapsed logo from the
existing PNG asset (a fixed-width `overflow-hidden` window onto the full image) instead of asking for
or generating a second, symbol-only logo file.
Ruled out: persisting the collapsed state to `localStorage` alongside the real demo-progress fields —
not asked for, and every other piece of transient UI state in this app (modal-open flags, which tab
is active, etc.) already resets on reload, so keeping this one consistent with that rather than
carving out an exception for it.
Related: [docs/features/sidebar-collapse.md](features/sidebar-collapse.md)

**2026-09-03 — Simplified MandatoryRoleRow's copy and dropped the redundant description line**
Why: user asked to remove "Please assign a Case manager" and change the button from "Select a member"
to "Assign a case manager" — the new button label already states the row's purpose on its own, so the
separate description line beneath it was pure repetition once the button said the same thing more
directly. Also removed the "(1/1)"-style cadence prefix from every `ActivityRow` title in the
Activities panel per the same session's request — activity titles now show only the task name, with
`activity.cadence` still present on the data model (used nowhere else) but no longer rendered.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-09-03 — Removed the Additional Information stub card**
Why: user asked to remove it outright, not just leave it as an inert placeholder like the other two
`StubCard`s (Clinical Consultant, Emergency Contact) already were. Deleted the single
`<StubCard title="ADDITIONAL INFORMATION" .../>` render call from `CaremapDetail`'s Overview grid —
`StubCard` itself, and its "Not wired in this prototype." fallback-copy path, stay in place since the
other two stub cards still use them; only this one card's specific render call is gone. Left the
now-unreferenced `NL` dictionary entries for its copy in place, same as other one-off removals this
session — harmless, and not worth a separate cleanup pass.
Related: [docs/features/overview-tab.md](features/overview-tab.md)

**2026-09-03 — Added important-item red-dot markers to Comments/Messages tabs and the Caremaps list**
Why: user asked for a visible signal when a caremap has an important comment or a critical message
thread — both flags (`comment.important`, `thread.critical`) already existed in the data model (the
"Mark as important" checkbox, the "!!!" critical toggle) but had no representation outside their own
tabs, so there was no way to notice one without opening Comments or Messages specifically first. Added
`caremapHasImportantComment`/`caremapHasUrgentMessage` as the one shared definition both surfaces use:
a red dot next to the "Comments"/"Messages" tab labels in `CaremapDetail`, and a red dot on the live
patient's avatar in the cross-patient Caremaps list (`CaremapsListScreen`) — extended to "somewhere
under the Caremaps listing" per the user's own framing, rather than, say, the Tasks list or
Notifications, which weren't mentioned.
Ruled out: flagging a message thread regardless of its `resolved` state — a resolved critical thread
has already been handled, so leaving its dot lit forever would make the marker meaningless over time;
matching that same "clears once handled" behavior for comments — comments have no resolved concept
in this app at all, so an important comment stays flagged indefinitely, an intentional asymmetry
rather than an oversight.
Related: [docs/features/important-item-markers.md](features/important-item-markers.md)

**2026-09-04 — Natively ported the Documents prototype as the Documents tab, bilingual from the start, with palliative-flavored content and no-failure sources**
Why: user asked to enable the previously-inert "DOCUMENTS" patient-bar tab to match
`vitaly-documents-prototype` (running locally at :5179) — the same sibling-repo relationship PX360
already has with `vitaly-encounters-prototype`, so the same native-port pattern applied directly:
reuse this app's own `Sidebar`/`TopHeader`/`PatientBar` rather than the source repo's duplicate
shell, and `handleNavigate`/root screen-list wiring identical to PX360's own. Three explicit
requirements shaped the content: (1) build it bilingual from the start rather than English-only then
retrofitting translation later, since retrofitting PX360's translation earlier this session turned
out to be a large separate pass — avoided by wrapping every string in `t()` during the port itself;
(2) rewrite the mock documents to read as palliative-care-relevant, specifically including a
"Patient consent" and a "Professional summary" document — a lighter rewrite than PX360's Encounters
content needed, since the source repo's document set already used this app's own organisation names;
(3) make all 3 mock sources succeed every time — first entry and every later visit/refresh — with no
failed-fetch state at all, unlike PX360's Encounters (which keeps one source failing-then-retryable
by design). The source prototype's own always-fails-first "Other source" was changed to always
succeed, and the failed/retry UI branch was deleted outright from the ported Sources panel rather
than kept as unreachable dead code, since no source here can ever produce that state.
Ruled out: keeping the "empty" (zero-record) XDS source as some other outcome too — the request was
specifically about *failure*, not about every source needing visible content, and an empty-but-
successful response is a legitimate, different outcome worth keeping for variety; generalizing
PX360's own `SourcesHeader` to serve both tabs instead of writing a Documents-specific
`DocumentsSourcesPanel` — the two sources' data shapes and reachable states differ enough (Documents
has no failed/retry state, PX360's subline logic is per-category-entries vs. Documents' straight
fetched/total) that forcing one shared component would have meant carrying dead branches into
whichever tab didn't need them.
Related: [docs/features/documents-tab.md](features/documents-tab.md)

**2026-09-04 — Reverted PX360's failing source to always succeed, auto-collapsing Sources on every settle**
Why: after applying the "always succeeds, auto-collapses once settled" treatment to the new
Documents tab, user asked for the same on PX360 — explicitly: this project isn't meant to focus on
what a failed fetch looks like, and that scenario already has a home in the sibling
`vitaly-encounters-prototype` repo. This reverses a deliberate, previously-documented choice: UMC
Utrecht's always-fails-first/succeeds-on-retry behavior was built specifically to demonstrate that
failure/retry UX pattern, called out as intentional in several earlier decisions in this log. Changed
its `outcome` from `"failed"` to `"loaded"` and deleted the entire failed/retry branch — the red
"Fetch failed" subline and retry button in `SourcesHeader`, the warning-icon states in
`SourceCountIndicator`, `retrySource`, the `failedCount` derivation, and the
`everFailedRef`-gated "only auto-collapse once a fixed failure resettles" effect in
`EncountersSection` — rather than leaving any of it in as unreachable dead code, since none of it can
fire anymore. Replaced the old conditional auto-collapse with an unconditional one keyed on
`allSettled` alone, matching Documents' own effect exactly. MUMC+'s `"empty"` outcome (genuinely 0
records) was left as-is — a different, legitimate outcome from a failure, not something the request
asked to remove, same reasoning already applied to Documents' own empty XDS source.
Ruled out: keeping the failed/retry code path present-but-unreachable "in case a future request wants
it back" — speculative, and this codebase's own convention (see the Documents build) is to delete
unreachable branches rather than carry them; if a failure demo is ever wanted here again, the sibling
`vitaly-encounters-prototype` repo (explicitly named as where that scenario now lives) is the
reference, or this decision can simply be reverted.
Related: [docs/features/px360-tab.md](features/px360-tab.md),
[docs/features/documents-tab.md](features/documents-tab.md)

**2026-09-08 — Sources panels (PX360 + Documents) default to condensed, manual-expand only**
Why: a batch of four corrections requested ahead of a demo. Explicit ask: "keep status in condensed
form, unless you click on the status to expand manually." The recently-added "auto-open at fetch
start, auto-collapse 1200ms after settle" behavior on both tabs' Sources panels was the opposite of
what a demo audience should see — a status line popping open and shut on its own reads as noisy and
undermines the "click to see more" affordance the request asked for. Removed `startSimulation`'s
forced `setSourcesOpen(true)` and the `allSettled`-keyed auto-collapse `useEffect` in both
`EncountersSection` and `DocumentsSection`; `sourcesOpen` now starts `false` and is only ever
touched by the header's own click handler. A source refresh or "Show more" now loads invisibly
behind the condensed summary line unless already expanded, and an expanded panel stays expanded
through a refresh instead of being forced shut.
Ruled out: keeping the auto-open/auto-collapse behavior and just shortening its delay — doesn't
address the actual complaint, which is that the panel should never move on its own.
Related: [docs/features/px360-tab.md](features/px360-tab.md),
[docs/features/documents-tab.md](features/documents-tab.md)

**2026-09-08 — Removed "Initial PZP conversation" from the Set Plan task list**
Why: same pre-demo correction batch — explicit ask to remove the "PZP conversation task" from
caremap settings. Deleted the `sp2` entry from `SET_PLAN_ITEMS` outright rather than hiding or
disabling it; confirmed via grep it had no other code dependency (unlike `sp1`, which
`syncCaseManagerActivity`/`CASE_MANAGER_ACTIVITY_ID` special-case), so removing the array entry alone
cleanly drops it from both the Set Plan modal and the Overview to-do list it's derived from. Also
removed its now-orphaned `NL` dictionary entry ("Initial PZP conversation" / "Eerste PZP-gesprek").
Ruled out: toggling it off by default instead of deleting — the request was to remove the task, not
make it optional; it's still listed as mandatory in the Figma-sourced plan config with no toggle.
Related: [docs/features/set-plan-and-activate.md](features/set-plan-and-activate.md)

**2026-09-08 — Assignee field available for every task status**
Why: same pre-demo correction batch — explicit ask that "for all statuses of the tasks, there should
be an option for assignee." `NO_ASSIGNEE_STATUSES` (`undefined`/`required`/`planned`) previously hid
the "Assign to" field in Add/Edit Activity for tasks without a concrete scheduled date, on the
reasoning that assigning-to-staff only made sense once a date existed to staff against. Emptied the
array (`[]`) rather than restructuring the 4 call sites in `AddActivityModal`/`EditActivityModal`
that check it — lowest-risk change given the fix needed to land before a demo, and the gating logic
itself stays in place (inert) if a future request wants it reinstated for a subset of statuses.
Ruled out: removing the now-dead conditionals at all 4 call sites — more thorough/consistent with
this codebase's usual dead-code-removal convention, but a larger diff to verify under time pressure
for no behavior difference.
Related: [docs/architecture.md](../architecture.md)

**2026-09-08 — Translated "Advanced Care Planning (ACP)" to "Proactieve Zorgplanning (PZP)" in Dutch**
Why: same pre-demo correction batch. The HIS start screen's ACP row previously used the English
acronym unchanged in the Dutch UI — the app already has a real Dutch term for this concept ("PZP")
used elsewhere in the product (Set Plan, PZP tab), so the untranslated English acronym read as an
oversight next to it. `AppRow`'s `title` prop was already wrapped in `t()`, so this needed only a new
`NL` dictionary entry, no JSX change.
Ruled out: none — single dictionary entry, no real alternative to weigh.
Related: [docs/features/his-start-screen.md](features/his-start-screen.md)

**2026-09-08 — Added a spinning loader to the "Loading first results…" placeholder (PX360 + Documents)**
Why: direct follow-up to defaulting the Sources panels to condensed/manual-only — with the breakdown
no longer visible by default, the initial-fetch placeholder text ("Loading first results…") became
the only on-screen signal that anything was happening, and it was static. Added lucide-react's
`LoaderCircle` (Tailwind's `animate-spin`) next to that text in both PX360's `EncountersSection` and
the Documents tab's equivalent, styled in `T.primary` to match the app's existing spinner-free
loading conventions elsewhere (e.g. the refresh button's tap animation).
Ruled out: animating the collapsed Sources header's own pending icon instead — that's a smaller,
easy-to-miss target and doesn't help the moment that actually has zero content on screen (before any
`visibleItems` have arrived).
Related: [docs/features/px360-tab.md](features/px360-tab.md),
[docs/features/documents-tab.md](features/documents-tab.md)

**2026-09-08 — Added "Remove from team," scoped to formal roles only, reachable from both Overview and the Team tab**
Why: explicit request — click a team member, see their info, and have an option to remove them, in
both places. Overview's `TeamSummary` already opened a read-only `MemberDetailModal` on click; the
Team tab's `RoleCard`s didn't open anything at all (just inline email/phone + a separate "Re-Assign
member" button), so that card's avatar/name/contact-info block became clickable too, opening the
same shared modal.
Deliberately scoped removal to formal team roles (Case Manager + any other named role) only — not to
people who show up via an activity assignment, and not to the caremap's creator. Gated by a `roleId`
prop on the modal: set only for a real `TeamRole` entry, so those two other categories still open the
same info popup but with no Remove button. Removing an activity-assignee isn't a single team-entry
change — it would mean editing every activity that references them — a different, larger feature; the
creator is fixed metadata, not a role, so removal doesn't apply to them at all.
Removing the Case Manager clears its `memberId` (mandatory slot, reverts to "not yet assigned")
rather than deleting the team entry; removing any other role deletes the entry outright, since those
roles only exist because someone was assigned to them in the first place — matches the existing
"roles created on demand" model. Also fixed `syncCaseManagerActivity`, which previously only ever
advanced the "Assign Case manager" to-do item to completed and had no path back — now it also reverts
that item to `undefined` when the role becomes unassigned, so removal doesn't leave a stale "done"
task behind.
No confirmation step before removing — matches how this prototype already treats other reversible
demo actions (e.g. re-assigning a role).
Ruled out: also making activity-only assignees and the creator removable from this same dialog —
asked for "team member" removal specifically, and unassigning an activity-assignee is a different
operation (per-activity, not per-team-entry) that wasn't part of the request.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-09-08 — Removed the role dropdown from the open-ended "add a member" flow**
Why: explicit request, made against a screenshot of `AssignRoleModal`'s "Wijs lid toe aan rol:
[Community nurse ▾]" line. Clarified scope first (asked which of a few readings was meant): keep the
open-ended add-a-member flow itself, just drop the upfront role choice — go straight to the person
picker, and label whoever's picked by their own job title instead of a chosen role name (same
convention `extraActivityAssignees` already uses for activity-only assignees).
Removed the `ROLE_POOL` dropdown/label and the now-unused `ROLE_POOL` constant itself. Added
`handleAddTeamMember(memberId)`, used only by this open-ended path, which always creates a fresh
`TeamRole` entry rather than reusing `handleAssign`'s find-or-create-by-label logic — with no chosen
role name to key on, two different people sharing a job title (e.g. two different Oncologists) would
otherwise collide onto the same entry via a label lookup. `handleAssign` itself is now only ever
called with an already-existing role's label (Case Manager, or another role's own label via its
card's "Re-Assign member" button), so its now-dead "create new" branch was removed too.
Ruled out: a free-text role input instead of the dropdown — user picked the plain-job-title option
over that when asked.
Related: [docs/features/team-tab-and-roles.md](features/team-tab-and-roles.md)

**2026-09-09 — Made "Record patient goals and whishes" and "Record treatment wishes" optional, and defaulted every Set Plan toggle to Off**
Why: explicit request against a screenshot of the Set Plan modal's mandatory rows. Changed `sp3` and
`sp4` in `SET_PLAN_ITEMS` from `toggle: false` (fixed "Mandatory" label) to `toggle: true` — same
`ToggleField` treatment `sp5`/`sp6` already had — leaving only `sp1` ("Assign Case manager") as truly
mandatory. Proposed defaulting the two newly-optional items to On (preserving their previous
always-included behavior); the user then asked to default *every* toggle to Off instead, including
`sp5` (which previously defaulted On) — so a fresh caremap's plan now starts as just the Case Manager
assignment, and every other item requires a deliberate opt-in.
Also fixes the now-unused mandatory note in `EditActivityModal` for these two activities going
forward (`mandatory: !item.toggle` is derived, so it flips automatically) — verified via a demo reset
+ fresh caremap that the new defaults actually apply (an already-created caremap keeps its own
previously-saved `planToggles`, so the new default only affects caremaps created from here on).
Ruled out: defaulting the two new items to On as first proposed — superseded once the user asked for
all-Off.
Related: [docs/features/set-plan-and-activate.md](features/set-plan-and-activate.md)

**2026-09-09 — Dr. HENLEY, Maria's persona role changed from "Care coordinator" to "GP"**
Why: explicit request against a screenshot of the persona switcher. Her `PERSONAS` entry (`dr-henley`)
had `role: "Care coordinator"`, but every other place she's referenced already calls her a GP —
`caremap.createdBy: { name: CURRENT_USER_NAME, jobTitle: "GP" }` at caremap creation, and the ACP
start-screen row is framed as a GP's own app. "Care coordinator" was an inconsistent leftover label
that never matched her actual role elsewhere in the prototype. Removed the now-orphaned "Care
coordinator" → "Zorgcoördinator" `NL` dictionary entry (nothing else referenced it); "GP" already had
an existing translation ("Huisarts"), so no new entry was needed.
Ruled out: none — straightforward label correction, no real alternative to weigh.
Related: [docs/features/persona-switcher.md](features/persona-switcher.md)

**2026-09-09 — Fixed Set Plan toggle rows not right-aligning their switch**
Why: user-reported visual bug against a screenshot. Each plan-item row's right-side column
(`text-right` div) wraps a `ToggleField` button above a subtext line. `text-align: right` only
right-aligns *inline/text* content — it has no effect on `ToggleField`'s root `<button>`, which is a
block-level flex box, so the button stayed pinned to that column's own left edge instead of the
column's (and card's) right edge, while the subtext beneath it — plain text, correctly right-aligned
— was not, producing a visible gap under the switch whenever the subtext ("Due: 2 weeks", "Every 3
weeks") was wider than the button. Confirmed via `getBoundingClientRect()` on both elements before
and after the fix. Changed both branches' wrapper from `text-right` to `flex flex-col items-end
text-right` — flexbox `items-end` reliably right-aligns any child regardless of whether it's inline
text or a block-level element, which `text-align` alone can't guarantee.
Ruled out: adding `ml-auto` directly on `ToggleField`'s button instead — works too, but fixing the
wrapper is more robust against future children of either kind being added to this column.
Related: [docs/features/set-plan-and-activate.md](features/set-plan-and-activate.md)

**2026-09-24 — Expanded PX360 to all BgZ categories, data-driven**
Why: user asked for PX360 to present the standard BgZ categories. Two user-research priority lists
(doctors; nurses/administration) set the order, but all of them should be there. That means 14 new
categories next to the existing 3. Each of the existing 3 was hand-written in three places (rail
button, list branch, Filters drawer branch), so first turned them into one `PX360_CATEGORIES` list
with a generic record list (`RecordCard` / `RecordDetailBlock`). Then the new categories were just
data: 3–5 records each, written around this patient's existing story (PZP, Encounters, HIS side
panel), per the user's "realistic case" requirement. The category list follows the Figma "Edit
dashboard" frame, which already lists BgZ, plus Laboratory results (BgZ "Uitslagen"), which maps to
"Diagnostics" in the research lists. The same list will drive the upcoming Dashboard and Customize
view. The status pills became real filters with a BgZ-appropriate pair per category, and the page's
organisation/time dropdowns now apply to every category, not just Encounters. Both are needed for
the categories to behave consistently. This reverses the 2026-08-31 choice to keep the pills static
"because Encounters' own aren't interactive": all categories now change together, so they stay
consistent.
Ruled out: copying the hand-written branch 14 more times (thousands of duplicated lines, and the
Dashboard would need a third copy); including the non-BgZ items from the research lists
("Correspondence", "Current care situation", "Admission and discharge", "Data from other care
organisations"), which the user said to leave out as likely mistranslations; adding the Dutch mock
content to the main `NL` dictionary (~200 mock-data lines far away from the data they translate),
so it's merged in from a block beside the records instead.
Related: [docs/features/px360-tab.md](features/px360-tab.md)
