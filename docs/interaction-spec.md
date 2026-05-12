# Interaction Spec - Mobile Review Component

Revision: 3 (2026-05-11)

## Entry State
- Component opens with heading, ride context, and empty 5-star row.
- Submit button is disabled.

## Rating Selection
- Tap star to set rating.
- Tap same selected star again to clear rating.
- On first valid rating, quick tags and textarea animate in.

## Tag Selection
- Chips are toggle buttons (`aria-pressed`).
- Multi-select allowed.

## Feed Filters
- Filter chips are an exclusive button group, not tabs.
- Active filter is exposed with `aria-pressed="true"`.

## Comment
- Optional field.
- Character guidance: max 240.

## Submit
- Enabled when rating > 0.
- On submit: button enters loading state.
- On success: `aria-live` confirmation text appears.
- Success feedback visibility budget: 4500ms max before returning to idle state.

## Report / Respond Dialogs
- Modal semantics: `role="dialog"` + `aria-modal="true"`.
- Initial focus: first actionable field in dialog (`reason` select for report, `message` textarea for respond).
- Escape behavior: `Escape` closes dialog.
- Focus trap: `Tab`/`Shift+Tab` cycle only within open dialog.
- Focus return: on close, focus returns to the control that opened the dialog.

## Integrated Accessibility Gate
- Pre-release validation in integrated app shell must include:
  - `axe` scan without serious/critical violations.
  - Lighthouse accessibility report attached to QA evidence bundle.
