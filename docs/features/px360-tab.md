# PX360 tab (native port of vitaly-encounters-prototype)

**Status:** In progress — BgZ categories and Dashboard done; Customize view next

## What it does

Clicking "PX360" in the patient bar (from inside a caremap, or from the PX360 screen itself) opens
a full Patient 360 / Encounters view for the same patient (De Vries, Jan) — a native port of the
sibling [vitaly-encounters-prototype](https://github.com/tommyknocker81/vitaly-encounters-prototype)
repo, not an iframe or external link. It simulates progressive multi-source clinical data loading:
5 mock sources with different delays and outcomes (loaded, empty, one deliberately slow — no source
ever fails, see decision log), server-side pagination ("Show more"), merge-on-arrival with a "new
entries available" banner when you've scrolled into the page, sort, and a filter drawer. The Sources
breakdown panel stays condensed by default — loading happens behind the "Sources (N/5 loaded)"
summary line, which only expands on a manual click and stays however you last left it.

The left rail lists all 17 BgZ (Basisgegevensset Zorg) categories — the same set the Figma "Edit
dashboard" frame offers — with the ones the two user-research groups ranked most relevant first:
Encounters, Complaints and diagnoses, Treatment restrictions, Allergies, Medication, Procedures,
Laboratory results, Healthcare providers, then Alerts, Functional status, Vital signs, Social
history, Contact persons, Medical devices, Vaccinations, Demographics and identification, and
Financial information. Every category except Encounters shows static (not live-fetched) mock
records — 3–5 each, all about this patient — with the same expandable cards, status pills, sort,
and Filters drawer as Encounters.

PX360 opens on a **Dashboard** sub-tab (Figma 13561-53679). A "Dashboard | Detailed information"
switch sits next to the "Patient 360" title. Detailed information is the left-rail view described
above. The Dashboard shows:
- a pinned red **treatment restriction** banner with the patient's current CPR decision ("Not for
  resuscitation"), which opens Treatment restrictions in the Detailed view when clicked;
- a 2-column grid of category cards (by default the same six as the Figma frame: Encounters,
  Complaints and diagnoses, Allergies, Medication, Procedures, Alerts). Each card shows the 3 most
  recent records, working status pills, a Filter link, and "Show all (N)" when there are more. Records expand in place.
  The card header collapses the card.

**Planned next:** a "Customize view" modal (Figma 12326-242709) with 1/2/3-column layouts and
per-category toggles. The layout should survive a reload and be cleared by Reset demo. Filters
inside the modal ("Set filter") come later. The Figma frame's timeline and use-case switcher are
deliberately left out for now.

## Implementation notes

- Ported wholesale from `EncountersPrototype.jsx` (~1,250 lines of the ~1,370-line source file —
  everything except that repo's own standalone page shell). The two prototypes' design-token
  objects (`T`) were already identical value-for-value (both pulled from the same Figma file), so
  this app's existing `T` is reused directly — no merging or duplicate token set.
- **Reuses this app's own chrome instead of duplicating a second one.** The source repo is a
  complete standalone app with its own Sidebar, TopHeader, and PatientBar; porting those verbatim
  would have nested a second sidebar/header inside this app's. Instead, `Px360Screen` (new,
  `CaremapsPrototype.jsx`) assembles the same `Sidebar` / `TopHeader` / `PatientBar` this app
  already uses elsewhere, and only the Encounters-specific content
  (`EncountersSection` and its filter dropdowns) came from the port.
- **Patient identity is unified for free.** The source prototype's hardcoded patient was "Leroy
  Matt Evans," 16yo — but since `Px360Screen` reuses this app's own `PatientBar` (which already
  hardcodes De Vries, Jan), no patient-identity code needed porting or changing at all.
- **Mock encounter content was rewritten**, not just the patient's name — the original data was
  authored around a teenager (pediatrics consultations, a sports-injury wrist fracture, an asthma
  review) and would have read as obviously wrong next to a 73-year-old's palliative-care story.
  Diagnoses/visit-type labels were swapped for age-appropriate ones consistent with the PZP content
  (COPD, respiratory decline, oncology) — e.g. "Suspected wrist fracture" → "Acute breathlessness,"
  "Pediatrics consultation" → "Geriatrics consultation," "Asthma review" → "COPD review." Every
  date, delay, pagination count, organisation name, and the failure/retry/empty-source behavior
  were left untouched, so the loading mechanics being demonstrated are identical to the original.
