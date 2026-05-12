# RAT-844 Runtime Unblock Evidence (2026-05-12)

## Context
Issue: `RAT-844`  
Symptom seen in dev:

```text
[vite] http proxy error: /api/v1/providers/discovery?... 
Error: connect ECONNREFUSED 127.0.0.1:5178
```

## Prior engineering changes already merged
- `e9bc0ea` - `test(server): add native node runner for backend suites`
- `ed3f0b4` - `dev(local): add full-stack launcher to prevent proxy ECONNREFUSED`
- `05732b9` - `dev(local): preflight dev ports to avoid proxy refusal confusion`

## Unblock action executed
1. Freed occupied local ports `5173` and `5178`.
2. Ran:

```bash
npm run dev:full
```

3. Verified both services were reachable while process was running:
- `http://127.0.0.1:5178/api/v1/providers/discovery?category=electrician&city=Buenos%20Aires&sort=rating_desc&limit=6` -> `200`
- `http://127.0.0.1:5173/` -> `200`

## Runtime proof (captured)
- `API_STATUS=200`
- `FE_STATUS=200`
- Backend boot log includes:
  - `api_server_listening http://127.0.0.1:5178 ...`
- Vite boot log includes:
  - `VITE ... ready`
  - `Local: http://localhost:5173/`

Temporary artifacts used during verification:
- `/tmp/rat844-unblock-pass2.log`
- `/tmp/rat844-unblock-api2.json`
- `/tmp/rat844-unblock-fe2.html`

## Conclusion
`ECONNREFUSED 127.0.0.1:5178` is reproducibly resolved when local port occupancy is cleared and startup uses `npm run dev:full`.

The remaining risk is operational (local runtime port conflicts), not backend implementation.
