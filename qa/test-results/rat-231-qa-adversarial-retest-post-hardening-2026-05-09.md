# RAT-231 - QA adversarial re-test post-hardening (RAT-128)

Fecha: 2026-05-09 22:11 ART  
Owner: Security Engineering  
Scope: re-ejecucion adversarial de `RAT-60` sobre parche `RAT-128`.

## Decision QA/Security

**PASS** para el alcance de hardening anti-fraude de `RAT-128`.

No se observaron regresiones en los controles que bloqueaban Iteracion 1:
- `riskScore` ya no es manipulable por payload cliente.
- transiciones de moderacion requieren actor autenticado con rol `moderator`.
- `idempotencyKey` es obligatorio en operaciones sensibles.
- IDs sensibles migrados a `crypto.randomUUID()`.

## Evidencia ejecutada

Comando:

```bash
node --test server/tests/*.test.js
```

Resultado:
- `tests`: 60
- `pass`: 58
- `fail`: 0
- `skipped`: 2 (paridad postgres, fuera de alcance local)

Pruebas adversariales clave (PASS):
- `createReview ignores client-provided riskScore`
- `createReview rejects missing idempotency key`
- `transitionModeration rejects non-moderator actor`
- `signed actor mode rejects unsigned actor headers`
- `offline verifier detects payload tampering`

## Cobertura contra hallazgos de RAT-60

1. Riesgo manipulable por cliente (`riskScore`): **PASS**
2. AuthN/AuthZ en moderacion: **PASS**
3. Idempotencia insegura sin key: **PASS**
4. IDs predecibles: **PASS**

## Riesgos residuales / seguimiento

- La suite local mantiene 2 tests postgres en `SKIP`; ejecutar evidencia equivalente en entorno con Postgres antes de release final.
- Este veredicto cubre hardening backend y controles de API; mantener monitoreo FP/FN y telemetria de fraude segun `RAT-9` en rollout.
