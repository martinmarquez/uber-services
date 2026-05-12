# RAT-44 PM/Policy: Scope Freeze + Review Taxonomy v1

Fecha: 2026-05-06  
Owner: CTO
Estado: Aprobado para ejecución MVP

## Objetivo
Congelar alcance MVP del sistema de reseñas y fijar taxonomía operativa v1 para evitar deriva entre PM, Policy, Backend, Frontend, Ops y Soporte.

## Scope Freeze MVP (v1)
Incluido en MVP:
- Elegibilidad estricta: solo servicios completados y verificados.
- Ventana de reseña: 14 días post-servicio.
- Estados visibles de reseña: `verificada`, `en_revision`, `no_recomendada`, `removida`.
- Doble ciego de publicación (dual submit o timeout).
- Canal de apelación mínimo con trazabilidad de estado.
- Aislamiento de score: reseñas `en_revision` y `no_recomendada` no impactan score público.

Excluido de MVP (post-MVP):
- Modelo automático avanzado de `recommended vs not recommended` tipo Yelp.
- Subratings por dimensión.
- Multimedia en reseñas.
- Incentivos complejos segmentados por comportamiento.

## Taxonomía de revisión v1

### 1) Taxonomía de estados (visible al usuario)
- `verificada`: experiencia confirmada y apta para score.
- `en_revision`: señales de riesgo o reporte activo; no impacta score.
- `no_recomendada`: baja confiabilidad confirmada por policy/operación; no impacta score.
- `removida`: contenido no visible públicamente por violación de policy.

### 2) Taxonomía de motivos (reason codes)
- `identity_mismatch`
- `incentive_bias`
- `coordinated_manipulation`
- `spam_or_duplicate`
- `abusive_content`
- `privacy_violation`
- `off_platform_extortion`
- `other_policy_violation`

Regla: toda decisión operativa debe incluir al menos 1 `reason_code` y severidad.

### 3) Taxonomía de severidad
- `SEV-0`: riesgo sistémico o ataque coordinado activo. Respuesta inmediata, freeze de score si aplica.
- `SEV-1`: manipulación material o incentivos sesgados confirmados.
- `SEV-2`: incumplimiento moderado con bajo impacto sistémico.
- `SEV-3`: calidad baja/no concluyente sin evidencia de manipulación.

### 4) Taxonomía de apelaciones
- `apelacion_recibida`
- `apelacion_en_analisis`
- `apelacion_resuelta_confirmada`
- `apelacion_resuelta_modificada`
- `apelacion_resuelta_revertida`

Regla: cada apelación debe mapear explícitamente a estado visible final de reseña.

## Reglas de enforcement v1
- `SEV-0/SEV-1` con `incentive_bias` o `coordinated_manipulation`: mínimo `no_recomendada`; evaluar `removida` según evidencia.
- `en_revision` tiene SLA operativo máximo 72h para primera resolución.
- Si no hay evidencia concluyente al SLA, decisión por defecto: mantener fuera de score hasta resolución final documentada.

## Criterio de aceptación para ejecución
- Backend publica contrato de enums y transiciones de estado consistente con este documento.
- Frontend muestra estados y copy sin ambigüedad.
- SOP/plantillas de moderación usan los mismos `reason_code`.
- QA valida consistencia policy-playbook con casos `SEV-0..SEV-3`.

## Formato de evidencia de aceptación (obligatorio)
Cada entrega vinculada a esta policy debe adjuntar evidencia en este formato:
- `artifact_id`: identificador único del paquete de evidencia.
- `review_round`: `round_1` o `round_2`.
- `checkpoint`: `pm`, `ceo`, `qa`.
- `status`: `approved` o `changes_requested`.
- `findings`: lista corta de hallazgos con severidad (`security-high`, `security-medium`, `quality`, `copy`, `policy`).
- `decision`: resumen de decisión y condición de cierre.
- `links`: rutas a documentos, issue comments y/o commits.
- `timestamp_utc`: fecha/hora en UTC.

Regla de cierre:
- Ningún issue de implementación asociado puede cerrarse sin evidencia de `round_1` y `round_2`.
- En cada ronda deben existir checkpoints `pm`, `ceo` y `qa`.
- Si existe `security-high` abierto, cierre bloqueado hasta remediación documentada.

## Rondas de revisión requeridas
### Round 1 (alineación de contrato)
- Objetivo: validar alcance congelado, taxonomía y trazabilidad mínima.
- Salida mínima: ajustes de contrato y lista de cambios obligatorios.

### Round 2 (go/no-go operativo)
- Objetivo: validar consistencia final entre API/UI/SOP/QA con evidencia completa.
- Salida mínima: aprobación explícita de PM, CEO y QA o devolución con cambios.

## Checkpoints PM/CEO/QA
- `pm`: coherencia de alcance, copy, UX y no-deriva de scope.
- `ceo`: alineación estratégica y riesgo reputacional/comercial.
- `qa`: cobertura de pruebas, consistencia estado->impacto score, y reproducibilidad de decisiones.

## Referencias
- `docs/rat-35-review-round-1-pm-ux.md`
- `docs/review-trust-policy-draft-es.md`
- `docs/reviews/rat-32-policy-consistency-review.md`
- `$AGENT_HOME/ADR.md`
