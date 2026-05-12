# RAT-138 Modal A11y Gate Retest (2026-05-07)

## Trigger
Retest executed after unblock comment (`Auto-unblocked in RAT-41 sweep: deps=0`).

## Scope
- Report modal (`ReportModal`)
- Respond modal (`RespondModal`)
- Keyboard-only a11y gate:
  - Escape closes modal
  - Focus trap (Tab / Shift+Tab)
  - Focus restore to invoking trigger

## Verification Method
- Code-path verification in `src/components/MobileReviewFlow.jsx` for keyboard handlers and focus lifecycle.
- Build sanity: `npm run build`.

## Results

### 1) Escape closes modal: PASS
- `window` keydown handler checks `event.key === "Escape"` and calls `onClose()` in both modals.

### 2) Focus trap: PASS
- `Tab` handling added in both modals.
- Focusable elements are constrained to modal container via `dialogRef` query and first/last element cycling.
- `Shift+Tab` on first cycles to last; `Tab` on last cycles to first.

### 3) Focus restore: PASS
- Prior focus is captured on modal open (`returnFocusEl ?? document.activeElement`).
- On modal unmount/close cleanup, focus restores to captured invoker (`previousFocusRef.current?.focus?.()`).

## Evidence Pointers
- `src/components/MobileReviewFlow.jsx`:
  - `ReportModal` keyboard/focus logic around lines ~195-250
  - `RespondModal` keyboard/focus logic around lines ~287-341
  - trigger capture and pass-through (`modalInvoker` + `event.currentTarget`) around lines ~151-163 and ~818-846

## Non-gate check
- `npm run build` passed on 2026-05-07.

## Gate Decision
`PASS` — Modal a11y gate criteria (Escape + focus trap + focus restore) are satisfied.
