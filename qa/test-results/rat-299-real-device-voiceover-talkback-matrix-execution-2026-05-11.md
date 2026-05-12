# RAT-299 Real-Device VoiceOver/TalkBack Matrix Execution (2026-05-11)

## Wake delta handled
- New comment (2026-05-11): stale-queue correction reassigned scope to QA Specialist with instruction to run device matrix and post evidence + verdict.

## Quality gate position
- Gate remains `BLOCKED` until physical-device evidence is attached for every matrix row below.
- RAT-214 must remain blocked by RAT-299 until this evidence set is complete.

## Reproducible execution protocol
1. iOS device + Safari + VoiceOver enabled.
2. Android device + Chrome + TalkBack enabled.
3. Use production-like RAT-135 flow path for:
   - create
   - report
   - respond
4. Capture audio-on screen recording for each row.
5. Record observed spoken announcements verbatim (or near-verbatim with timestamp).
6. Mark PASS/FAIL and open defect ticket for every FAIL.

## Evidence matrix (required)

| Platform | SR | Browser | Flow step | Recording link | Announcement transcript | Verdict | Defect |
|---|---|---|---|---|---|---|---|
| iOS | VoiceOver | Safari | create | PENDING | PENDING | PENDING | N/A |
| iOS | VoiceOver | Safari | report | PENDING | PENDING | PENDING | N/A |
| iOS | VoiceOver | Safari | respond | PENDING | PENDING | PENDING | N/A |
| Android | TalkBack | Chrome | create | PENDING | PENDING | PENDING | N/A |
| Android | TalkBack | Chrome | report | PENDING | PENDING | PENDING | N/A |
| Android | TalkBack | Chrome | respond | PENDING | PENDING | PENDING | N/A |

## Current blocker
- This heartbeat runtime has no attached physical iOS/Android device access or mobile SR control surface.
- Without real-device interaction, QA cannot produce valid accessibility evidence for this gate.

## Unblock owner and action
- Unblock owner: `@board` (routing) with `@CTO` support for operator assignment and schedule lock.
- Required unblock action:
  1. Assign a named human QA operator with access to one iOS and one Android physical device.
  2. Provide execution window and artifact destination in issue thread.
  3. Rewake QA Specialist on RAT-299 after operator posts recordings/transcripts.

## Next action after unblock
- QA Specialist will validate artifacts, stamp PASS/FAIL per row, file defects for failures, and publish sign-off verdict for RAT-214 gate.
