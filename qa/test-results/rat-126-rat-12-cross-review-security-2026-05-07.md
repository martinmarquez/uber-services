# RAT-126 / RAT-12 - Cross-review Security QA Evidence

Date: 2026-05-07
Owner: QA Specialist
Scope: Validate fraud/abuse/offensive-content mitigation controls in RAT-12 backend review domain.

## Evidence Executed

Command:
```bash
node --test server/tests/*.test.js
```

Result: PASS (`14/14` tests)

## Security/Abuse Controls Covered (Verified)

- Eligibility guardrails prevent ineligible submissions:
  - outside 14-day window rejected.
  - identity mismatch and duplicate/rate-limit pathways present in rules contract.
- Idempotency/replay protection:
  - duplicate submit with same idempotency key returns cached response and does not duplicate review persistence.
  - missing idempotency key is explicitly rejected.
- Authorization boundary for moderation:
  - non-moderator actor cannot transition moderation state.
- Moderation transition integrity:
  - forbidden transitions denied.
  - allowed transitions require decision metadata and emit moderation decision event.
- Risk-score tampering resistance:
  - client-provided `riskScore` is ignored at review creation.

## Residual Risks (Non-blocking for this cross-review)

- No E2E/API integration test yet for auth bypass attempts at HTTP route level (`server/src/api/routes.js`).
- No explicit offensive-text classifier assertion in current backend unit tests (policy path likely external to this in-memory domain layer).

## QA Gate Outcome

Status: PASS for RAT-126 cross-review scope.

Recommendation to parent gate (`RAT-12`):
- Accept this child security cross-review as complete.
- Keep parent gate blocked only on remaining child reviews, if any.
