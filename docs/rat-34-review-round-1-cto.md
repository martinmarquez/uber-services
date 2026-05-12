# RAT-34 — CTO Review Round 1

Fecha: 2026-05-06
Documento revisado: `docs/research/rat-4-rating-benchmark-ar.md`

## Veredicto ejecutivo
Factible para MVP, pero el documento subestima costo técnico real y superficie de fraude operativo. Requiere hardening mínimo antes de shipping para evitar manipulación reputacional en lanzamiento.

## 1) Costos técnicos reales: MVP vs Post-MVP

### Ajustes de costo MVP (corrección)
- `#17 Detección de patrones anómalos (burst/rings)`: de **Alto Post-MVP** a **Medio-Alto MVP-lite**.
Motivo: sin heurísticas mínimas de burst/device/IP/payment-link, el score público se vuelve explotable desde semana 1.
- `#19 Only verified transaction can review`: mantener en MVP pero incluir verificación de cadena de transacción y antifraude de cuenta. Costo real: **Medio-Alto**, no solo Medio.
- `#30 Runbook de crisis`: parte del runbook debe existir en MVP (procedimiento review bombing, freeze de score y rollback de agregados). Costo inicial: **Medio**.
- Nuevo costo MVP omitido: **pipeline de cuarentena** (`pending_trust/quarantined`) + recomputación de score excluyendo señales sospechosas.

### Post-MVP (se mantiene)
- Modelo “recommended vs not recommended” totalmente algorítmico y explicabilidad avanzada.
- Detección de anillos con grafo enriquecido y señales cross-domain.
- Fairness monitoring por cohortes y geografía con guardrails automatizados.

## 2) Riesgos de abuso/fraude no cubiertos
- Farm de cuentas + SIM rotativa para inflar reputación de prestadores nuevos.
- Colusión cliente-prestador con transacciones de bajo monto para habilitar reseñas falsas “verificadas”.
- Ataques de `review bombing` coordinados por competidores locales por zona/rubro.
- Secuestro de cuentas con reputación alta para manipular score y luego monetizar.
- Abuso de apelaciones como canal de denegación operativa (flooding contra moderación).

## 3) Propuestas de hardening (acción para Iteración 2)
1. Implementar `Trust Gate v1` en MVP:
- Heurísticas de riesgo por cuenta/dispositivo/IP/método de pago.
- Reseñas de alto riesgo van a cuarentena y no afectan score público.

2. Separar estado de publicación de estado de impacto en score:
- Una reseña puede estar visible bajo etiqueta de revisión, pero excluida temporalmente del agregado.

3. Score robusto con guardrails:
- Bayesian smoothing + min-N confidence + cap de impacto por ventana temporal.
- Freeze automático ante anomalías de volumen en ventanas cortas.

4. Moderación anti-abuso por severidad:
- Cola priorizada P0/P1/P2 y SLA operativo (4h/24h/72h).
- Límite de tasa para reportes/apelaciones por actor para evitar flooding.

5. Auditoría y legal defensibility:
- Ledger inmutable de cambios de score/remociones/apelaciones.
- Motivo estructurado obligatorio para cada acción humana o automática.

## Cambios concretos solicitados al documento base
- Reetiquetar costo/alcance de #17, #19 y #30 con las correcciones anteriores.
- Agregar sección nueva: `MVP Trust Gate v1` con criterios de cuarentena.
- Agregar tabla de `fraude no cubierto -> señal -> mitigación MVP -> owner`.
- Agregar NFR mínimos: latencia de publicación, trazabilidad, recomputación idempotente de score.

## Go/No-Go para Iteración 2
Go condicional si Iteración 2 incorpora Trust Gate v1, separación publicación-impacto score y runbook operativo mínimo.
