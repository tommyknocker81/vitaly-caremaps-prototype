# Sidebar collapse

**Status:** Complete

## What it does

The bottom-left "Collapse menu" button (previously inert) now actually collapses `Sidebar` into a
narrow, icon-only rail: the logo shrinks to just its teal symbol (no wordmark), every nav item and
the "Last view patients"/"Collapse menu" rows show only their icon, and the collapse button itself
flips to point the other way and re-labels itself "Expand menu." Clicking it again restores the full
`w-64` sidebar exactly as it was.

## Implementation notes

- `Sidebar` (`src/CaremapsPrototype.jsx`) takes two new props, `collapsed`/`onToggleCollapse`, driving
  a conditional `w-20`/`w-64` width (`transition-[width]`) and switching every row's layout between
  `justify-center px-0` (icon only) and `gap-4 px-4` (icon + label). Every row keeps an `aria-label`
  now (previously only implicit via the visible text), since collapsed rows have no visible label to
  fall back on for accessibility.
- **State lives at the root**, not inside `Sidebar` itself — `sidebarCollapsed`/`setSidebarCollapsed`,
  threaded through to `Sidebar` the same way `persona`/`onSwitchPersona` already reach every screen
  that renders it (`Px360Screen`, `NotificationsScreen`, `CaremapDetail`, `CaremapsListScreen`,
  `TasksListScreen`). Component-local state would have reset on every top-level screen navigation,
  since each of those five screens mounts its own fresh `Sidebar` instance (`screen` values are
  mutually exclusive, so there's no single persistent `Sidebar` to hold local state in) — lifting it
  to the root is what makes the collapsed/expanded choice survive navigating between them. Not
  written to `localStorage`, so it resets on a page reload, same as most other transient UI state in
  this app.
- **Logo-only crop reuses the existing PNG** (`src/assets/vitaly-logo.png`, 228×72px) rather than
  shipping a second asset — the source image is a square teal symbol followed by the white wordmark,
  so a fixed `w-9 h-9 overflow-hidden` window onto the full-height image (rendered at its normal
  `h-9 w-auto`, just clipped) shows only the symbol. 36px was checked directly against the asset to
  clear the symbol with a small margin before the wordmark would start.

## Open questions

- None currently open.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Wired up the sidebar's Collapse menu button"
