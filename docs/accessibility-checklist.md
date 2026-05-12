# Accessibility Checklist - RAT-6 Mobile Review

## Scope
`src/components/MobileReviewFlow.jsx` and `src/components/MobileReviewFlow.css`

## WCAG AA Review
- 1.3.1 Info and relationships: form controls are labeled with `legend`, `label`, and button names.
- 1.4.3 Contrast minimum: primary text and interactive states meet AA target in selected palette.
- 2.1.1 Keyboard: stars, tags, textarea, and submit are keyboard operable.
- 2.1.1 Keyboard (rating group): stars support arrow navigation and a clear action (`0`) to reset.
- 2.4.7 Focus visible: explicit `:focus-visible` ring implemented.
- 3.3.2 Labels or instructions: helper text and optional comment label provided.
- 3.3.2 Labels or instructions: rating instructions are announced via `aria-describedby`.
- 4.1.3 Status messages: success confirmation announced with `aria-live="polite"`.
- 4.1.2 Name, role, value: stars now expose `role="radio"` with `aria-checked`.

## Notes
- Final QA should include automated check with axe/lighthouse in integrated app shell.
