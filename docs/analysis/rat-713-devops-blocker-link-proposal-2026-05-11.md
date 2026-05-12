# RAT-713 — DevOps blocker-link proposal for blocked needs_attention slice (2026-05-11)

## Purpose
Convert the DevOps `blocked + needs_attention` slice into explicit first-class blocker edges (`blockedByIssueIds`) with named unblock owner/action.

## Input set
From `qa/test-results/rat-713-devops-cluster-2026-05-11.txt`:
- RAT-691, RAT-388, RAT-392, RAT-659, RAT-632, RAT-568, RAT-646, RAT-573, RAT-428, RAT-346

## Proposed normalization matrix
| Issue | Proposed `blockedByIssueIds` | Unblock owner | Required unblock action |
|---|---|---|---|
| RAT-691 | `[RAT-554]` | RAT-554 owner | Complete blocker normalization on RAT-554 exception shard for owner `8dd474b9`; then mark RAT-691 done. |
| RAT-388 | `[RAT-721]` | DevOps + control-plane lifecycle owner | Finish runlock/state correction on RAT-388 lane and attach closure evidence. |
| RAT-392 | `[RAT-747]` | Platform/SRE | Deliver staging/prod actor-signing rollout evidence package; unblock QA/ship gate chain. |
| RAT-659 | `[RAT-579]` | CTO/control-plane owner | Complete ownership-correction batch B runtime workspace binding route. |
| RAT-632 | `[RAT-292]` | RAT-292 owner + CTO/control-plane owner | Finalize RAT-292 workspace-bind execution and post ownership correction evidence. |
| RAT-568 | `[RAT-428]` | CTO board / control-plane lifecycle maintainer | Land control-plane lifecycle guard patch + replay evidence + regression proof, then reopen/close dependent duplicate lanes. |
| RAT-646 | `[RAT-639]` | RAT-639 owner | Clear parent writeback lock and publish stale-queue correction receipt for DevOps shard. |
| RAT-573 | `[RAT-582]` | CTO/control-plane runtime owner | Release conflicting run lock and execute RAT-573 in control-plane workspace owning `/api/issues` lifecycle code. |
| RAT-428 | `[RAT-568]` | CTO board / control-plane lifecycle maintainer | Complete canonical status-governor fix in owning control-plane repo and attach runtime evidence. |
| RAT-346 | `[RAT-347]` | Platform lead / backend runtime owner | Unblock local-postgres/app availability dependency chain and post runnable evidence. |

## Notes on confidence
- High confidence (already documented upstream in current artifacts): RAT-392->RAT-747, RAT-659->RAT-579, RAT-632->RAT-292, RAT-568->RAT-428, RAT-646->RAT-639.
- Medium confidence (derived from lane semantics and prior cluster docs): RAT-691->RAT-554, RAT-388->RAT-721, RAT-573->RAT-582, RAT-428->RAT-568, RAT-346->RAT-347.

## Execution-ready next action
1. Apply these `blockedByIssueIds` in control-plane issue records.
2. Re-run `bash tools/guardrails/check-rat-713-needs-attention-devops-cluster.sh`.
3. If any row cannot accept blocker edges due API constraints, keep `blocked` and publish explicit unblock owner/action in-thread with the failure reason.
