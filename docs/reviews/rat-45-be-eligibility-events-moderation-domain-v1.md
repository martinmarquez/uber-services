# RAT-45 Backend Domain v1: Eligibility, Events, Moderation

Date: 2026-05-06  
Owner: CTO  
Status: Approved for implementation

## 1) Scope
Define the canonical backend domain contract for MVP reviews:
- Eligibility verification for review creation.
- Event model for audit, scoring, and moderation integration.
- Moderation state machine aligned to RAT-44 taxonomy.

## 2) Domain Entities
### `review`
- `id` (uuid)
- `service_request_id` (uuid)
- `reviewer_user_id` (uuid)
- `provider_user_id` (uuid)
- `rating` (int 1..5)
- `comment` (text, optional)
- `status` (enum): `verificada | en_revision | no_recomendada | removida`
- `eligibility_result` (enum): `eligible | ineligible`
- `eligibility_reason` (enum):
  `service_not_completed | outside_14_day_window | identity_mismatch | duplicate_review | rate_limited | other_policy_violation`
- `created_at`, `updated_at`

### `review_event` (immutable append-only)
- `id` (uuid)
- `review_id` (uuid, nullable for rejected create attempts)
- `event_name` (enum from section 4)
- `event_version` (`v1`)
- `occurred_at` (timestamp with tz)
- `actor_type` (`system | user | moderator`)
- `actor_id` (uuid/string)
- `correlation_id` (string)
- `idempotency_key` (string)
- `payload_json` (jsonb)
- `integrity_hash` (string, SHA-256 over canonical envelope)

## 3) Eligibility Contract
Review creation is allowed only when all checks pass:
1. Verified completed service for `service_request_id`.
2. Reviewer identity matches transaction participant.
3. Review created within 14 days from service completion timestamp.
4. One active review per reviewer/service pair for MVP.
5. Velocity/rate-limit checks pass.

Failure behavior:
- API returns business error with deterministic `eligibility_reason`.
- Emit `review_eligibility_failed.v1` event with reason and correlation id.
- Do not create `review` row for failed eligibility.

## 4) Event Catalog (v1)
Mandatory events and producers:
- `review_eligibility_checked.v1` (Eligibility service)
- `review_eligibility_failed.v1` (Eligibility service)
- `review_created.v1` (Reviews API)
- `review_sent_to_moderation.v1` (Rules/Fraud pipeline)
- `review_moderation_decided.v1` (Moderation service)
- `review_published.v1` (Publication worker)
- `review_removed.v1` (Moderation service)
- `review_appeal_opened.v1` (Appeals API)
- `review_appeal_closed.v1` (Appeals API)

Envelope requirements:
- Include `event_id`, `event_name`, `event_version`, `occurred_at`, `correlation_id`, `idempotency_key`, `actor`, `payload`.
- At-least-once delivery with consumer idempotency via `idempotency_key`.
- Payload evolution only by additive fields in `v1`; breaking changes require `v2`.

## 5) Moderation State Machine (v1)
Allowed transitions:
- `verificada -> en_revision` (automatic risk signal or user report)
- `en_revision -> verificada` (appeal accepted or review cleared)
- `en_revision -> no_recomendada` (policy/fraud determination)
- `en_revision -> removida` (severe policy determination)
- `no_recomendada -> en_revision` (appeal reopened)
- `removida -> en_revision` (appeal reopened)

Forbidden transitions:
- Direct `verificada -> removida` without `en_revision`.
- Any transition without `review_moderation_decided.v1`.

Mandatory moderation metadata:
- `reason_code` (RAT-44 canonical)
- `severity` (`SEV-0..SEV-3`)
- `decision_note`
- `moderator_id`

## 6) Security and Integrity Controls
- Append-only `review_event`; no hard deletes.
- Signed event envelope hash persisted in `integrity_hash`.
- Least-privilege DB roles:
  - API role cannot update moderation decision fields directly.
  - Only moderation service role can emit `review_moderation_decided.v1`.
