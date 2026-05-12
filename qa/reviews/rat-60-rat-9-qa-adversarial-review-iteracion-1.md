# RAT-60 / RAT-9 - QA adversarial review (Iteracion 1)

Fecha: 2026-05-07  
Owner: Security Engineering  
Scope: validacion adversarial de implementacion contra `docs/trust-safety/rat-9-fraud-review-security-spec.md`

## Decision QA/Security

**BLOCKED** para cierre de hardening anti-fraude.

Se detectaron brechas de seguridad que permiten manipulacion de riesgo y debilitan trazabilidad/integridad operativa frente a abuso.

## Hallazgos

### 1) Riesgo manipulable por cliente (`riskScore`) - **High**
- Evidencia: `server/src/domain/reviewService.js:66` usa `riskScore: Number(input.riskScore ?? 0)`.
- Impacto adversarial: un actor puede enviar `riskScore` bajo para evadir `held_for_review/suppressed`; tambien puede enviar valores extremos para generar ruido y degradar el pipeline.
- Gap contra RAT-9: el score debe originarse en pipeline antifraude/backend trust boundary, no en input cliente.

### 2) Ausencia de autenticacion/autorizacion en decisiones de moderacion - **High**
- Evidencia: `server/src/domain/reviewService.js:90-117` acepta `input.decision.moderatorId` sin verificacion de identidad/rol real.
- Impacto adversarial: posibilidad de forjar actor moderador y ejecutar transiciones de estado no autorizadas si la capa de transporte no impone authz estricta.
- Gap OWASP ASVS: control de acceso insuficiente para accion sensible.

### 3) Idempotencia insegura cuando falta `idempotencyKey` - **Medium**
- Evidencia: `server/src/domain/reviewService.js:19` consulta `Map` con key opcional; `cacheIdempotent` guarda cualquier key (`linea 123`), incluida `undefined`.
- Impacto adversarial/operativo: requests sin key pueden quedar acoplados al primer resultado cacheado bajo `undefined`, rompiendo integridad funcional y facilitando replay/bypass inesperado.
- Requisito faltante: `idempotencyKey` obligatorio y validado en contrato API.

### 4) IDs predecibles para eventos/reviews/correlacion - **Medium**
- Evidencia: `server/src/domain/reviewService.js:160-161` usa `Math.random().toString(36)`.
- Impacto adversarial: menor entropia y riesgo de colision/predictibilidad en trazas; no apto para identificadores de seguridad/auditoria.
- Recomendacion: `crypto.randomUUID()` o `crypto.randomBytes`.

## Checklist adversarial vs RAT-9

- `S2 reviewer account risk score` enforceado server-side: **FAIL**
- Event integrity auditable (tamper resistance): **PARTIAL** (hash local sin almacenamiento inmutable/encadenado)
- Access control least privilege en moderacion: **FAIL**
- Abuse protection + replay controls: **PARTIAL**

## Acciones requeridas para pasar a PASS

1. Mover calculo/ingesta de `riskScore` a trusted backend pipeline; ignorar valor cliente.
2. Exigir autenticacion + autorizacion de rol moderador en transiciones (actor derivado de token/contexto, no de payload).
3. Hacer `idempotencyKey` obligatorio en create/patch sensibles y rechazar ausente/invalido.
4. Reemplazar generador de IDs por CSPRNG.
5. Adjuntar evidencia de pruebas adversariales para:
   - tampering de score,
   - replay sin idempotency key,
   - intento de moderacion sin rol.

## Gate de salida

Este review permanece en **BLOCKED** hasta que exista parche tecnico + evidencia QA adversarial de no-regresion.

---

## Update de remediacion (RAT-128, 2026-05-07)

Estado: **READY_FOR_RETEST**

Parche tecnico aplicado en backend:
- `server/src/domain/reviewService.js`
  - `riskScore` cliente ignorado; valor inicial seteado server-side.
  - `idempotencyKey` obligatorio en `createReview` y `transitionModeration`.
  - moderacion requiere `actor` autenticado con rol `moderator`; actor ya no sale de `decision` payload.
  - IDs de `review/event/correlation` migrados de `Math.random` a `crypto.randomUUID()`.
- `server/src/domain/reviewRules.js`
  - removido requisito `decision.moderatorId` (actor ahora deriva de identidad autenticada).
- `server/src/api/reviewsContract.js`
  - `idempotencyKey` obligatorio en contrato de creacion.

Evidencia minima de no-regresion:
- `node --test server/tests/*.test.js` -> **14/14 PASS**.
- Nuevos tests adversariales en `server/tests/reviewService.test.js`:
  - ignora `riskScore` enviado por cliente,
  - rechaza create sin `idempotencyKey`,
  - rechaza moderacion por actor sin rol.

Siguiente accion (owner QA):
- Re-ejecutar suite adversarial de `RAT-60` sobre el parche de `RAT-128` y publicar veredicto `PASS/BLOCKED` con evidencia.
