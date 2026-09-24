# HIS start screen

**Status:** Complete

## What it does

The prototype's entry point: a static legacy-EHR mock (Dutch labels, fake patient chrome) on the
left, and the real "Choose the application you would like to open" app picker on the right. The
**Caremaps** row is interactive — `Create new caremap` opens the create modal and, on confirm, hands
off straight into Vitaly's Set Plan lightbox (see [create-caremap.md](create-caremap.md)); once a
caremap exists, `Show (1) active caremap` jumps straight into it. This is the **only** place a
caremap can be created — Vitaly's own Caremaps-list screen has no create entry point, since creating
one needs the patient context the EMR hand-off provides. Px360's `Open` button is also wired (see
[px360-tab.md](px360-tab.md)). ACP's `Open plan` button is wired too, but differently from
everything else on this screen: it opens the real, external ACP system
(`better-acc.rso-zuidlimburg.nl`) in a new tab, rather than any screen this prototype itself renders
— see the implementation note below. MDT stays disabled, present only for scene-setting.

## Implementation notes

- `HISShell` (root of the `"start"` screen state) composes `<LegacyEHRPanel>` (pure static markup,
  no props) + the app-picker panel built from four `<AppRow>`s.
- `LegacyEHRPanel` is a simplified, non-pixel-accurate recreation for atmosphere only — explicitly
  not meant to match the real Dutch HIS UI exactly (see `CLAUDE.md`'s prototype note).
- The Caremaps `AppRow` conditionally renders the "Show (1) active caremap" link based on
  `hasCaremap` (`!!caremap` from root state) — there's no support for more than one caremap at a
  time. `onOpen` sets `screen: "detail"` directly (not `"list"`) — since there's only ever the one
  live caremap, and it's always this patient's, jumping into the cross-patient Caremaps list first
  and making the user find/click their own patient again would be a pointless extra step.
- Logo: `src/assets/vitaly-logo.png` (a real 2x asset, 228×72px) rendered at `h-8 w-auto` in the
  app-picker header bar and `h-9 w-auto` in the sidebar (see
  [team-tab-and-roles.md](team-tab-and-roles.md)'s sibling `Sidebar` component — same asset, two
  call sites).
- **ACP's `Open plan` links out to the real system**, not a simulated screen — `ACP_EXTERNAL_URL`
  (module-level, next to `HISShell`) is a genuine deep link into `better-acc.rso-zuidlimburg.nl`
  (patient 304's care-plan dashboard), opened via `window.open(url, "_blank", "noopener,noreferrer")`
  so it doesn't navigate the demo away from itself. The user supplied the exact URL directly; nothing
  about it is simulated or placeholder. Unlike every other wired control on this screen (Caremaps,
  Px360), clicking it leaves the prototype entirely — there's no "back" from it within this app,
  same as any real external link would behave.

## Open questions

- None currently open. The legacy EHR panel's fidelity was explicitly descoped by the original brief
  and hasn't been revisited.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Reused the existing Vitaly design tokens and chrome...",
  "Replaced the hand-drawn SVG logo mark with the real PNG asset", "EMR-only caremap creation,
  continuing straight into Set plan and activate"
