# Vitaly Caremaps Prototype

A clickable, stateful (no backend) prototype of the **Vitaly Caremaps** workflow for a palliative care use
case: a GP creates a caremap from their local HIS, configures and activates it, then a case manager
assigns team members and specific activities to those members.

All data is mock — a single fictional patient (De Vries, Jan), no real endpoints. All state lives in React
state; nothing persists across a reload.

## What it demonstrates

- **HIS entry point**: a static legacy-EHR chrome (non-interactive) next to the real "choose the
  application you would like to open" app picker — only the Caremaps card is wired up
- **Create → configure → activate**: `Create Caremap` seeds a draft caremap from a template; `Set plan and
  activate caremap` lists the mandatory/default activities (with on/off toggles for the optional ones) and
  a start-date picker; once activated the plan locks and the status bar shows the real + estimated start
  dates
- **Team assignment**: a mandatory Case Manager slot plus open-ended "Add additional roles" slots, each
  filled via a searchable/filterable "Assign member a role" table; a freshly-assigned Case Manager gets an
  orange "Temporary" ribbon
- **Activity → assignee linking** (the piece requested beyond the source screenshots): `Add new activity`'s
  "Assign to" dropdown is populated only from team roles that already have a member, and the assignment
  shows up immediately on the Overview/Activities activity row — no separate save step
- Assigning the Case Manager automatically resolves the "Assign Case manager" to-do item into the Resolved
  list, matching the REQUIRED → done arc visible across the reference screenshots

Design tokens (colors, Source Sans 3 typography, sidebar/patient-bar chrome) are pulled from the same
OpenLine-Vitaly Figma system used by [vitaly-encounters-prototype](https://github.com/tommyknocker81/vitaly-encounters-prototype)
and [vitaly-documents-prototype](https://github.com/tommyknocker81/vitaly-documents-prototype), so all three
prototypes read as one product.

## Simplifications (flagged per the brief's open questions)

- The mandatory Case Manager stays "Temporary" permanently in this prototype — no separate "Confirm" step.
- "Others" role slots are available immediately, not gated behind a confirmed Case Manager (the reference
  screenshots show them present at the same time as an unfilled/temporary Case Manager).
- Only "End of life care" has a real seeded activity set; the other two template options in `Create
  Caremap` are present in the dropdown but reuse the same default activities.
- The legacy left-hand EHR panel on the HIS start screen is a static, simplified recreation for scene-setting
  only — it is not meant to be pixel-accurate to the real product, per the brief.
- "Save as Draft" in both modals closes the modal without changing state (there's no separate persisted
  draft-vs-final distinction to demo here beyond the caremap's own draft/active status).

## Run

```bash
npm install
npm run dev
```

Vite serves on http://localhost:5181. Tailwind is loaded via CDN in `index.html` (prototype-only setup).

## Structure

Single self-contained component: [`src/CaremapsPrototype.jsx`](src/CaremapsPrototype.jsx) — HIS shell,
caremap detail shell (tabs, status bar), the six modals from the brief, and the shared
Activities/Team panels. Mock data (`MEMBER_POOL`, `ROLE_POOL`, `SET_PLAN_ITEMS`, `initialActivities`) sits
at the top of the file.
