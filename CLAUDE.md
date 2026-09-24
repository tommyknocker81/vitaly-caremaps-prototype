# Vitaly Caremaps Prototype

## What this is

A clickable UX prototype of the **Caremaps** module for **Vitaly** (OpenLine-Vitaly), simulating a
Dutch multidisciplinary-team (MDT) care-plan workflow: a GP creates a caremap from their local HIS,
configures and activates it, then a case manager builds a care team and assigns/tracks activities
against it.

It's one of three sibling prototypes in the same product family, all sharing one visual design
system (colors, typography, chrome) pulled from the same Figma file (`OpenLine-Vitaly`):

- [vitaly-encounters-prototype](https://github.com/tommyknocker81/vitaly-encounters-prototype) — Patient 360 / Encounters
- [vitaly-documents-prototype](https://github.com/tommyknocker81/vitaly-documents-prototype) — Patient 360 / Documents
- **vitaly-caremaps-prototype** (this repo) — Caremaps

Single hardcoded patient throughout: De Vries, Jan (ID 161 885 4347, 14.03.1953, 73yrs, Male).

The app is bilingual (English/Dutch) via an always-visible toggle in the top header — see
[docs/features/i18n-english-dutch.md](docs/features/i18n-english-dutch.md). Any new user-facing
string needs a `t("...")` call and (if translated) an entry in the `NL` dictionary, or it will
silently stay in English when the app is switched to Dutch.

## This is a prototype, not production code

Built for stakeholder review and design validation — not for shipping. Don't add production
concerns (error boundaries, real auth, API layers, test coverage, accessibility audits, performance
tuning, TypeScript migration, etc.) unless the user explicitly asks. Prioritize matching the design
and getting flows demonstrable over engineering robustness. Simplifications and known gaps are
expected and should be documented (see `docs/decisions.md`), not silently "fixed" into more elaborate
implementations.

## Stack

- **React 18** + **Vite 5** — dev server and build
- **Tailwind CSS** via the CDN script in `index.html` — no build-time Tailwind config, no PostCSS
  step. Utility classes only; arbitrary values (`text-[15px]`, `rounded-[4px]`, etc.) are used
  liberally to hit exact design-spec pixel values.
- **Framer Motion** — used in exactly one place, the active-tab underline (`layoutId` shared-element
  transition)
- **lucide-react** — icon set
- Plain JavaScript / JSX — **no TypeScript**
- **No backend, no router.** All app state lives in `useState` at the root component and is threaded
  down via props. It autosaves to the browser's `localStorage` (practice-mode persistence, so a
  reload doesn't lose demo progress) — see
  [docs/features/demo-persistence.md](docs/features/demo-persistence.md) — but there's still no real
  backend or multi-device sync; "Reset demo" (account menu) wipes it back to the true initial state.
- **Source Sans 3** loaded from Google Fonts (the family's shared typeface; matches "Source Sans Pro"
  used in the original Figma tokens)

## Architecture

Everything currently lives in one file: `src/CaremapsPrototype.jsx` (~1,420 lines). See
[docs/architecture.md](docs/architecture.md) for the actual breakdown — screens, tabs, modal state
machine, and mock data shape as they stand today, plus a note on how the file could eventually split
into `components/` if it keeps growing (not a recommendation to do that now).

## Deployment

```
npm run build   →   dist/   →   force-pushed to the gh-pages branch   →   GitHub Pages
```

Served at `https://tommyknocker81.github.io/vitaly-caremaps-prototype/`. `vite.config.js` sets
`base` conditionally so local dev (`npm run dev`, port 5181) still serves from `/`. There's no CI —
deploys are manual (build, then push `dist/` as its own throwaway git history to `gh-pages`).

## Working process for future sessions

- **One session per screen or feature.** Don't try to carry the whole module in one sitting — pull
  up the relevant `docs/features/*.md` file (or create one from `docs/features/_TEMPLATE.md`) and
  scope the session to that.
- **Propose a plan before structural changes.** Renaming/moving data shapes, splitting the file into
  components, changing the modal state machine, or altering how screens navigate — describe the
  approach first rather than diving straight into a large edit.
- **Log non-trivial decisions in `docs/decisions.md`** as they're made — not just what was built, but
  why that approach and what was ruled out. Skip trivial stuff (copy tweaks, obvious bug fixes).
- **Pull exact values from Figma dev mode rather than approximating**, the same way the existing
  code does (see the node-id references in code comments) — this codebase has been corrected more
  than once after eyeballing a screenshot instead of reading the actual spec.
- Update the relevant `docs/features/*.md` status when a feature moves from planned → in progress →
  complete, so `docs/` stays a trustworthy map instead of stale narration.