- **Navigation**: `PatientBar`'s tabs were previously decorative (`CAREMAPS` was always
  hardcoded-active); it now takes `activeTab`/`onTabClick` props, and `onTabClick` reuses the same
  `onNavigate`/`handleNavigate` plumbing `Sidebar` already used — `handleNavigate("PX360")` sets
  root `screen` to `"px360"`, same pattern as `"Home"` (Sidebar logo) and `"Caremaps"`/`"Tasks"`.
  `PX360` and `CAREMAPS` are wired; `CONTACTS`/`DOCUMENTS`/`REFERRAL` stay inert. `CAREMAPS` was
  initially a silent no-op — its tab label (`"CAREMAPS"`) didn't match the Sidebar's `"Caremaps"`
  string that `handleNavigate` checked for — fixed to jump straight to this patient's own Caremap
  Overview (`"detail"`) rather than the Sidebar's cross-patient `"list"` destination, since
  `PatientBar` is always in a single-patient context. `Px360Screen`'s own "Back"
  goes to `"start"`, matching `CaremapDetail`'s existing Back behavior exactly (not to `"detail"`).
- **Now fully translated**, matching the rest of the app's `t()`/`NL` dictionary pattern — this was
  a deliberate follow-up once the user noticed PX360 stayed English regardless of the language
  toggle. Everything in the content area follows the toggle: category headings/left rail, the
  Sources panel (title, "N/5 loaded", "Complete as of"/"Updated:", per-source subtext including the
  templated "N record(s) loaded"/"Latest N of M records loaded" strings — those two use a
  `lang === "nl" ? ... : ...` template like `ThreadDetail`'s message-count string elsewhere in the
  app, since a count can't be a fixed dictionary key), the Past/Planned/Sort/Filters toolbar, the
  full Filters drawer (Status, Encounter type, Care provider, Type, Clear all filters — all three
  categories), the "All organisations"/"All time" dropdowns (`orgFilterLabel` now takes `t` as a
  parameter since it's a plain function, not a component), and every expanded-card detail field
  (`OrgDetailBlock`/`DiagnosisDetailBlock`/`RestrictionDetailBlock`).
  - `genericDetail(item, t)` (Encounters' fallback detail-builder for items without a hand-authored
    `ENCOUNTER_DETAILS` entry) translates `item.label` *first*, then splits the already-translated
    string on `"|"` — works only because every NL translation of a `"Type | Detail"` label
    deliberately preserves the `"|"` in the same position as the English original.
  - Fixing `DetailRow` (shared by every PX360 detail block *and* the Team tab's
    `MemberDetailModal`) to actually call `t()` on its `label` prop retroactively fixed Team's
    "Job title"/"Organisation"/"Email"/"Phone" labels too — they had `NL` dictionary entries from
    earlier work but were never wrapped in `t()` until this pass.
  - `DIAGNOSIS_FILTER_TYPES.map`/`TREATMENT_FILTER_TYPES.map`/`FILTER_TYPES.map` (the Filters
    drawer's checkbox lists) all used `t` as their `.map()` callback parameter name, which would
    have shadowed the real `useLanguage()` `t()` the moment a translation call was added inside — a
    known recurring pattern in this codebase (see decision log) — renamed to `ft` before wrapping.
  - "Patient 360" (the screen's own `<h2>` heading) is deliberately left untranslated, same as
    "CAREMAPS"/"PX360" tab labels elsewhere — treated as a product/module name, not UI copy.
- **Klachten en diagnoses / Treatment restrictions** were originally static, permanently-inert
  header rows in the ported code (a fake-loading `CategoryTick` timer was the only wired
  behavior — even in the source `vitaly-encounters-prototype` repo, neither category ever had real
  body content; `CategoryTick` and its timers were later removed once the Sources panel unification
  below made them redundant). Made them a second/third view over the same right column: `EncountersSection`
  gained an `activeCategory` state (`"encounters" | "diagnoses" | "treatment"`), the left-rail rows
  became buttons that set it (styled the same active/inactive way `ENCOUNTERS` already was), and the
  Encounters-specific right-column content (title, sources panel, sort/filter, item list, show more)
  is now wrapped in `activeCategory === "encounters" && (...)` with two sibling blocks for the other
  two. Reuses the exact same collapsed-row/expand-card visual pattern as Encounters (date + org
  header line, bold label + chevron, `AnimatePresence` height expand) and the same `expandedIds` /
  `toggleExpand` state — new components `DiagnosisDetailBlock` and `RestrictionDetailBlock` render
  the different field sets inside that expand (Explanation/Anatom. location/Laterality/Verification
  status/Status/Date for diagnoses; Limits/Verified By/Verification date for restrictions), styled
  after screenshots the user supplied of the intended design.
  - Diagnosis content (`DIAGNOSIS_ENTRIES`) ties directly into the PZP tab's own established
    narrative — reuses its "Main diagnosis" (metastatic non-small-cell lung carcinoma) and "Relevant
    comorbidity" (moderate COPD) verbatim, plus a Type 2 Diabetes diagnosis and a knee-pain
    complaint kept close to the reference screenshots.
  - Treatment-restriction content (`RESTRICTION_ENTRIES`) tells a two-record history: an older
    (2023) "yes, but with limitations" GP record from the reference screenshot, followed by a more
    recent (2026) "Not for resuscitation" record that matches the PZP tab's own resuscitation
    field word-for-word — read together they show the decision as it evolved, which is exactly the
    kind of fragmented-across-time picture PX360 exists to aggregate.
- **Diagnoses/Treatment also get the Past/Planned pills, Sort, and Filters row** — the same
  interaction Encounters has, not just the same card style. Extracted that whole row into a shared
  `CategoryToolbar` component (Past/Planned pills, the sort dropdown, the Filters button + count
  badge) — it's safe to reuse one `sortOrder`/`sortMenuOpen`/`filtersOpen` state across all three
  categories since only one is ever mounted at a time (they're mutually exclusive by
  `activeCategory`). (The pills were static labels at this point; they became real per-category
  filters with the BgZ expansion — see below.)
  - **Sort** re-sorts `DIAGNOSIS_ENTRIES`/`RESTRICTION_ENTRIES` by `parseDMY(item.date)` (both
    already plain `DD/MM/YYYY` strings, simpler than Encounters' `sortDate` field) using the same
    shared `sortOrder`; switching category keeps whatever order you last picked.
  - **Filters** reuses the same drawer container/backdrop/animation, but its content branches on
    `activeCategory`: Encounters keeps its existing Status/Encounter type/Care provider sections
    unchanged; Diagnoses and Treatment each get a single "Type" section, driven by
    `DIAGNOSIS_FILTER_TYPES`/`TREATMENT_FILTER_TYPES` — the distinct `label.split("|")[0]` prefixes
    already present in each category's data ("Diagnosis"/"Complaint" for the first, just
    "Cardiopulmonary resuscitation" for the second, so that one is a single-checkbox filter today).
    Own `diagnosisTypeFilters`/`treatmentTypeFilters` `Set` state and toggle/clear functions, kept
    separate from Encounters' `typeFilters` since the two taxonomies don't overlap.
- **Diagnoses/Treatment also get the "Sources (N/5 loaded)" breakdown**, and it's not a
  per-category copy — all three categories share the *exact same* fetch. Narratively that already
  made sense (one PX360 integration against 5 organisations, not three separate integrations that
  happen to hit the same 5 names), and technically it fell out of `sourceStatus`/`loadedCount`/
  `allSettled` already being computed once at the top of `EncountersSection`, not scoped inside the
  Encounters-only branch. Extracted the header-row-plus-breakdown-panel markup into a shared
  `SourcesHeader` component (title text is the only thing that varies) and the left-rail's live n/5
  indicator into `SourceCountIndicator`, then used both for all three categories. This replaced
  Diagnoses/Treatment's old independent `CategoryTick` fake timers (~4–12s random completion, no
  relation to the real fetch) — those are now deleted along with `CategoryTick` itself. Since no
  source can fail (see below), all three categories' left-rail ticks now only ever flip to the same
  settled/done state together — they're reading the same `sourceStatus` object.
- **No source can fail — reverted, per explicit request.** UMC Utrecht used to always fail on its
  first fetch, succeeding only via a manual retry (`retryOutcome`) — a deliberate demonstration of
  that failure/retry UX pattern, called out multiple times earlier in this project as intentional.
  Per a later, explicit request to make PX360 (and the sibling Documents tab) always succeed, its
  `outcome` was changed from `"failed"` to `"loaded"`, and the whole failed/retry branch — the red
  "Fetch failed" subline, the retry button, `retrySource`, the `failedCount` derivation, the
  `everFailedRef`-gated "only auto-collapse once a failure gets fixed" effect — was deleted outright
  from `SourcesHeader`/`SourceCountIndicator`/`EncountersSection` rather than kept as dead code, since
  none of it can ever fire anymore. MUMC+ still resolves `"empty"` (genuinely 0 records) — a
  different, legitimate outcome from a failure, not something the request asked to remove.
- **The Sources panel defaults to condensed and stays manual-only**, per a later explicit request
  ("keep status in condensed form, unless you click on the status to expand manually," ahead of a
  demo). Earlier iterations auto-opened the panel at the start of every fetch (`startSimulation`)
  and auto-collapsed it 1200ms after every settle; both behaviors were removed — `sourcesOpen` now
  starts `false` and is never touched by the fetch lifecycle, only by the header's own click handler.
  A refresh or "Show more" now loads invisibly behind the condensed summary line unless you've
  already expanded it, and an expanded panel stays expanded through a refresh instead of being
  forced shut. Same change applied to the Documents tab's own Sources panel.
  - **The initial "Loading first results…" placeholder now carries a spinning `LoaderCircle`**,
    added per a later follow-up request once the Sources panel above stopped auto-opening — with
    the breakdown condensed by default, this placeholder is the only thing on screen during the
    initial fetch, so a static line of text no longer read as "in progress." Same treatment on both
    PX360 (`EncountersSection`, before any `visibleItems` have arrived) and the Documents tab's own
    equivalent placeholder.
  - **The per-source subtext ("Latest N of M records loaded") is category-aware**, not reused
    verbatim from Encounters. `sourceStatus[id].fetched`/`.total` are Encounters' own pagination
    counts (e.g. Maastricht UMC+'s real 16-record history) — showing "Latest 10 of 16" under
    Diagnoses (4 entries total, all from `DIAGNOSIS_ENTRIES`) would just be the wrong numbers, not a
    simplification. `SourcesHeader` takes an optional `categoryEntries` prop (the category's own
    array, e.g. `DIAGNOSIS_ENTRIES`/`RESTRICTION_ENTRIES`; omitted for Encounters, which keeps its
    existing fetched/total behaviour); when set, each source's subtext instead counts
    `countByOrg(categoryEntries, source.name)` — that org's own record count for *this* category —
    and always shows it once the source has settled (no partial-loaded case to hide, since these
    categories have no pagination): "No records found for this patient" when 0, "N record(s)
    loaded" otherwise. Fixed a latent data bug this surfaced: `RESTRICTION_ENTRIES`' `r1` had
    `source: "GP"`, which didn't match any of the 5 real organisation names, so it would have
    silently never been counted against any source — corrected to
    `"GP Practice de Linde, Amersfoort"` (the same org as `r2`, which also reads better as one
    practice's resuscitation-decision history over time rather than an unnamed "GP").

- **BgZ categories are data-driven** (added 2026-09-24). `PX360_CATEGORIES` is the single list
  that drives the left rail, the list title, the status pills, and the Filters drawer. Each record
  category has its own `*_ENTRIES` array (`DIAGNOSIS_ENTRIES`, `ALLERGY_ENTRIES`,
  `MEDICATION_ENTRIES`, …). Before this, Encounters/Diagnoses/Treatment were each hand-written in
  three places (rail button, list branch, drawer branch). That was fine for 3 categories but not for 17. Encounters keeps its
  own paginated branch; every other category renders through one generic branch using
  `RecordCard` / `RecordDetailBlock` — `DiagnosisDetailBlock` and `RestrictionDetailBlock` were
  folded into it (each record now carries its own `detail: [{ label, value }]` field list).
  - Record shape: `label` is `"Type | Detail"`; `source` must be one of `SOURCE_CONFIG`'s names
    (so the Sources panel counts it — nothing comes from MUMC+, which always returns empty);
    `phase` picks the status pill; optional `type` overrides the Filters "Type" key (Medication
    groups by drug class, since its label prefix is the drug name); optional `severity`
    (allergies: high/moderate/low → the Figma dashboard's three-dot indicator) and
    `tone: "danger"` (red label, used for treatment restrictions and the penicillin allergy).
  - **Status pills now filter.** Previously "Past (N)" / "Planned (0)" were static labels in all
    three categories. Each category now declares its own BgZ-appropriate pair (Active/Resolved,
    Current/Previous, Active/Stopped, Past/Planned), or a single "All (N)" when no status split
    applies (lab results, vital signs, providers, …), and clicking a pill filters the list.
    Encounters' Planned pill shows an empty list, since every mock encounter is in the past;
    "Past (24)" is still the hardcoded server-side total.
  - **The page-level "All organisations" / "All time" dropdowns now also filter the record
    categories.** Before, they only applied to Encounters, and Diagnoses/Treatment ignored them.
  - **Translations for the BgZ mock content** sit in an `Object.assign(NL, {...})` block right
    after the records, instead of the main `NL` dictionary, so ~200 lines of mock-data Dutch sit
    next to the data they translate. They're resolved by the same `t()`. Status-pill labels use a
    `px360Phase:` scope because "Resolved" is already "Afgerond" for tasks. Filter "Type"
    checkbox labels are taken from the *translated* record label's prefix, so no separate
    dictionary entry per type is needed.
  - Content deliberately extends the existing story rather than inventing a new one. Examples: the
    penicillin allergy matches the Figma sample; the codeine intolerance explains why he's on
    morphine; the contrast allergy dates from the Encounters list's CT chest; the pneumonia
    diagnosis, CRP result and pleural puncture all date from the 16/08/2025 "Acute breathlessness"
    admission; the treatment restrictions match the PZP tab's "Treatment wishes and boundaries";
    the demographics and insurer (FBTO V02110) match the HIS side panel.
  - Rail labels now use CSS `uppercase` on the normal title-case label (the old separate
    `"ENCOUNTERS"`-style dictionary keys were removed). The rail scrolls within itself
    (`max-h-[calc(100vh-190px)]`) once the page is scrolled down a long Encounters list.

- **Dashboard sub-tab** (added 2026-09-24). `Px360Screen` holds `view` ("dashboard" default |
  "detailed") and renders `Px360ViewSwitch`. The org/time dropdowns moved to their own row under
  the title, as in Figma. `EncountersSection` renders either view, because the Dashboard needs the
  same shared fetch, merged encounters, per-category status pills, type filters and expanded-row
  state. Keeping one owner means a pill picked on a card is still selected in the Detailed view, and
  the reverse. `recordListFor(cat)` is the single place a record category's list is computed
  (org/time dropdowns → status pill → Type filter → sort), used by both views.
  - Components: `DashboardCard` (Figma "BGZ category" 13561-53836), `DashboardRow` (its "BGZ header"
    item: rows split by a rule, label in body colour, not primary), and `TreatmentRestrictionBanner`
    (13561-53814; `#FFEBEB` / `#C74139` come from Figma exactly and differ from the app's own
    `T.danger`). The banner picks the most recent `phase: "current"` restriction that has a
    `permitted` flag (only the CPR records have one), and shows a green check if permitted or a
    red X if not.
  - The card limit is `DASHBOARD_CARD_LIMIT = 3`, agreed with the user instead of scrolling
    inside cards. "Show all" and "Filter" call `openInDetailed(catKey)`, which switches the view,
    selects the category and scrolls to the top ("Filter" also opens the drawer).
  - `DASHBOARD_DEFAULT` (`columns: 2` plus the six visible keys) is a constant for now. The
    Customize view will make it state saved in localStorage. Cards go into columns round-robin in
    `PX360_CATEGORIES` order.
  - The Encounters "Past (N)" count is now `ENCOUNTER_TOTAL` (every record across `SOURCE_CONFIG`,
    currently 21) instead of the hardcoded 24 from the original prototype, which never matched the
    mock data. That became visible once the Dashboard showed "Show all (N)" next to it.
  - Icons are lucide equivalents rather than the Figma file's own SVGs, the same as the rest of this
    app. The Figma "NEW" tags on some card titles were left out, since they read as design-review
    markers, not product UI.

## Open questions

- BgZ has no direct home for four items from the user-research lists ("Correspondence",
  "Current care situation", "Information for admission and discharge", "Data from other care
  organisations"). Per the user, they were left out as likely translation artefacts.
  "Relevant appointments" maps to Encounters, "Involved providers" to Healthcare providers,
  "Diagnostics" to Laboratory results, and "Treatment preferences / ACP" to Treatment
  restrictions.

- The original `vitaly-encounters-prototype` repo itself was **not** updated — its patient is still
  "Leroy Matt Evans." The native port made that unnecessary for this app, but the two repos'
  content has now diverged; worth keeping in mind if that sibling prototype is ever demoed on its
  own.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Natively ported the Encounters prototype as the PX360
  tab", "Gave Diagnoses and Treatment restrictions the same Status/Sort/Filters row as Encounters",
  "Translated PX360's content area to follow the language toggle", "Reverted PX360's failing source
  to always succeed…" (its auto-collapse part was later replaced by "Sources panels (PX360 +
  Documents) default to condensed, manual-expand only"), "Expanded PX360 to all BgZ categories,
  data-driven"
