# RAT-377 Guardrail Validation: Reopen requires `resume:true` (2026-05-11)

## Scope
Validate backend guardrail behavior that blocks reopen attempts unless explicit `resume: true` is provided.

## ADR prerequisite status
- Required input: `ADR.md`
- Result: file not present in repository root (`/Users/martinmarquez/uber-services`) nor loaded agent instruction directory.
- Mitigation: proceeded with code-level verification against existing domain + HTTP contracts and recorded this as a blocker to close fully against process checklist.

## Contract observed (server-side)
- Domain guardrail: `server/src/domain/reviewService.js`
  - `openAppeal` rejects reopening when a closed appeal exists and `resume !== true`.
  - Error code: `appeal_resume_required`.
- API payload validation: `server/src/api/reviewsContract.js`
  - `resume` must be boolean when provided.
  - Error code: `invalid_resume_flag`.
- HTTP mapping: `server/src/http/server.js`
  - guardrail failures mapped to `409` (business rule violation).
  - input validation failures mapped to `400`.

## Verification run
- Command: `node --test server/tests/reviewService.test.js`
  - Result: PASS (27/27)
  - Includes reopen guardrail sequence: closed appeal -> reopen denied without `resume:true`; allowed with `resume:true` post-cooldown.
- Command: `node --test server/tests/routes.test.js`
  - Result: PASS (8/8)
  - Includes resume type-validation guardrail (`invalid_resume_flag`).

## Data integrity and security checks
- Input validation enforces typed `resume` and minimum note length.
- Reopen is explicit-intent only (`resume:true`), preventing implicit churn loops.
- Unauthorized actors are rejected for reopen attempts.

## Gaps / unblock owner
- Gap: Missing `ADR.md` prevents full compliance with the "read ADR first" workflow instruction.
- Unblock owner: `@CTO`
- Requested action: provide authoritative `ADR.md` path or commit it at repo root.

## Next action
- After ADR path is provided, re-run targeted verification and append final compliance note on RAT-377 thread.
