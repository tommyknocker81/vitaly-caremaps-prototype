# Messages tab

**Status:** Complete

## What it does

A per-caremap inbox of two-party message threads between the current persona and any other
persona (from the persona switcher). Threads are organized into Open / Awaiting response /
Resolved, can be flagged critical, and support composing a new thread or replying to an existing
one — all backed by the caremap's own state, same as Comments.

## Implementation notes

- Data lives on `caremap.messageThreads`: `{ id, subject, participants: [nameA, nameB], critical,
  resolved, messages: [{ id, author, text, createdAt }] }`. Two-party only — `participants` is
  always exactly the sender and the one recipient picked in the "To" field.
- **Status is derived, not stored** (`threadStatusForPersona`), except `resolved` which is the one
  explicit flag (a deliberate action, not something inferable from the message list):
  - `resolved: true` → "Resolved".
  - Otherwise: if the *current persona* authored the thread's last message → "Awaiting response"
    (they sent it, now waiting to hear back); if someone else did → "Open" (it landed in their inbox,
    their turn to act on it). This means the same thread can sit in different buckets depending on
    who's currently logged in — switching persona and reopening the tab is the whole demo. (Briefly
    shipped inverted — sender saw "Open", recipient saw "Awaiting response" — corrected once the
    user pointed out it read backwards from an inbox's actual sender/recipient semantics; see the
    decision log.)
  - Because this is derived per-persona, there is no separate `read`/`unread` tracking to keep in
    sync.
- **Recipient options** in `NewMessageForm` are `PERSONAS` minus whoever's currently logged in — the
  same list the account-menu persona switcher itself uses (see
  [persona-switcher.md](persona-switcher.md)), so this feature and that one are wired to the same
  source of truth.
- Root handlers: `startMessageThread`, `replyToThread`, `toggleThreadCritical`, `resolveThread` —
  all close over `persona` to attribute the message/action to whoever's currently logged in.
  `addComment` (Comments tab) was updated at the same time to do the same (it previously always
  attributed to `CURRENT_USER_NAME` regardless of the active persona — a pre-existing inconsistency
  once personas existed, fixed in passing).
- **Every send notifies the other participant** — `startMessageThread`/`replyToThread` both call
  `notifyMessage` (root) after updating `messageThreads`, addressed to whichever participant didn't
  just send it. Reply-ability stays exactly here, in this tab — a message notification's own detail
  panel shows the whole thread read-only and links back via "Open in Messages" rather than offering
  its own compose box, so there's only ever one place a reply can be typed. See
  [notifications.md](notifications.md) for the notification side of this.
- `RichTextToolbar` (Bold/Italic/Underline/Link/lists) is decorative only, matching the dev-mode
  screenshot's composer — same "not wired" treatment as other cosmetic-only controls elsewhere in
  the app (e.g. "Add document" in `AddActivityModal`).
- The pagination footer ("1 to N of N messages" + chevrons) is also decorative — there's never more
  than one "page" in this prototype, so it just reflects the real message count without real paging
  logic.

## Open questions

- Only two-party threads are supported — no group threads with more than one recipient.
- "Show only critical" and the tab filters apply independently; there's no combined search.

## Related decisions

- [docs/decisions.md](../decisions.md) — "Added a Messages tab wired to the persona switcher",
  "Fixed Open/Awaiting response being swapped in the Messages tab", "Messages now generate
  notifications, showing the whole live thread", "Added important-item red-dot markers to
  Comments/Messages tabs and the Caremaps list"

An unresolved `critical` thread also feeds the Comments/Messages tab-strip red dots and the Caremaps
list's row marker — see [important-item-markers.md](important-item-markers.md).
