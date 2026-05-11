# RAT-538 Runtime Guardrail Regression Evidence (2026-05-11)

## Execution delta addressed
- Processed comment `f436853d-43a8-47b8-999d-8e8bb4e85856` instructing implementation/evidence handoff after deadlock correction.
- Re-validated runtime ownership and available control-plane guardrail implementation artifacts in this workspace.

## Touched runtime paths (guardrail surface)
- `tools/guardrails/issueLifecycleGuard.js`
- `tools/guardrails/issueLifecycleGuard.test.js`
- `tools/guardrails/check-rat-363-terminal-reopen-contract.sh`
- `tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`

## Contract checks executed
### 1) Runtime-surface probe
```bash
bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh
```
Output:
```text
RAT-413 runtime surface check
repo: /Users/martinmarquez/uber-services
RESULT=BLOCKED_WRONG_REPO
DETAIL=No control-plane issue lifecycle runtime signatures found in server/*
```

### 2) Terminal reopen + dedupe contract replay
```bash
bash tools/guardrails/check-rat-363-terminal-reopen-contract.sh
```
Output:
```text
RAT-363 terminal reopen contract check
repo: /Users/martinmarquez/uber-services
PASS: terminal reopen blocked without resume -> {"allow":false,"code":"resume_required_for_terminal_reopen"}
PASS: terminal reopen allowed with explicit scoped resume -> {"allow":true,"code":"ok_explicit_resume"}
PASS: no-delta status wake deduped for terminal issue -> {"emit":false,"code":"dedupe_terminal_resume_wake_without_comment_delta"}
PASS: terminal issue cannot auto-resume from blocker resolution -> {"allow":false,"code":"auto_resume_blocked_for_terminal_issue"}
RESULT=PASS
```

### 3) Comprehensive regression suite
```bash
node --test tools/guardrails/issueLifecycleGuard.test.js
```
Summary:
```text
# tests 49
# pass 49
# fail 0
# duration_ms 50.449166
```

## Acceptance mapping (RAT-538)
1. Terminal + no resume + automation/checkout: blocked (`resume_required_for_terminal_reopen`).
2. Explicit `resume:true` + scoped source + actor + reason: allowed (`ok_explicit_resume`).
3. No-delta status-change wake dedupe: blocked emission (`dedupe_terminal_resume_wake_without_comment_delta`).
4. Blocker-resolution auto-resume for terminal issues: blocked (`auto_resume_blocked_for_terminal_issue`).

## Remaining blocker and unblock owner
- This repository still lacks authoritative `/api/issues` runtime handlers under `server/*`; guardrail implementation remains represented as contract modules/replays.
- Unblock owner: `@CTO` / control-plane lifecycle runtime maintainer.
- Unblock action: validate this contract evidence against the owning control-plane runtime repository and confirm merge/deploy there.

## Request
- CTO validation requested for RAT-538 based on the evidence above and alignment with parent `RAT-465` unblock criteria.
