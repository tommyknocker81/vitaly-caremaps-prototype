# Create Caremap

**Status:** Complete (simplified — see Open questions)

## What it does

The modal that seeds a brand-new caremap: pick a Care unit and a Caremap template, submit, and the
app navigates straight into the caremap detail screen with "Set plan and activate" already open, so
the create → configure flow continues without an extra manual click. Only reachable from the EMR/HIS
start screen's "Create new caremap" button (`HISShell`) — there's deliberately no way to create one
from inside Vitaly itself, since doing so requires the patient context the EMR hand-off provides.

## Implementation notes

- Component: `CreateCaremapModal`. Two `Select`s (`CARE_UNITS`, `TEMPLATES` constants), both default
  to their first option (`"Palliative Care"` / `"End of life care"`).
- `onCreate(unit, template)` → root's `createCaremap` builds the initial `caremap` object: `title` is
  always `` `${template} Caremap` ``, `careFocus` is one hardcoded string regardless of unit/template,
  `status: "draft"`, empty `activities: []`, and `team` seeded with just the mandatory Case Manager
  slot (`memberId: null`). See [docs/architecture.md](../architecture.md) § Data shape for the full
  object.
- Sets `screen: "detail"` and `modal: "setPlan"` in the same action, opening `SetPlanModal` right on
  top of the fresh Overview tab — safe to do unconditionally (no "did this come from the EMR?" check
  needed) because `modal === "create"` now has exactly one path in: `HISShell`'s own `onCreate`. The
  Caremaps-list screen's own "+"/create entry point was removed for the same reason (see
  `his-start-screen.md`), so there's nowhere else this modal could have been opened from.

## Open questions

- Only the **"End of life care"** template has a real, distinct activity set — it comes from
  `SET_PLAN_ITEMS`, which isn't actually template-aware at all. Picking "Symptom management" or
  "Bereavement support" changes the title text but produces the identical plan. Flagged as a known
  simplification in the original README; not revisited since.
- `unit` and `template` are stored on the caremap object but nothing downstream reads `unit` at all.

## Related decisions

- [docs/decisions.md](../decisions.md) — "EMR-only caremap creation, continuing straight into Set
  plan and activate"
