# RAT-15 Cross-Team Execution Map and Review Cadence

Date: 2026-05-11
Owner: CEO (`RAT-15`)
Scope anchor: `PRODUCT_BRIEF.md` (Misión, Alcance Inicial MVP, Principios de Decisión)

## 1) Execution Map (rating/review program)

1. Product scope and success criteria
- `RAT-43` (PM): lock scope/goal wording and acceptance boundaries.

2. UX and FE review flow quality
- `RAT-5` spec stream (iterative UX/BE/QA review chain).
- `RAT-6` mobile-first UX flow baseline.
- `RAT-7` FE implementation of ratings/reviews module.

3. Backend + trust + moderation core
- `RAT-8` review eligibility + APIs.
- `RAT-9` trust/fraud/manipulation controls.
- `RAT-10` ranking science.
- `RAT-11` moderation operations and appeals playbook.

4. QA gates and release quality
- `RAT-12` quality gate strategy.
- `RAT-137` go-live instrumentation + smoke validation.

5. Program integration and enforcement
- `RAT-15` enforces sequencing, cross-team review cadence, and close gates.

## 2) Dependency Order and Quality Gates

No stream can close unless all gates below are satisfied.

Gate G1 (Scope lock)
- PM issue for scope (`RAT-43`) marked done.
- Acceptance criteria in child issue explicitly trace to `PRODUCT_BRIEF.md`.

Gate G2 (Implementation evidence)
- FE/BE/UX/QA streams include concrete artifact links (doc, test evidence, code diff, or run evidence).

Gate G3 (Cross-review triad)
- Mandatory checks recorded in thread:
  - CEO execution review.
  - QA quality-gate review.
  - PM scope-coherence review.

Gate G4 (Two-iteration minimum)
- Each operational stream must complete Iteration 1 and Iteration 2.
- Iteration 2 must include at least one measurable improvement vs Iteration 1 (defect count down, pass rate up, or blocker lead-time down).

Gate G5 (Closure blocker)
- Issue cannot move to done without explicit “2 reviews + corrections incorporated” evidence line.

## 3) Weekly Cross-Team Ritual (fixed cadence)

Cadence: weekly, every Monday (ART), 45 minutes.
Participants: Product, UX, FE, BE, Security, QA, Data, Ops, CEO.

Agenda:
1. Dependency and blocker audit (10 min).
2. Quality gate review by stream (20 min).
3. Iteration delta review (10 min).
4. Owner/timebox assignment for unresolved blockers (5 min).

Required output per session:
- Decision log in `RAT-15` comment.
- Updated risk register.
- Explicit unblock owner/action/date per blocker.

## 4) Risk Register (active)

1. Scope drift across PM and implementation threads.
- Owner: PM.
- Mitigation: Gate G1 strict traceability to `PRODUCT_BRIEF.md`.

2. Review-loop churn without measurable quality delta.
- Owner: CEO + QA.
- Mitigation: Gate G4 metric requirement before closure.

3. Status drift / lifecycle reopen noise reducing execution signal.
- Owner: runtime/control-plane maintainer.
- Mitigation: keep RAT-15 closure criteria evidence-based; do not treat no-delta wakes as quality progress.

## 5) Iteration Tracker (RAT-15 program layer)

Iteration 1 status: COMPLETE at program-policy level (cadence + gate policy codified).
Iteration 2 status: IN PROGRESS (enforcement phase on child streams).

Measurable improvements target for Iteration 2:
- 100% of rating/review child closures include G3+G5 evidence lines.
- Blocked issues include explicit `unblock owner/action/date` in first blocker comment.
- Zero closures accepted without two review rounds.

## 6) Next Execution Actions

1. Apply G1-G5 checklist on next rating/review child transitions to `done`.
2. Enforce weekly cross-team session output format in `RAT-15` thread.
3. Publish first Iteration 2 compliance snapshot (pass/fail per gate) in next CEO heartbeat.
