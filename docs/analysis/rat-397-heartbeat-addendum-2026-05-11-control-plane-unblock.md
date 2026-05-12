# RAT-397 Heartbeat Addendum — Control-plane unblock packet (2026-05-11)

## Wake handled
- Issue: `RAT-397`
- Wake reason: `issue_status_changed`
- Status on wake: `in_progress`
- Latest comment delta: none (`0/0`)

## Heartbeat action taken
1. Revalidated workspace ownership boundaries against RAT-397 target behavior.
2. Re-scanned this checkout for the owning issue lifecycle mutation runtime (`/api/issues` checkout/state-transition engine).
3. Confirmed the runtime required to patch terminal issue reopen behavior is still absent in `/Users/martinmarquez/uber-services`.

## Conclusion
`RAT-397` remains blocked for implementation in this workspace. The defect is in the Paperclip control-plane lifecycle runtime, not in the product domain code present here.

## Required control-plane patch (unblock contract)
1. Enforce terminal-state immutability: `done`/`cancelled` cannot transition to active states without explicit `resume: true`.
2. Make checkout non-mutating for terminal issues unless explicit resume intent exists.
3. Suppress no-delta status-change wake mutations that re-open terminal issues.
4. Add auditable reopen provenance when `resume: true` is accepted (actor + reason + timestamp).

## Minimum verification set expected from owner repo
1. Regression test: terminal + checkout + no resume => status unchanged.
2. Regression test: terminal + wake/no-delta => no reopen mutation.
3. Regression test: explicit `resume: true` => reopen allowed once, with provenance recorded.
4. Replay evidence on one known reproducer issue showing no implicit reopen.

## Unblock owner/action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Action: land patch + attach test and replay evidence, then hand back to `RAT-397` for closure.

## Next action for this issue
Keep `RAT-397` in `blocked` until the control-plane patch/evidence packet is attached; then run focused replay validation and close.
