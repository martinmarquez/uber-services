# RAT-803 / RAT-403 lifecycle replay evidence (backend workspace)

Date: 2026-05-11
Issue: `RAT-803`
Related: `RAT-403`

## Scope note
This workspace validates API/domain safeguards that are implemented in `uber-services`.
Control-plane lifecycle transitions (`/api/issues` wake/checkout dedupe and terminal-state reopen suppression) are owned outside this repo and remain dependency-blocked for final RAT-803 closure.

## Command evidence
Executed on 2026-05-11:

```bash
node --test server/tests/httpServer.test.js server/tests/routes.test.js server/tests/actorAuth.test.js
```

Result summary:
- Total tests: 30
- Pass: 30
- Fail: 0

## Acceptance criteria mapping

### 1) Terminal resume gate
Status: `PARTIAL (repo-level semantics proven)`

Evidence:
- `POST /api/v1/reviews/:reviewId/appeals blocks reopen unless resume=true`
- Non-resume reopen attempt returns `409` with `error.details.code=appeal_resume_required`.
- Resume-enabled reopen succeeds with `202`.

References:
- `server/tests/httpServer.test.js` (appeals resume test)
- `server/src/domain/reviewService.js` (`openAppeal` resume enforcement)

### 2) Checkout non-mutation on terminal issue
Status: `BLOCKED (control-plane owner)`

Reason:
- Checkout/wake lifecycle for issue terminal states is in control-plane runtime, not in this backend service.

Required owner action:
- CTO / control-plane lifecycle maintainer must attach replay logs for terminal checkout with no `resume:true` showing zero state mutation.

### 3) No-delta wake dedupe
Status: `BLOCKED (control-plane owner)`

Reason:
- Wake enqueue/dequeue dedupe logic for `issue_status_changed` is not implemented in this repository.

Required owner action:
- Attach dedupe replay evidence (burst no-delta wakes, reopen count = 0) from control-plane runtime.

### 4) Blocked-state auto-promotion suppression
Status: `BLOCKED (control-plane owner)`

Reason:
- Blocked lifecycle transitions for issues are control-plane concerns outside this repo.

Required owner action:
- Provide blocked-state replay showing no implicit promotion without explicit blocker delta.

### 5) Replay evidence package attached
Status: `IN PROGRESS`

Attached here (repo-side package):
- This evidence note.
- Prior replay matrix/spec artifacts:
  - `docs/analysis/rat-803-rat-403-unblock-control-plane-lifecycle-replay-spec-2026-05-11.md`
  - `docs/analysis/rat-398-control-plane-replay-matrix-2026-05-11.md`

Pending for completion:
- Control-plane before/after patch reference.
- Control-plane event timelines (Cases A-E).
- Control-plane reopen-count regression logs.

## QA-ready replay checklist
1. Use this repo evidence to verify resume-gate behavior and auth/input safety around reopen semantics.
2. Request control-plane owner artifact bundle for Cases A-E from `docs/analysis/rat-398-control-plane-replay-matrix-2026-05-11.md`.
3. Mark RAT-803 unblocked only after external lifecycle replay evidence confirms zero unauthorized reopen mutations.
