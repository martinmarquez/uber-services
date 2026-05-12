# RAT-25 Frontend Handoff

Fecha: 2026-05-11 (RAT-699 restart)
Para: Front-end Developer
De: UX/UI Designer

## Ready to integrate
- Component: `src/components/MobileReviewFlow.jsx`
- Styles: `src/components/MobileReviewFlow.css`

## Integration contract
- Payload base on submit:
  - `rating` (0-5, submit only if >0)
  - `selectedTags` (array string)
  - `comment` (string, max 240)
- Accessibility behavior that must stay intact:
  - Stars as `radiogroup`/`radio` with arrow-key navigation.
  - `aria-live` success message.
  - Visible focus ring on interactive elements.

## Pending dependencies
1. API wiring for review create endpoint.
2. Event tracking mapping for rating selection, tag toggles, and submit success.
3. Product decision on auto-close timing after success confirmation.

## Integration checks after wiring
- Run `npm run test -- src/components/MobileReviewFlow.test.jsx` (includes keyboard `Arrow` + `Home/End` assertions).
- Run integrated `axe` validation in app shell where this component is mounted.
- Validate reduced-motion behavior with OS setting enabled (`prefers-reduced-motion: reduce`).
