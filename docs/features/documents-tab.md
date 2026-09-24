# Documents tab (native port of vitaly-documents-prototype)

**Status:** Complete

## What it does

Clicking "DOCUMENTS" in the patient bar opens a full Patient 360 / Documents view for the same
patient (De Vries, Jan) — a native port of the sibling
[vitaly-documents-prototype](https://github.com/tommyknocker81/vitaly-documents-prototype) repo,
same treatment PX360 got from `vitaly-encounters-prototype`. Simulates progressive multi-source
document loading (3 mock sources), server-side pagination ("Show more"), merge-on-arrival with a
"new documents available" banner, a left-rail category filter with live counts, additional
author/organisation/date/name filters, and a sortable Date column.

## Implementation notes

- Ported wholesale from `DocumentsPrototype.jsx`'s `DocumentsSection` (~530 lines of the ~845-line
  source file — everything except that repo's own standalone page shell). Same rationale as PX360:
  `DocumentsScreen` (new) assembles this app's own `Sidebar`/`TopHeader`/`PatientBar` instead of
  duplicating a second chrome, so De Vries, Jan's identity carries over for free — no patient-identity
  code needed porting at all.
- **Built bilingual from the start**, unlike PX360 (which shipped English-only and needed a separate
  translation retrofit later, once the user asked for it). Every user-facing string here already
  goes through `t()` with an `NL` dictionary pair. Several UI-chrome strings (Sources panel,
  "FILTERS", "Clear filters", "Please select", "Complete as of"/"Updated:", "Loading first results…",
  the `lang === "nl" ? ... : ...` template for "Latest N of M records loaded") reuse the exact
  dictionary entries PX360 already established, rather than duplicating near-identical keys.
  `FilterField`, `Select`, `selectStyle`/`selectCls`, `StatusIcon`, `FadeSwap`, `formatClock`,
  `iconSpring`/`cardSpring`, and `Btn` are all reused as-is from elsewhere in this file rather than
  re-implemented — the filter row (Document name/Author/Organisation/From/To) matches
  `CaremapsListScreen`/`TasksListScreen`'s own filter-row styling exactly by reusing `FilterField`,
  which also means the "To" date-range label automatically resolves to "Tot" via that component's
  existing `"dateFilter"` translation-context scoping — no new collision-avoidance code needed.
- **Mock content rewritten to fit the palliative-care narrative**, per explicit request — but a much
  lighter pass than PX360's Encounters content needed, since `vitaly-documents-prototype`'s original
  mock data (MDT reports, X-rays, lab results, discharge summaries) already used this app's own
  organisation names (Maastricht UMC+, GP Practice de Linde Amersfoort, UMC Utrecht) rather than
  needing a full patient-identity rewrite. Several document *names* were reworded to read as
  explicitly palliative (`"Admission request"` → `"Palliative care admission request"`,
  `"Progress note"` → `"Palliative care progress note"`, `"Nursing note"` → `"Palliative nursing
  note"`, `"Consent form"` → `"Treatment consent form"` — renamed so it wouldn't collide in name with
  the new document below) — document *types* were left as their original, more generic
  classification (e.g. type stays `"Admission request"` even though the name is now more specific),
  matching how a real EHR separates a document's class from its title.
  - Two new documents were added specifically per request: **"Patient consent"** (`ZorgPlatform`,
    category `consents`, authored by Dr. HENLEY, Maria — this app's own GP persona) and
    **"Professional summary"** (`Other source`, category `assessments`, type `"Clinical summary"`).
    Both are dated close to the live caremap's own creation (12/8/2026) rather than sitting arbitrarily
    in the past, tying them narratively to the patient entering palliative care.
- **All three sources always succeed — first entry and every subsequent visit/refresh alike.** The
  source prototype's "Other source" was scripted to always fail on its first fetch and only succeed
  on a manual retry (demonstrating that failure/retry state, mirroring PX360's own UMC Utrecht
  source); per explicit request this tab shouldn't ever show a failed fetch, so `DOC_SOURCES`'
  `outcome: "failed"` was changed to `"loaded"` and the whole failed/retry branch was deleted from
  `DocumentsSourcesPanel` (PX360's `SourcesHeader`) rather than left in as unreachable dead code —
  since no `DOC_SOURCES` entry can ever produce that state here, the UI for it would never render.
  `XDS` still resolves as `"empty"` (genuinely 0 records) — kept deliberately, since an empty-but-
  successful response is a different, legitimate outcome from a failure, not something the request
  asked to remove, and it keeps some visible variety across the three sources.
- **The Sources panel defaults to condensed and stays manual-only**, per a later explicit request
  ("keep status in condensed form, unless you click on the status to expand manually," ahead of a
  demo) — reversing an earlier iteration where `startSimulation` forced the panel open at the start
  of every fetch and a `useEffect` keyed on `allSettled` auto-collapsed it 1200ms after everything
  settled. Both behaviors were removed: `sourcesOpen` now starts `false` and is only ever changed by
  the header's own click handler, so loading happens invisibly behind the condensed "Sources (3/3
  loaded)" summary line unless you've already expanded it, and an expanded panel stays expanded
  through a refresh or "Show more" instead of being forced shut. Same change applied to PX360's own
  Sources panel.
- **The initial "Loading first results…" placeholder now carries a spinning `LoaderCircle`** —
  once the Sources panel stopped auto-opening, this table-row placeholder became the only visible
  activity indicator during the initial fetch, so it needed to read as "in progress" rather than a
  static line of text. Same treatment applied to PX360's own equivalent placeholder.
- **Navigation**: `PatientBar`'s "DOCUMENTS" tab was already listed in `PATIENT_TABS` (inert, like
  `CONTACTS`/`REFERRAL`) — `handleNavigate` gained an `else if (label === "DOCUMENTS")
  setScreen("documents")` case alongside `"PX360"`'s, and the root render list gained a
  `screen === "documents" && <DocumentsScreen .../>` branch with the exact same prop set PX360's
  screen takes (`persona`, `caseManagerPersonaId`, `sidebarCollapsed`/`onToggleSidebar`, etc.).
  `DocumentsScreen`'s own "Back" goes to `"start"`, matching every other top-level screen's Back
  behavior.

## Open questions

- The original `vitaly-documents-prototype` repo itself was **not** updated — its patient is still
  "MATT EVANS, Leroy" and its content is the original, non-palliative-flavored set. Same divergence
  note as PX360's own port.
- "Add document" stays a decorative, unwired button — not asked for, matching how PX360's own
  cosmetic-only controls (the rich-text toolbar, pagination footer) were left inert.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Natively ported the Documents prototype as the Documents
  tab, bilingual from the start, with palliative-flavored content and no-failure sources"
