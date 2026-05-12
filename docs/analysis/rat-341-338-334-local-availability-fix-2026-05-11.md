# RAT-341 / RAT-338 / RAT-334 - Local Availability Fix (2026-05-11)

## Scope
- RAT-341: error `No pudimos cargar descubrimiento en vivo` en localhost:5178
- RAT-338: localhost server no muestra contenido
- RAT-334: `http://localhost:5173/` sin respuesta esperada

## Root causes encontrados
1. Faltaba `vite.config.js` con proxy `/api` al backend local (`127.0.0.1:5178`).
2. API clients frontend aceptaban solo `VITE_RATINGS_API_BASE_URL`, mientras documentación usaba `VITE_API_BASE_URL`.
3. Faltaba smoke reproducible único para disponibilidad FE+BE+discovery.

## Cambios aplicados
- Configuración Vite con proxy local:
  - `vite.config.js`
- Fallback de env var en clientes API:
  - `src/api/discoveryBookingApi.js`
  - `src/api/reviewsApi.js`
  - now accepts `VITE_RATINGS_API_BASE_URL` or `VITE_API_BASE_URL`
- Smoke script reproducible:
  - `tools/smoke/local-availability-smoke.sh`
  - `npm run smoke:local`
- Documentación actualizada:
  - `README.md`

## Evidencia de ejecución (heartbeat)
Comando ejecutado:
```bash
./tools/smoke/local-availability-smoke.sh
```
Resultado:
- `APP_HTTP_STATUS=200`
- `DISCOVERY_HTTP_STATUS=200`
- `DISCOVERY_PAYLOAD_OK=true`

## Recomendación de estado
- RAT-341: mover a `in_review` (fix implementado + smoke PASS)
- RAT-338: mover a `in_review` (disponibilidad local validada)
- RAT-334: mover a `in_review` (home en `5173` responde 200)

## Próximo paso
- Mantener `npm run smoke:local` como gate previo a marcar done en cualquier issue local-runtime relacionado.
