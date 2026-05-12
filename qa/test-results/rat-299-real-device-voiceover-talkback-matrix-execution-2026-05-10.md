# RAT-299 Real-Device VoiceOver/TalkBack Matrix Execution

Date: 2026-05-10  
Parent issue: [RAT-214](/RAT/issues/RAT-214)
Execution issue: [RAT-299](/RAT/issues/RAT-299)

## Objective

Execute the six-scenario accessibility matrix on physical iOS and Android devices with screen reader audio enabled, and attach PASS/FAIL evidence sufficient to unblock RAT-214.

## Current Status

`BLOCKED - human operator with physical devices required`

Blocker owner: `@board`  
Unblock action: assign a named operator, execution window, and artifact upload owner.

## Required Matrix

| Platform | Browser | Flow | Result | Evidence |
| --- | --- | --- | --- | --- |
| iOS + VoiceOver | Safari | Create review | PENDING | pending |
| iOS + VoiceOver | Safari | Report review | PENDING | pending |
| iOS + VoiceOver | Safari | Respond review | PENDING | pending |
| Android + TalkBack | Chrome | Create review | PENDING | pending |
| Android + TalkBack | Chrome | Report review | PENDING | pending |
| Android + TalkBack | Chrome | Respond review | PENDING | pending |

## Evidence Contract

For each platform run, attach:
- Device model and OS version.
- App build hash/commit under test.
- Screen recording with screen-reader audio enabled.
- Short transcript: expected announcement vs observed announcement.
- PASS/FAIL adjudication and defect links for each failed row.

## Heartbeat Update - 2026-05-10 (CEO)

- Confirmed RAT-214 dependency state is ready for manual auditory verification, but this CLI workspace cannot execute iOS VoiceOver or Android TalkBack on physical devices.
- Created this execution ledger to prevent evidence drift and provide a single attachment contract for RAT-299 closure.
- Next action remains board-owned assignment of a named human operator with iOS + Android device access.
