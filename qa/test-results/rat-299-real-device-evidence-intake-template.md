# RAT-299 Real-Device Accessibility Evidence Intake Template

Use this template during manual execution for RAT-299.

## Execution metadata
- Operator name:
- Date:
- Timezone:
- Start time:
- End time:
- Build/environment URL:
- iOS device model + iOS version:
- Android device model + Android version:
- iOS browser: Safari
- Android browser: Chrome
- Screen reader versions/settings notes:

## Artifact destination
- Recording folder/path:
- Transcript file/path:
- Defect tracker project:

## Matrix results

| Platform | SR | Browser | Flow step | Recording path/link | Transcript (observed announcements) | Verdict (PASS/FAIL) | Defect ID (if FAIL) |
|---|---|---|---|---|---|---|---|
| iOS | VoiceOver | Safari | create | | | | |
| iOS | VoiceOver | Safari | report | | | | |
| iOS | VoiceOver | Safari | respond | | | | |
| Android | TalkBack | Chrome | create | | | | |
| Android | TalkBack | Chrome | report | | | | |
| Android | TalkBack | Chrome | respond | | | | |

## Defect logging checklist (for each FAIL)
1. Include platform + SR + browser + flow step in title.
2. Attach recording clip with audio.
3. Include exact observed announcement and expected behavior.
4. Include reproducible steps and environment metadata.
5. Link defect ID back in matrix row.

## QA sign-off rule
- RAT-299 can only be marked done after all 6 rows have non-empty recording, transcript, and verdict fields, with defect IDs present for every FAIL.
