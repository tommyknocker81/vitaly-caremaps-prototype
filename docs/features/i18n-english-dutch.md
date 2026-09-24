# Bilingual support (English / Dutch)

**Status:** Complete

## What it does

An always-visible "EN | NL" toggle in `TopHeader` (next to the notification icons) switches the
entire app's UI text between English and Dutch, live, without losing state. Nearly everything a
viewer would see in a demo is covered: nav, headers, buttons, tabs, modals, form labels, status
badges, empty states, table headers, mock list rows, and the full PZP content. The choice persists
across reloads independently of demo progress (see [demo-persistence.md](demo-persistence.md) —
"Reset demo" does not reset the language).

## Implementation notes

- **Identity-key dictionary, not a keyed i18n system**: `t("English source text")` looks up `NL[str]`
  and falls back to `str` itself when missing or when `lang === "en"`. No separate key namespace to
  invent or keep in sync with the English copy — the English string IS the key. `NL` (~250 entries)
  lives near the top of `CaremapsPrototype.jsx`, grouped by section with comments matching the app's
  own structure.
- **`LanguageContext`** (`createContext`) carries `{ lang, setLang, t }`, provided once at the root
  (`CaremapsPrototype`) and read via `useLanguage()` in ~45 components. Context was used instead of
  prop-drilling `lang`/`t` through every component signature — the tree is deep and many leaf
  components (Badge, Field, Modal, StubCard, TeamMemberRow…) needed it.
- **Reused shared components to cover many call sites at once**: `Modal` wraps its `title` prop,
  `Field`/`FilterField` wrap their `label` prop, `Badge`/`SectionHeading` wrap their `children` (when a
  plain string), and `AppRow`/`StubCard`/`AssigneeCard` wrap their text props internally. This means
  most individual `<Field label="...">` / `<Modal title="...">` call sites needed zero changes — only
  components rendering raw strings directly needed `t()` added at the call site.
  Adding a new field/modal/badge automatically gets translation for free as long as its label is a
  known English string in `NL`.
- **Data model stays English** — job titles, role labels (`"Case manager"`), status keys
  (`"scheduled"`), activity types, etc. are never mutated by language switching; only the *display*
  layer calls `t()` on them. This matters because several of those exact strings are also used for
  equality checks in logic (e.g. `role.label === "Case manager"`, `NO_ASSIGNEE_STATUSES.includes(status)`)
  — translating the underlying values would have silently broken that logic.
- **Dynamic/templated strings**: for text assembled from a small, enumerable set of English
  fragments (e.g. `` `No ${tab} threads.` ``, `` `No ${tab.toLowerCase()} caremaps match these
  filters.` ``), the *whole assembled string* is passed through `t()` and each of the finitely many
  results has its own dictionary entry — no restructuring of the surrounding logic needed. For
  genuinely unbounded text (a live message count — `formatTimeLabel`/`formatFieldValue` also take an
  explicit `lang` param and switch locale (`nl-NL` vs `en-GB`) for month-name formatting, and
  `ThreadDetail`'s "1 to N of N messages" line branches directly on `lang` rather than going through
  the dictionary at all.
- **Same-English-word, different-Dutch-translation collisions**: `t(str, context)` takes an optional
  scope prefix, checked as `NL["context:str"]` before the unscoped `NL[str]`. Two real collisions
  exist in this app's copy: `FilterField`'s date-range "To" (→ "Tot") vs. `NewMessageForm`'s message
  recipient "To" (→ "Aan") — `FilterField` always calls `t(label, "dateFilter")`; and the Messages
  tab's "Open" status (→ unchanged "Open") vs. the Patient 360 stub's "Open" button (→ "Openen") —
  scoped as `"messageStatus:Open"`. Found the "Open" collision only via live browser testing (it's the
  kind of bug the identity-key approach makes easy to introduce silently), so it's worth checking for
  more if new short/common English words get added to the dictionary later.
- **Deliberately never translated**: product/module names (`Caremap`/`Caremaps`, `PZP`, `Px360`) —
  kept English throughout, matching how Dutch healthcare software commonly keeps English module
  names; the `LegacyEHRPanel` (the simulated old EHR side panel) — it's already authentically Dutch
  by design regardless of app language, not part of Vitaly's own UI; proper nouns — patient/staff
  names, organisation names, IDs, dates.

## Open questions

- aria-labels were left untranslated in a few low-traffic spots (e.g. "Edit clinical consultant") —
  they're screen-reader-only and don't affect what a demo audience sees, so this was a deliberate
  scope trim rather than an oversight.
- Native `<input type="date">`/`<input type="month">` pickers follow the browser's own locale, not
  the app's language toggle — normal browser behavior, not something JS can override.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Added a full English/Dutch language toggle"
