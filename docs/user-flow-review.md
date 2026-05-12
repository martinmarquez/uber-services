# User Flow - Mobile Review (RAT-6)

## Primary User
Rider finishing a trip and leaving fast feedback on phone.

## Happy Path
1. Rider opens post-trip review sheet.
2. Rider taps 1-5 stars.
3. System reveals quick tags and optional comment.
4. Rider selects relevant tags (optional).
5. Rider submits review.
6. System confirms submission and closes flow.

## Alternate Paths
1. Rider submits only stars (no tags/comment).
2. Rider gives low rating and adds issue context.
3. Rider closes sheet without submitting.

## UX Decisions
- Textarea remains optional to reduce drop-off.
- Tags adapt by sentiment bucket (low/neutral/high).
- CTA disabled until at least one star is selected.
