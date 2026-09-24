# PZP tab

**Status:** Complete

## What it does

The PZP ("Persoonlijk Zorgplan" / personal care plan) tab: a card with a left-hand list of six plan
sections (General information, Clinical context, Capacity and representation, What matters to the
patient, Treatment wishes and boundaries, Anticipatory care arrangements) and a right-hand panel
showing the selected section's content as label/value fields. Clicking a section in the list swaps
the right panel's content — no navigation, just local selection state.

## Implementation notes

- Dev-mode spec: node `12593-359461` ("Caremaps - Overview", PZP tab selected, "Clinical context"
  section active). Only that one section's content was actually designed in Figma; the other five
  are list items with no content behind them there.
- `PZP_SECTIONS` (key/label pairs, list order) and `PZP_CONTENT` (key → array of `{ label, value }`)
  are plain module-level constants, same treatment as `MEMBER_POOL`/`MOCK_CAREMAPS` — static
  reference content for the single hardcoded patient (De Vries, Jan), not read from or written to
  `caremap` state. The "Clinical context" section's fields are the exact values from the Figma
  reference except "Relevant comorbidity", which had a stray fragment in the source text ("Moderate
  COPD Palliative phase marked: 12 August 2026" — two unrelated facts run together); split cleanly
  into "Moderate COPD" here and "Palliative phase marked: 12 August 2026" under the new "General
  information" section, where it actually belongs.
- The other five sections' content was authored to be realistic and internally consistent with the
  rest of the app — it references the Case manager/Community Nurse roles and the MDT referral
  activity type that already exist elsewhere (see
  [team-tab-and-roles.md](team-tab-and-roles.md), [activities-and-status-model.md](activities-and-status-model.md)) rather than inventing unrelated facts.
- `PzpTab` (`CaremapsPrototype.jsx`, right after `TeamTab`) holds its own `activeKey` state, defaulting
  to `"clinical"` to match the section selected in the dev-mode spec. Rendered from `CaremapDetail`
  when `tab === "pzp"` (previously grouped into the generic `["pzp", "questionnaires"]` placeholder —
  now only `"questionnaires"` still uses that placeholder).
- The header's edit (pencil) icon is decorative/not wired, matching the same treatment as other
  present-but-inert controls elsewhere (the Messages composer's rich-text toolbar, Overview's "Add
  document"). No add/edit flow was requested for this pass.

## Open questions

- Read-only only — no edit form. If PZP needs to become editable (or multi-caremap, or reflect a
  different patient), this would need to move from a module constant onto `caremap` state, following
  the same pattern as `clinicalConsultant`/`emergencyContacts`.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Built the PZP tab with authored palliative-care content"