- PII minimization: no raw personal contact data in event payloads.

## 7) API/Consumer Implications
- FE must render status only from canonical enum above.
- Scoring pipeline must exclude `en_revision` and `no_recomendada` from public aggregate.
- QA must validate idempotent replay of all event types and forbidden transitions.

### 7.1 RAT-376: S6 fraud telemetry extension (additive, v1)
- `fraudHeuristics.s6Telemetry` remains the canonical telemetry object with:
  - `sourcesExpected` (int, required by sender)
  - `sourcesPresent` (int, required by sender)
  - `completenessRatio` (float 0..1, derived by sender)
  - `status` (`partial | complete`, derived by sender)
- New additive object `fraudHeuristics.s6Alert` is now required in consumer-facing event payloads when present in sender output:
  - `active` (boolean)
  - `kind` (`none | sustained_partial_availability`)
  - `threshold` (int, default `2`)
  - `consecutivePartialCount` (int)
- Consumers SHOULD treat `s6Alert` as optional: absence is interpreted as unknown coverage state.
- `s6Alert` is additive and does not change existing `v1` event naming.
- Repeated `s6Telemetry.status === "partial"` should raise `s6Alert.active=true` only after `threshold` consecutive partials for the same `reviewId`.
- Alert state resets to inactive when `s6Telemetry.status` is `complete`.

## 8) Implementation Checklist
1. Add DB enums and constraints for `status`, `eligibility_result`, `eligibility_reason`.
2. Add `review_event` table with unique index on (`event_name`, `idempotency_key`).
3. Implement Eligibility service pre-check in create-review API.
4. Emit event catalog with envelope validation and correlation propagation.
5. Implement moderation transition guardrails in service layer.
6. Add integration tests for allowed/forbidden transitions and event replay idempotency.

## 9) Verifiable Closure Criteria (Done Gate)
RAT-45 can move to `done` only when all checks below are evidenced:

1. Schema contract merged
- DB migration includes enums and constraints from sections 2, 3, and 5.
- `review_event` append-only constraints plus unique idempotency index are present.
- Evidence: migration files + migration apply log in PR.

2. Eligibility gate enforced
- Create-review endpoint rejects ineligible requests with deterministic `eligibility_reason`.
- Ineligible flow does not persist `review` rows.
- Evidence: integration test cases for each rejection reason.

3. Event catalog emitted
- All event names in section 4 are emitted with envelope fields:
  `event_id`, `event_name`, `event_version`, `occurred_at`, `correlation_id`, `idempotency_key`, `actor`, `payload`.
- Evidence: contract tests + sample event fixtures committed in repo.

4. Moderation transitions guarded
- Forbidden transitions are blocked at service layer.
- Any moderation transition requires `review_moderation_decided.v1` with `reason_code`, `severity`, `decision_note`, `moderator_id`.
- Evidence: transition matrix tests (allow + deny cases).

5. Security hooks active
- `review_event` remains immutable (no update/delete path).
- Event payload PII redaction/minimization validated.
- Evidence: repository policy test or static check + security review note.

6. QA gate linked
- QA references RAT-45 coverage in quality gate evidence under `qa/test-results/`.
- Evidence: one PASS artifact referencing RAT-45 contract sections.

## 10) Handoff Dependencies (Unblocks)
- When criteria #1-#4 are complete, RAT-47 and RAT-48 may start implementation against this contract.
- RAT-49 must remain blocked until criteria #5 and #6 are complete.
- Root-blocker cascade handoff artifact for RAT-47 -> RAT-28 -> RAT-51:
  - `docs/reviews/rat-45-handoff-unblock-cascade.md`
- Consolidated closure evidence bundle (PASS/FAIL by criterion):
  - `docs/reviews/rat-45-closure-evidence-bundle-2026-05-07.md`
