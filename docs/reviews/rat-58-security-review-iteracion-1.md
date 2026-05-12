# RAT-58 / RAT-9 - Iteracion 1: Security review por Back-End Developer

Fecha: 2026-05-07
Owner: Security Engineer
Issue: RAT-58
Scope revisado: `server/src/*`, `server/tests/*`, `server/migrations/*`, `docs/trust-safety/rat-9-fraud-review-security-spec.md`

## Veredicto
Estado: `NO-GO` para release de backend en su forma actual.

Motivo: se detectaron riesgos de severidad alta sobre autenticidad de identificadores y falta de controles de autorizacion en flujos sensibles de moderacion/reporte.

## Hallazgos

### 1) IDs predecibles por uso de PRNG no criptografico
- Severidad: Alta
- OWASP: A02 Cryptographic Failures
- Evidencia: `server/src/domain/reviewService.js:160` usa `Math.random()` para generar `reviewId`, `eventId`, `correlationId` e `idempotencyKey` fallback.
- Riesgo: facilita enumeracion/colision y reduce integridad de trazas para antifraude y auditoria.
- Remediacion:
  - Reemplazar por `crypto.randomUUID()` o `crypto.randomBytes()`.
  - Prohibir fallback generado en server para `idempotencyKey`: debe venir del cliente/gateway y validarse.

### 2) Superficie de moderacion sin enforcement de AuthZ en contrato
- Severidad: Alta
- OWASP: A01 Broken Access Control
- Evidencia: `server/src/api/routes.js:19-27` define endpoints de `reports` y `appeals` solo con validacion minima de body; no hay evidencia de control de rol/propiedad en capa API.
- Riesgo: actor no autorizado podria reportar/apelar/moderar sin restricciones cuando se integre el transporte HTTP.
- Remediacion:
  - Exigir middleware de autenticacion y autorizacion por endpoint (`trust_safety|admin` para moderacion).
  - Validar ownership para apelaciones y fuente autorizada para reportes.

### 3) Event integrity parcial (hash sin firma ni cadena)
- Severidad: Media
- OWASP: A08 Software and Data Integrity Failures
- Evidencia: `server/src/domain/reviewService.js:151` calcula `sha256` del sobre, pero no hay firma con clave ni encadenamiento de eventos.
- Riesgo: un atacante interno con acceso de escritura puede reescribir eventos e integrity hash juntos sin deteccion.
- Remediacion:
  - Firmar eventos con HMAC/KMS key.
  - Agregar `previousEventHash` para cadena inmutable y verificacion offline.

### 4) Riesgo de abuso de memoria por indices in-memory sin TTL
- Severidad: Media
- OWASP: A04 Insecure Design
- Evidencia: `idempotencyIndex` y `velocityWindowByUser` son `Map` sin expiracion (`server/src/domain/reviewService.js:13-14,123-136`).
- Riesgo: crecimiento no acotado => degradacion/DoS en procesos largos.
- Remediacion:
  - Implementar TTL + eviction policy.
  - Mover idempotencia/ratelimit a storage compartido con expiracion.

### 5) Validacion de entrada incompleta para campos de identidad
- Severidad: Baja
- OWASP: A03 Injection (prevencion defensiva)
- Evidencia: `server/src/api/reviewsContract.js` solo valida presencia/rango en algunos campos, sin formato canonico para IDs.
- Riesgo: datos malformados terminan en logs/eventos y complican controles posteriores.
- Remediacion:
  - Validar esquema estricto (UUID/ULID/regex por tipo).
  - Rechazar campos desconocidos (`additionalProperties: false`).

## Gate de seguridad
Release bloqueado hasta cerrar obligatoriamente:
1. Reemplazo de generacion de IDs por CSPRNG.
2. Definicion e implementacion de AuthN/AuthZ para endpoints sensibles.
3. Hardening de integridad de eventos (firma + cadena) segun baseline RAT-46.

## Proxima accion recomendada
Crear issue hijo de hardening backend con checklist de seguridad y pruebas negativas (authz bypass, replay/id collisions, event tamper).
