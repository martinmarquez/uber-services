# RAT-360 QA Revalidation — US-40.1 Runtime Copy + Appeal CTA Alignment

- Date: 2026-05-11 00:36:00 -03
- Issue: RAT-360 (RAT-81.1)
- Scope: verify runtime alignment for US-40.1 status copy + explicit appeal CTA in review detail
- Owner: QA

## Targeted Verification

1. Runtime contract + UI copy inspection:
- `src/reviewModerationContract.js`
- `src/components/MobileReviewFlow.jsx`
- `ONBOARDING.md`

2. Focused regression suite:
- Command: `npm test`
- Result: PASS (`src/components/MobileReviewFlow.test.jsx`, 3/3)

## Findings

### Blocking Finding 1 — Status copy remains misaligned with approved US-40.1 copy

- Expected from onboarding contract (`ONBOARDING.md`):
- `En revision`
- `No recomendada`
- Actual runtime labels (`src/reviewModerationContract.js`):
- `En moderación`
- `Baja confiabilidad`
- Severity: High
- Impact: taxonomy drift sustains user confusion and support load.

### Blocking Finding 2 — Explicit appeal CTA still absent in review detail for non-recommended state

- Expected from onboarding contract (`ONBOARDING.md`): CTA `Iniciar apelacion` when status is `no_recomendada` or `removida`.
- Actual runtime (`src/components/MobileReviewFlow.jsx`, `ReviewCard`): no explicit appeal CTA rendered.
- Severity: High
- Impact: no direct in-product path to appeal for impacted users; churn/recontact risk remains.

## Quality Gate Verdict

- US-40.1: FAIL
- RAT-360 gate decision: BLOCKED
- Ship recommendation: Do not approve release until both blockers are fixed and QA re-smoke passes.

## Re-test Trigger

Request QA revalidation after FE lands:
1. Runtime label update to US-40.1 copy taxonomy.
2. Explicit appeal CTA rendering in non-recommended/removed review states.

---

## Heartbeat Recheck (process_lost_retry)

- Date: 2026-05-11 00:38:00 -03
- Trigger: retry heartbeat for same issue scope

### Recheck Steps

1. Verified latest working-tree deltas in:
- `src/components/MobileReviewFlow.jsx`
- `src/components/MobileReviewFlow.test.jsx`

2. Re-ran focused regression:
- Command: `npm test`
- Result: PASS (`src/components/MobileReviewFlow.test.jsx`, 3/3)

3. Re-inspected runtime rendering path:
- `ReviewCard` in `src/components/MobileReviewFlow.jsx` still renders moderation pill and review actions, but no explicit appeal CTA for `no_recomendada`/`removida`.

### Recheck Verdict

- US-40.1 remains FAIL.
- RAT-360 remains BLOCKED pending FE implementation of explicit appeal CTA and status-copy taxonomy alignment.

---

## Heartbeat Recheck (issue_status_changed)

- Date: 2026-05-11 06:31:00 -03
- Trigger: issue status moved to `in_progress`

### Recheck Steps

1. Reviewed latest code deltas:
- `src/components/MobileReviewFlow.test.jsx` gained modal keyboard/focus tests (accessibility regression coverage).
- No corresponding implementation change in `ReviewCard` for appeal CTA rendering.

2. Re-ran focused suite:
- Command: `npm test`
- Result: PASS (`src/components/MobileReviewFlow.test.jsx`, 8/8)

3. Re-checked US-40.1 acceptance points:
- `src/reviewModerationContract.js` still exposes runtime labels `En moderación` and `Baja confiabilidad` (not aligned to approved `En revision` and `No recomendada`).
- `src/components/MobileReviewFlow.jsx` (`ReviewCard`) still does not render explicit `Iniciar apelacion` CTA for `no_recomendada` / `removida`.

### Recheck Verdict

- US-40.1: FAIL
- RAT-360 gate: BLOCKED (unchanged)

---

## Closure Revalidation (issue_children_completed / RAT-763 done)

- Date: 2026-05-11 18:18:00 -03
- Trigger: child FE implementation issue `RAT-763` completed

### Verification Executed

1. Runtime implementation diff review:
- `src/reviewModerationContract.js`
- `src/components/MobileReviewFlow.jsx`
- `src/components/MobileReviewFlow.test.jsx`

2. Focused automated regression:
- Command: `npm test`
- Result: PASS (`src/components/MobileReviewFlow.test.jsx`, 12/12)

### Acceptance Recheck

1. Status taxonomy alignment:
- Runtime labels now aligned in `src/reviewModerationContract.js`:
  - `En revision`
  - `No recomendada`
- Result: PASS

2. Explicit appeal CTA in non-recommended path:
- `ReviewCard` now renders `Iniciar apelacion` CTA for `no_recomendada`.
- CTA action wired through `appealReview(...)`.
- Result: PASS

3. Regression protection:
- New tests cover alias mapping (`under_review` -> `En revision`) and appeal CTA visibility/submit behavior.
- Result: PASS

### Final Gate Verdict

- US-40.1: PASS
- RAT-360 gate decision: APPROVED
- Release recommendation for this scope: UNBLOCKED
