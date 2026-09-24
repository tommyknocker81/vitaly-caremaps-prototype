# Demo persistence (autosave + reset)

**Status:** Complete

## What it does

Practice-mode support for rehearsing the demo: everything you do in the app (creating/activating a
caremap, assigning team roles, activities, comments, messages, persona switching) autosaves to the
browser's `localStorage`, so a reload picks up exactly where you left off instead of starting over.
"Reset demo" (bottom of the account menu, next to persona switching) clears it and returns the app
to its true starting state — the "start" HIS screen, no caremap, default persona.

## Implementation notes

- `DEMO_STORAGE_KEY = "vitaly-caremaps-demo-v1"` — one JSON blob holding `{ screen, caremap,
  personaId }`. That's deliberately the same three pieces of root state that already drove the app
  before this feature; modal/editing state (`modal`, `assignFixedRole`, `editingActivityId`,
  `editingContactId`) is intentionally excluded — it's transient UI state, not something you'd want
  restored mid-modal on reload.
- `loadSavedDemoState()` / `saveDemoState(state)` / `clearSavedDemoState()` — thin wrappers around
  `localStorage`, each wrapped in try/catch so a disabled/unavailable store (private browsing, quota)
  just means the practice session doesn't persist, rather than crashing the app.
- Root state's three pieces are lazily initialized from `loadSavedDemoState()` (falling back to the
  original defaults — `"start"` / `null` / `"dr-henley"` — when nothing's saved), and a single
  `useEffect` re-saves the bundle on every `[screen, caremap, personaId]` change.
- `resetDemo()` (root) clears storage and resets every piece of root state (including the transient
  modal state, for a truly clean slate) back to its original default.
- `onReset` is threaded down the same way `onSwitchPersona` already was: root → `CaremapsListScreen` /
  `TasksListScreen` / `CaremapDetail` → `TopHeader` → `AccountMenu`, which renders "Reset demo" below
  the persona list, gated behind a confirmation step since it's destructive. Originally a native
  `window.confirm()`; switched to an in-app `Modal` (local `confirmingReset` state in `AccountMenu`)
  after it turned out `window.confirm()` silently does nothing in some embedded/preview browser
  contexts — it returns `false` without ever showing a dialog, which looked exactly like the button
  doing nothing. The in-app modal reuses the same shared `Modal`/`Btn` components every other
  confirmation in the app already uses.

## Open questions

- Single continuous autosave only — no named checkpoints/snapshots to jump between different demo
  points. Could be added later as multiple `localStorage` keys if rehearsing several distinct
  scenarios turns out to need that (see decision log).

## Related decisions

- [docs/decisions.md](../decisions.md) — "Added localStorage autosave + a Reset demo action for
  practice", "Replaced Reset demo's native window.confirm() with an in-app modal"
