# RAT-397 Status Normalization Follow-up (2026-05-12)

## Wake delta handled
- Reason: `issue_children_completed`
- New comment: `1179c487-ead7-4f2b-b99f-89d16ea20bb2`
- Comment instruction: RAT-397 has a confirmed external control-plane dependency and should not remain `in_progress`.

## Heartbeat action
1. Accepted the child-review correction as authoritative for current lifecycle state.
2. Reaffirmed unblock contract from prior packet:
   - `docs/analysis/rat-397-heartbeat-addendum-2026-05-11-control-plane-unblock.md`
3. Normalization rule for this issue: keep RAT-397 `blocked` until control-plane evidence is attached.

## Effective blocker contract
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required patch:
  1. terminal-state reopen guard (`done/cancelled` immutable unless explicit `resume: true`),
  2. checkout non-mutation for terminal issues without explicit resume,
  3. no-delta wake reopen suppression,
  4. tests + replay evidence attached.

## Resume gate
Resume RAT-397 only after owner evidence is attached, then run focused replay validation and close.

## Next action
No local code mutation is authoritative in this repository for `/api/issues` lifecycle behavior. Maintain blocked posture and await owner patch/evidence handoff.
