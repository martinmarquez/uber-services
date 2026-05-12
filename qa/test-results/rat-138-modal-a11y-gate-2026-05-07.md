# RAT-138 Modal A11y Gate QA Readout (2026-05-07)

## Scope
Validate modal accessibility gate for:
- Escape closes modal
- Keyboard focus trap inside modal
- Focus restore to invoking control on close

Target component:
- `src/components/MobileReviewFlow.jsx`
- `ReportModal` and `RespondModal`

## Method
- Static code inspection for keyboard/focus handling paths.
- Build sanity check: `npm run build`.

## Findings

### 1) Escape close: FAIL
- No `keydown` listener or `onKeyDown` logic exists for `Escape` in either modal.
- `onClose` is currently reachable only via backdrop click and Cancel button.

Evidence:
- Dialog markup exists (`role="dialog"`, `aria-modal="true"`) at:
  - `src/components/MobileReviewFlow.jsx:205-207`
  - `src/components/MobileReviewFlow.jsx:252-254`
- No Escape handling references in file (`Escape`, `keydown`) for modal logic.

### 2) Focus trap: FAIL
- No logic to constrain tab sequence to focusable elements within the modal.
- No sentinel elements or cycle-on-Tab handler present.

Evidence:
- No focus-trap related logic (`activeElement`, `tab` cycle handlers, focusable query) in `ReportModal`/`RespondModal`.

### 3) Focus restore: FAIL
- No capture of opener element before modal open.
- No restore path on close to return focus to opener.

Evidence:
- No refs/state tracking prior focused element in modal open/close paths.

## Non-gate check
- Build passes:
  - `npm run build` completed successfully on 2026-05-07.

## Gate Decision
`BLOCKED` — Do not ship this modal change until all three behaviors pass.

## Required Fixes to Unblock
1. Add Escape key handling for both modal variants.
2. Add keyboard focus trap (Tab and Shift+Tab cycle within modal).
3. Restore focus to the triggering action button when modal closes.
4. Add automated tests for the three behaviors (or equivalent deterministic QA automation) so regression is caught.
