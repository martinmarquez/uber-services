# Front-End Handoff - RAT-6

## Ready Assets
- `design-system.md`
- `docs/user-flow-review.md`
- `docs/interaction-spec.md`
- `docs/accessibility-checklist.md`
- `docs/design-memory.md`
- `src/components/MobileReviewFlow.jsx`
- `src/components/MobileReviewFlow.css`
- `src/App.jsx`

## Integration Notes
- Import `MobileReviewFlow` into post-trip surface route.
- Keep fixed bottom-sheet behavior for mobile viewport.
- Preserve token values from `design-system.md` if migrating to global tokens.
- Connect submit handler to backend review endpoint.
- Keep review filters as exclusive toggle chips (`aria-pressed`), not tab semantics.
- Preserve shared `:focus-visible` outline behavior for any new interactive control.

## Iteracion 2 Update (2026-05-07)
- UX review `RAT-66` completed and component semantics updated for filters.
- Focus visibility standardized in component CSS for keyboard accessibility.
- FE is ready to integrate API/tracking on top of current UI contract.

## RAT-70 / RAT-65.1 FE Copy Patch (2026-05-07)
- Applied CS Round 1 copy-only updates in `src/components/MobileReviewFlow.jsx` (no logic changes).
- Post-submit success now clarifies review validation before profile impact.
- Report success `aria-live` now explains next step and follow-up channel.
- Respond modal label now clarifies public visibility of the response.
- Visible star guidance is now mobile-first; keyboard guidance moved to `sr-only`.
- Low-score helper text softened to reduce friction; comment placeholder clarified as optional.

## Next Action
1. QA smoke on mobile viewport for comprehension of post-submit/report/respond states and screen-reader check for keyboard star instructions.

## RAT-421 UX Final Verdict (2026-05-11)
- Spec rev 3 aprobado por UX para implementacion.
- Contrato de dialogos confirmado: foco inicial, `Escape`, focus trap y retorno de foco.
- Budget de feedback de exito fijado en 4500ms.
- Gate pendiente para cierre de release: adjuntar evidencia integrada `axe` + Lighthouse en app shell.

## Open Integration Tasks (Front-End)
1. Done (2026-05-10): replace mock submit with real API wiring for create/list/report/respond + booking/discovery flow.
2. Done (2026-05-10): accessibility hardening for modals (`Escape`, focus trap, focus return to invoker).
3. Done (2026-05-10): run production build verification (`npm run build`).

## External Dependencies To Close Related Issues
1. Backend owner: confirm final production SLA/contract behavior for failed reads (without FE fallbacks to mock data).
2. PM/UX owner: confirm definitive post-submit UX policy and error-copy wording.
3. Data/PM owner: ratify granular analytics taxonomy now emitted by FE (`review_star_selected`, `review_tag_toggled`, `review_comment_started`, `review_report_submitted`, `review_respond_submitted`).

## RAT-135 Integration Checkpoint (2026-05-08)
API contract compliance checklist:
- Discovery wired to `GET /api/v1/providers/discovery` with `category`, `city`, `sort`, `limit`.
- Booking wired to `POST /api/v1/service-requests` with `idempotencyKey`, `providerUserId`, `category`, `city`, `notes`, `scheduledAt`.
- Verified review submission wired through booked `serviceRequestId` into review create payload.
- Report action wired to `POST /api/v1/reviews/:reviewId/reports` using `reasonCode`, `description`, `idempotencyKey`.
- Provider response action wired to `POST /api/v1/reviews/:reviewId/response` using `message`, `idempotencyKey`.
- Auth-gated calls include actor headers (`X-Actor-Id`, `X-Actor-Roles`) with env overrides.

UX/a11y behavior checklist:
- Discovery includes loading, error, and empty states.
- Booking submit is disabled until a provider is available and while submission is in-flight.
- Review submit is disabled until a valid booking exists (verified flow guard).
- Existing keyboard star navigation, modal focus trap, and `aria-live` status messaging are preserved.

## RAT-740 / RAT-730 UX Singleton Unblock Normalization (2026-05-11)
- New production component: `src/components/UxUnblockStatusCard.jsx`.
- Mounted in `src/App.jsx` above `MobileReviewFlow` as canonical unblock status.
- Test coverage: `src/components/UxUnblockStatusCard.test.jsx` validates heading, pending gate visibility, and named checklist semantics.
- FE integration rule: when app-shell accessibility evidence is produced, update the pending gate text/state to done in this component and mirror the change in `design-system.md`.

## RAT-1014 Front-End Recovery Delta (2026-05-12)
- Review submit action is now sticky on mobile within `MobileReviewFlow` via `.review-submit-cta`, preserving one-hand completion and safe-area spacing.
- Keyboard guidance text for the rating control now matches shipped behavior (`Arrow`, `Home`, `End`, `0`) to avoid mismatch for assistive-tech users.
- Targeted regression proof: `npm run test -- src/components/MobileReviewFlow.test.jsx` (12/12 pass).
- Next action owner: FE + QA to validate integrated app-shell accessibility evidence (`axe` + Lighthouse) and then close the remaining pending gate.
