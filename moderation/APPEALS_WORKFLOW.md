# Workflow de Apelaciones (E2E)

## Objetivo
Garantizar revisión justa, rápida y trazable de decisiones de moderación.

## Ownership por Etapa
1. Intake y validación: Soporte L1.
2. Revisión de fondo: Moderación L2.
3. Riesgo/política: Security + PM (si aplica).
4. Resolución final: Moderación Lead.
5. Escalación ejecutiva: CEO (casos estratégicos/churn).

## Flujo
1. Usuario presenta apelación con motivo y evidencia.
2. L1 valida formato y completitud (<= 30 min para SEV-0/1, <= 4 h para SEV-2/3).
3. L2 revisa decisión original + evidencia nueva.
4. Si hay riesgo de abuso/fraude o conflicto de policy, abrir subflujo de revisión Security/PM.
5. Emitir decisión final: `confirmada`, `modificada`, o `revertida`.
6. Comunicar resolución con justificación simple y próximos pasos.

## Elegibilidad y Consistencia de Apelación
- Puede apelar tanto quien reporta como quien fue impactado por la decisión.
- No se aceptan apelaciones sin evidencia incremental respecto del caso original.
- Resultado de apelación debe mapear a estado visible:
  - `confirmada`: mantiene estado actual (`en revisión`, `no recomendada` o removida).
  - `modificada`: cambia severidad/acción, con nuevo estado explícito.
  - `revertida`: restaura visibilidad y, si aplica, vuelve a `reseña verificada`.
- Si el caso involucra incentivos condicionados a nota, la reversión requiere validación explícita de PM + Security.

## Guardrails Anti-Abuso de Apelaciones
- Máximo 1 apelación activa por caso; nuevas evidencias se anexan al mismo expediente.
- Cooldown de 7 días para reapertura si no hay evidencia materialmente nueva.
- Si hay patrón de apelaciones masivas coordinadas, escalar a Security como `SEV-1`.
- `SEV-0/1` no puede revertirse por un único revisor: requiere doble aprobación (`Moderation Lead` + `Security`).
- Si la apelación toca un caso con contención activa, la reversión exige validación explícita de blast radius y `rollback_plan`.

## Reglas de Calidad
- Un operador no puede resolver su propia decisión original en apelación.
- Toda reversión requiere nota de aprendizaje para update de criterio.
- Casos con potencial churn alto se marcan `exec-watch` y notifican al CEO.
- Toda decisión final debe registrar `decision_reason`, evidencia usada y referencias de policy.

## Manejo de Evidencia y Cadena de Custodia
- Congelar snapshots de evidencia al inicio de apelación para evitar manipulación posterior.
- Mantener hash/checksum de adjuntos críticos cuando aplique.
- Registrar acceso a evidencia sensible (quién, cuándo, para qué).
- Enmascarar PII no necesaria en vistas operativas y auditorías compartidas.
- Bloquear descarga/exportación de evidencia sensible salvo rol autorizado con motivo registrado.

## SLAs de Apelación
- SEV-0/1: respuesta inicial <= 1 h, resolución <= 12 h.
- SEV-2/3: respuesta inicial <= 8 h, resolución <= 48 h.
- Si vence SLA de `SEV-0/1`, escalar automáticamente a `Security Lead` y `CEO`.

## Salidas Esperadas
- Registro completo de evidencia y razonamiento.
- Estado final consistente con policy.
- Feedback capturado para producto/política.
- Etiqueta de cierre (`abuso confirmado`, `falso positivo`, `policy gap`, `fraude coordinado`) para análisis mensual.
- Registro de control de acceso (`who-approved-what`) para cada reversión `SEV-0/1`.
