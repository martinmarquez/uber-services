# RAT-218 production-sim Actor Signing Evidence

Generated at (UTC): 2026-05-11T03:56:27Z
Base URL: http://127.0.0.1:3804

## Smoke Summary

- Case 1 (signed): HTTP 201
- Case 2 (unsigned): HTTP 401 (actor_signature_required)
- Case 3 (tampered): HTTP 401 (invalid_actor_signature)

## Raw Output

```text
== Case 1: signed request should succeed (201 or business-validation rejection, but not AUTHENTICATION_ERROR) ==
HTTP/1.1 201 Created
content-type: application/json; charset=utf-8
content-length: 439
Date: Mon, 11 May 2026 03:56:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"replay":true,"ok":true,"serviceRequest":{"id":"sr_7f5cb4cd-1e9d-4305-bf80-728b3729f2e0","customerUserId":"cus-smoke-1","providerUserId":"prov-1","category":"cleaning","city":"Buenos Aires","notes":"RAT-218 actor signing smoke request body","scheduledAt":"2026-05-11T10:00:00.000Z","status":"completed","completedAt":"2026-05-07T10:00:00.000Z","createdAt":"2026-05-11T03:56:27.861Z","updatedAt":"2026-05-11T03:56:27.863Z"},"version":"v1"}\n== Case 2: unsigned actor headers should fail with actor_signature_required ==
HTTP/1.1 401 Unauthorized
content-type: application/json; charset=utf-8
content-length: 127
Date: Mon, 11 May 2026 03:56:28 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"AUTHENTICATION_ERROR","message":"Actor authentication failed","details":{"code":"actor_signature_required"}}}\n== Case 3: tampered signature should fail with invalid_actor_signature ==
HTTP/1.1 401 Unauthorized
content-type: application/json; charset=utf-8
content-length: 126
Date: Mon, 11 May 2026 03:56:28 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"AUTHENTICATION_ERROR","message":"Actor authentication failed","details":{"code":"invalid_actor_signature"}}}
```

## 24h AUTHENTICATION_ERROR Summary

```json
{
  "totalAuthErrors": 3,
  "breakdown": {
    "actor_signature_required": 1,
    "invalid_actor_signature": 1,
    "actor_signature_expired": 1,
    "invalid_actor_timestamp": 0,
    "other_authentication_error": 0
  }
}
```
