# RAT-218 local Actor Signing Evidence

Generated at (UTC): 2026-05-11T09:25:18Z
Base URL: http://127.0.0.1:5178

## Smoke Summary

- Case 1 (signed): HTTP 201
- Case 2 (unsigned): HTTP 401 (actor_signature_required)
- Case 3 (tampered): HTTP 401 (invalid_actor_signature)

## Raw Output

```text
== Case 1: signed request should succeed (201 or business-validation rejection, but not AUTHENTICATION_ERROR) ==
HTTP/1.1 201 Created
content-type: application/json; charset=utf-8
content-length: 425
Date: Mon, 11 May 2026 09:25:18 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"serviceRequest":{"id":"sr_719e01a0-0108-4a42-8268-8b2c9a5c1ef0","customerUserId":"cus-smoke-1","providerUserId":"prov-1","category":"cleaning","city":"Buenos Aires","notes":"RAT-218 actor signing smoke request body","scheduledAt":"2026-05-11T10:00:00.000Z","status":"completed","completedAt":"2026-05-07T10:00:00.000Z","createdAt":"2026-05-11T09:25:18.223Z","updatedAt":"2026-05-11T09:25:18.223Z"},"version":"v1"}\n== Case 2: unsigned actor headers should fail with actor_signature_required ==
HTTP/1.1 401 Unauthorized
content-type: application/json; charset=utf-8
content-length: 127
Date: Mon, 11 May 2026 09:25:18 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"AUTHENTICATION_ERROR","message":"Actor authentication failed","details":{"code":"actor_signature_required"}}}\n== Case 3: tampered signature should fail with invalid_actor_signature ==
HTTP/1.1 401 Unauthorized
content-type: application/json; charset=utf-8
content-length: 126
Date: Mon, 11 May 2026 09:25:18 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"AUTHENTICATION_ERROR","message":"Actor authentication failed","details":{"code":"invalid_actor_signature"}}}
```
