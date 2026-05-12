# RAT-35 — Review Round 1 (PM+UX): claridad de producto y experiencia

Fecha: 2026-05-06  
Fuente evaluada: `docs/research/rat-4-rating-benchmark-ar.md` (Iteración 1)

## Decisión de ronda

Estado: **PASS CON CAMBIOS OBLIGATORIOS (pre-implementación)**

La dirección de producto es sólida para MVP, pero faltan definiciones de UX y producto que hoy abren riesgo de interpretación inconsistente en ingeniería, soporte y GTM.

## Hallazgos críticos (P0/P1)

1. **P0 — Falta contrato visible de estados de reseña para usuario final**  
`RAT-4` define lógica de moderación/confianza, pero no define copy final, transiciones ni comportamiento por estado (`verificada`, `en revisión`, `no recomendada`, `removida`).  
Impacto: tickets por confusión, percepción de arbitrariedad, riesgo de churn en prestadores.

2. **P0 — Ambigüedad en “anonimato” de feedback en bajas calificaciones**  
No queda explícito qué campos ve cada parte ni qué se agrega/oculta en cada canal (interno, prestador, público).  
Impacto: riesgo de privacidad y desalineación legal/UX.

3. **P1 — Criterios de “no recomendada” aún sin umbrales operables**  
Se prioriza para Post-MVP (correcto), pero no hay regla temporal de fallback para MVP cuando haya sospecha de fraude sin modelo avanzado.  
Impacto: decisiones ad-hoc de moderación y conflictos de soporte.

4. **P1 — Falta especificación de experiencia de apelación mínima MVP**  
Existe requerimiento de canal de apelación, pero no SLA de UX transaccional (confirmación, tracking estado, cierre con motivo).  
Impacto: baja confianza y recontacto repetitivo.

## Decisiones de producto para destrabar ingeniería

1. **Contrato de estados MVP (obligatorio):**
   - `Verificada`: impacta score.
   - `En revisión`: no impacta score hasta resolución.
   - `No recomendada` (solo por policy/manual en MVP): no impacta score y muestra motivo de alto nivel.
   - `Removida`: no visible públicamente; trazabilidad interna completa.

2. **Regla de anonimato MVP (obligatorio):**
   - Prestador ve rating agregado y tags agregados.
   - Texto libre del cliente no se expone literal por defecto cuando rating <= 3 hasta revisión policy.
   - Equipo interno sí accede al contenido completo para moderación/auditoría.

3. **Fallback anti-fraude MVP (obligatorio, sin algoritmo opaco):**
   - Señales manuales iniciales: cuenta recién creada + burst de reseñas + patrón textual duplicado.
   - Acción: estado `En revisión` + cola priorizada T&S + SLA 72h.

4. **Flujo de apelación MVP (obligatorio):**
   - Confirmación inmediata de recepción.
   - Estado trazable (`recibida`, `en análisis`, `resuelta`).
   - Resolución con motivo predefinido y fecha/hora.

## User stories y criterios de aceptación (listos para sprint)

### US-35.1 — Estados de reseña claros
Como usuario, quiero entender el estado de mi reseña para saber si ya impacta el perfil del servicio.

**Aceptación**
- Dado que una reseña entra a moderación, cuando el usuario abre detalle, entonces ve `En revisión` + explicación breve.
- Dado que una reseña fue validada, cuando se publica, entonces cambia a `Verificada` e impacta score.
- Dado que una reseña no es recomendada/removida, cuando se notifica al autor, entonces recibe motivo de alto nivel y acceso a apelación.

### US-35.2 — Protección de identidad en feedback sensible
Como cliente, quiero poder dejar feedback negativo sin exposición innecesaria.

**Aceptación**
- Dado rating <= 3, cuando hay texto libre, entonces no se expone literal al prestador en MVP por defecto.
- Dado rating <= 3, cuando el prestador consulta su panel, entonces ve tags y señal agregada, no PII.
- Dado un caso auditado, cuando T&S revisa, entonces accede al contenido completo con trazabilidad.

### US-35.3 — Apelación con trazabilidad
Como prestador, quiero apelar una decisión de reseña y seguir su estado.

**Aceptación**
- Dado que envío apelación, cuando finaliza el envío, entonces recibo confirmación y número de caso.
- Dado que el caso avanza, cuando consulto estado, entonces veo fase y SLA objetivo.
- Dado que se resuelve, cuando recibo respuesta, entonces incluye decisión y motivo estructurado.

## Scope gate (anti scope creep)

No entra en MVP de esta ronda:
- Modelo automático `recommended vs not recommended` estilo Yelp.
- Decaimiento temporal de score.
- Subratings por dimensión.
- Multimedia en reseñas.

## Dependencias para Sprint Planning

1. UX writing: microcopy final de estados y apelación.
2. Trust & Safety: taxonomía de motivos y macros de resolución.
3. Data/Analytics: eventos para `review_status_viewed`, `appeal_submitted`, `appeal_resolved`.
4. Legal/Privacy: validación final de exposición de texto y retención.

## Criterio de cierre de RAT-35

- [x] Hallazgos PM+UX documentados con severidad.
- [x] Decisiones MVP traducidas a stories y aceptación.
- [x] Scope gate explícito para evitar creep.
- [x] Dependencias identificadas para secuenciación de sprint.
