# UI Patterns

Conventions actually established in `src/CaremapsPrototype.jsx`, extracted from the code as it
stands — not aspirational. Most exact values were pulled from Figma dev-mode nodes rather than
eyeballed; where a comment in the code cites a node id, that's the source of truth, not this doc.

## Motion

Framer Motion is used in exactly **one** place: the active-tab underline in `CaremapDetail`, via a
shared-element transition:

```jsx
<motion.span layoutId="caremap-tab-underline" className="... h-[2px]" style={{ backgroundColor: T.primary }} />
```

No explicit duration/easing is set — it uses Framer Motion's `layoutId` defaults. There is no other
motion in the app:

- **Modals** (`Modal`) have no enter/exit animation — they're a plain conditionally-rendered fixed
  overlay (`{modal === "x" && <Modal>...}`). Opening/closing is instant.
- **Toggles** (`ToggleField`) animate via a plain CSS `transition-colors` / `transition-all` on the
  track and knob, not Framer Motion.
- **Rows/buttons** use Tailwind's `transition-colors` / `transition-shadow` for hover states only
  (e.g. `ActivityRow`'s `hover:shadow-sm`).

If richer motion is wanted later (modal fade/scale, row enter animations on list changes), there's no
existing pattern to extend beyond the one `layoutId` usage — it'd be new work, not a gap-fill.

## Design tokens (`T` object, top of file)

```js
primary:   "#0080A3"   // teal — CTAs, links, active states, prominent avatars
secondary: "#00324B"   // navy — sidebar bg, modal titles
dark:      "#001E2D"   // darkest navy — sidebar footer (Collapse menu row)
success:   "#62A752"   // green — Active status badge, green CTA button, Completed icon
warning:   "#FFB853"   // orange — Planned-adjacent warning tone (currently declared but not
                        //          used anywhere live — the "info" tone replaced it for Planned)
border:    "#DEE2E6"   // hairline borders throughout
bodyText:  "#212529"   // default text color used sparingly — most body copy actually uses `muted`
gray700:   "#495057"   // patient-bar id/dob text, inactive nav
gray600:   "#6C757D"   // Undefined badge fill, muted secondary text
gray500:   "#ADB5BD"   // icon color on unfilled/dashed slots
gray400:   "#CED4DA"   // input borders, disabled toggle track
lightBg:   "#E9ECEF"   // avatar circle backgrounds (header, patient bar)
light:     "#F7F8FA"   // page background, Set Plan modal row bg
cardBg:    "#F8F9FA"   // activity/team row backgrounds (note: distinct from `light`, one hex apart)
teamItemBorder: "#DCDCDC"  // team row / role card borders (distinct from the general `border`)
muted:     "#555555"   // most row/body secondary text — this is the one actually used most
black:     "#000000"   // section headings ("ACTIVITIES", "TEAM", etc.) — literal black, not `bodyText`
fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif"
cardShadow: "0 1px 2px rgba(0,0,0,0.2)"
```

**Known inconsistency worth knowing about:** newer sections (`ActivitiesPanel`, `TeamSummary`,
`TeamTab`, `StubCard`, the status bar) use the white-bg + `cardShadow` + `rounded-[4px]`, no-border
card style (pulled from a later Figma dev-mode pass). Older sections (`Modal` chrome itself,
`SetPlanModal`'s row list, `AssignRoleModal`'s table) still use the earlier plain `border rounded`
(default Tailwind `rounded` = 4px) style with no shadow. Both read as "correct" in isolation; a
future full pass could unify them, but nothing currently depends on picking one over the other.

## Typography scale

Nearly everything is one of: `text-[24px]` (screen title), `text-[20px]` (section headings, tracked
`0.8px`, uppercase, bold), `text-[18px]` (stub-card inner heading), `text-[16px]` (subsection labels
like "To do" / "Mandatory"), `text-[15px]` (the workhorse — body copy, field labels, row titles,
button text, nav items), `text-[14px]` (compact contexts: search/filter inputs, patient tabs, small
buttons), `text-[13px]`/`text-[12px]` (fine print: hints, table headers, badge text).

Font weights: `font-bold` for section headings and badge text, `font-semibold` for most emphasized
copy (titles, row names, field labels, buttons), `font-normal`/unstyled for body/secondary text.
Line height is almost always `leading-[1.5]` where explicitly set.

## Spacing conventions

- Card padding: `p-6` (24px) for the shadow-style cards, `p-4` (16px) for their nested inner boxes
  (e.g. `StubCard`'s content block)
- Activity/team rows: `pl-[25px] pr-[11px] py-[13px]` (activity rows, asymmetric — matches a specific
  Figma component spec) vs `px-[17px] py-4` (team rows) — these two row families were speced
  separately and don't share exact padding, only the same rounding/border family
- Row-to-row gaps: `space-y-4` (16px) within lists
- Icon-to-text gap: `gap-[16px]` (activity rows), `gap-4` (team rows)
- Border radius: `rounded-[4px]` for cards/buttons/inputs, `rounded-[8px]` for activity rows
  specifically, `rounded-full` for badges and avatar circles

## Component patterns

**`Badge`** — pill (`rounded-full`), five tones: `gray` (Undefined), `teal` (Requested/Scheduled/
Active), `green` (Completed/Active status), `warning` (declared, unused), `info` (Planned — a
translucent `rgba(0,128,163,0.11)` tint with teal text, not a solid fill like the others). Tone choice
lives in `STATUS_CONFIG[status].tone`, not hardcoded per call site.

**`Select`** — every `<select>` in the app goes through this wrapper, not a raw `<select>`. It sets
`appearance-none` + `pr-9` and draws its own `ChevronDown` icon absolutely positioned at `right-3`.
(Native selects were rendering with no breathing room around the arrow once custom padding was
applied — this was a direct bug fix, not a stylistic choice from day one.) Accepts `wrapperStyle` for
callers that need a non-full-width select (job-title filter, the inline role picker in
`AssignRoleModal`).

**`Btn`** — four variants (`solid` teal, `green`, `outline` teal-on-white, `neutral` gray-on-white),
plus a `small` size flag. No `danger`/`destructive` variant exists — nothing in this prototype needs
one yet.

**Empty states** — two flavors, both `cardBg` boxes with a heading + one line of muted body copy + a
CTA button:
1. "Please define the core team" (`TeamSummary`) — disappears entirely once any formal team role has
   a member (see `docs/decisions.md`); activity-only assignees don't count toward hiding it.
2. "It looks like you haven't added any active tasks..." (`ActivitiesPanel`) — the "Set plan and
   activate" phrase inside the sentence is itself a button, not just emphasized text.

Stub sections (`StubCard`, and the four unimplemented tabs) use a third, simpler pattern: heading +
one muted line ("Not wired in this prototype." / "Not part of this prototype...") + a permanently
disabled button or nothing at all.

**Status-dependent forms** (`StatusFields`, shared by add and edit) — picking a status conditionally
reveals exactly one associated field (`STATUS_CONFIG[status].field`), except `scheduled` which reveals
three (`Set date` + `Hour` + `Location`). `undefined` reveals none. This is the one place in the app
where form shape genuinely branches on a select value.

**Progressive disclosure** (`AddActivityModal` only) — nothing past "Activity type" renders until a
type is chosen; `EditActivityModal` shows everything at once since it's always editing something
that already exists.
