# RAT-141 Security Audit: KMS-backed Event Signing + Offline Integrity Verification

Date: 2026-05-07
Owner: Security Engineer

## Scope
- Replace insecure in-memory HMAC-only event signing path with KMS-compatible signer abstraction.
- Add offline verification for event integrity and hash-chain continuity.
- Add regression tests for tamper detection.

## Changes implemented
- `ReviewService` now uses `eventSigner.signDigest(integrityHash)` and stores signing metadata per event:
  - `signature`
  - `signatureAlgorithm`
  - `signatureKeyId`
- Added `server/src/security/eventIntegrity.js` with:
  - `defaultEventSigner()`:
    - primary path: asymmetric signing from `EVENT_SIGNING_PRIVATE_KEY_PEM` + `EVENT_SIGNING_KEY_ID` (KMS-compatible contract)
    - fallback path: `HMAC-SHA256` for local/dev only (`EVENT_SIGNING_FALLBACK_HMAC_KEY`)
  - `verifyEventChain(events, resolvePublicKeyById)`:
    - verifies hash-chain link (`previousEventHash`)
    - recomputes `integrityHash` from envelope
    - verifies signature using key resolver for offline checks
- Test coverage expanded in `server/tests/reviewService.test.js`:
  - passes with asymmetric key metadata and offline verification
  - fails on payload tampering

## Security posture after this heartbeat
- Improved non-repudiation and auditability for event logs.
- Integrity verification can run offline with public keys, independent of runtime secret material.
- Residual risk: production KMS adapter wiring is still required (actual `Sign` call and key retrieval/rotation policy in runtime config).

## Minimal verification run
- Command: `node --test server/tests/reviewService.test.js`
- Result: PASS (10/10)

## Follow-up hardening (2026-05-10)
- Enforced fail-fast outside `development`/`test`: `defaultEventSigner` now throws when `EVENT_SIGNING_PRIVATE_KEY_PEM` or `EVENT_SIGNING_KEY_ID` is missing.
- Removed static hardcoded fallback secret from code; non-asymmetric fallback now uses explicit env secret or process-random ephemeral key.
- Extended offline verifier to support `HMAC-SHA256` verification in addition to asymmetric verification.
- Added verifier CLI: `server/scripts/verify-event-chain.js` for offline chain validation from exported JSON logs.
- Added tests for:
  - fail-fast behavior in production env
  - HMAC chain verification path
  - verifier script execution path
- Verification rerun: `node --test server/tests/reviewService.test.js` PASS (21/21).
