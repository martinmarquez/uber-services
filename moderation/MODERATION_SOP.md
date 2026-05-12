# Moderación Operativa (SOP)

## Objetivo
Crear una operación humana de moderación para reportes y apelaciones que priorice seguridad, consistencia y velocidad, minimizando fricción para usuarios legítimos.

## Alcance
- Reportes de reseñas y contenido asociado.
- Apelaciones de decisiones de moderación.
- Escalamientos de incidentes críticos.

## Principios Operativos
- Seguridad primero en incidentes de daño o fraude.
- Consistencia de criterio con evidencia verificable.
- Trazabilidad total de cada decisión.
- Comunicación clara y accionable al usuario.
- Contención primero, reversibilidad después: ante duda razonable en `SEV-0/1`, priorizar medidas temporales que limiten daño.

## Taxonomía de Severidad
- `SEV-0 Crítica`: amenaza inmediata, doxxing, extorsión, violencia explícita, fraude coordinado activo.
- `SEV-1 Alta`: acoso grave, discriminación, suplantación, manipulación sistemática de reputación.
- `SEV-2 Media`: insultos, lenguaje ofensivo, spam recurrente, contenido engañoso no masivo.
- `SEV-3 Baja`: conflictos de opinión, reportes sin evidencia, disputas de tono.

## Triggers de Escalamiento Automático (Detección de abuso/fraude)
Escalar automáticamente a Security como `SEV-0` cuando ocurra cualquiera de estos criterios:
- >= 5 cuentas relacionadas reportadas en <= 30 min por patrón compartido (IP, dispositivo, método de pago o texto casi idéntico).
- >= 3 cuentas creadas en <= 24 h con actividad de reseñas altamente correlacionada sobre el mismo comercio.
- Señal confirmada de coerción/extorsión o solicitud de pago a cambio de remover contenido.
- Evidencia de takeover/suplantación sobre cuenta con historial legítimo.

Escalar como `SEV-1` cuando:
- Exista manipulación de reputación recurrente sin coordinación masiva probada.
- Haya abuso reiterado de apelaciones para demorar enforcement.

## Matriz SLA
| Tipo | Severidad | Primera respuesta | Resolución objetivo | Escalación automática |
|---|---|---:|---:|---|
| Reporte nuevo | SEV-0 | 15 min | 2 h | Sí, a Security + CEO |
| Reporte nuevo | SEV-1 | 1 h | 8 h | Sí, a Security |
| Reporte nuevo | SEV-2 | 4 h | 24 h | No |
| Reporte nuevo | SEV-3 | 8 h | 48 h | No |
| Apelación | SEV-0/1 | 1 h | 12 h | Sí, a PM + Security |
| Apelación | SEV-2/3 | 8 h | 48 h | No |

## Flujo de Reportes
1. Ingesta del reporte con ID único y timestamp.
2. Validación mínima de evidencia (captura, enlace, contexto).
3. Clasificación de severidad por operador de primera línea.
4. Acción inicial: retirar, limitar visibilidad o mantener.
5. Notificación al usuario reportante y al usuario afectado.
6. QA de decisiones en muestra diaria (10% SEV-2/3, 100% SEV-0/1).

## Criterios de Decisión
- `Remover` cuando hay violación clara y evidencia suficiente.
- `Limitar` cuando hay daño probable pero evidencia parcial.
- `Mantener` cuando no hay violación o falta evidencia.
- `Solicitar más evidencia` cuando el caso es ambiguo.

## Mapeo Policy -> Acción Operativa -> Estado Visible
Para mantener consistencia con la policy pública de reseñas:

| Hallazgo operativo | Acción interna | Estado visible en producto | Impacto en score |
|---|---|---|---|
| Transacción confirmada + sin señales de riesgo | Mantener | `Reseña verificada` | Normal |
| Señales de riesgo con evidencia parcial (spam, incentivo sesgado, identidad dudosa) | Limitar temporalmente | `En revisión` | Peso reducido temporal |
| Violación confirmada o baja confiabilidad alta | Remover o limitar permanente | `No recomendada` o removida | No pondera |

Regla adicional:
- Incentivos solo son válidos si son neutrales (no condicionados a nota). Si el incentivo depende de nota positiva, clasificar mínimo `SEV-1` por manipulación de reputación.

## Contención de Fraude Coordinado
Cuando un caso entra en `SEV-0` por coordinación:
1. Abrir `incident_id` único y congelar cambios no esenciales del caso.
2. Aplicar contención temporal en cuentas relacionadas (`read-only` o limitación de publicación) por hasta 24 h renovables con aprobación Security.
3. Preservar evidencia forense (logs, snapshots, vínculos de cuentas) por 180 días mínimo.
4. Ejecutar revisión de blast radius (contenido afectado, comercios impactados, exposición reputacional).
5. Definir owner y ETA de remediación en <= 60 min desde detección.
6. Registrar `rollback_plan` antes de ampliar contención (criterio de salida, owner y ventana máxima de impacto aceptable).

## Controles Anti-Abuso del Playbook
- Regla de doble control (`4-eyes`) para sanciones permanentes de cuentas de alto impacto o reversión de `SEV-0/1`.
- Ningún operador puede cerrar un incidente que abrió si además tomó acción punitiva principal.
- Toda excepción de policy debe incluir `exception_reason`, aprobador y vencimiento.
- Bitácora inmutable de decisiones críticas con diffs de estado y actor responsable.
- Toda acción de moderación `SEV-0/1` requiere sesión autenticada fuerte (SSO + MFA) y firma de acción (`actor_id`, `session_id`, `request_id`).
- Acceso a evidencia sensible bajo mínimo privilegio con expiración automática (JIT <= 8 h) y justificación obligatoria.
- Renovaciones de contención >24 h requieren segunda aprobación Security independiente del aprobador inicial.
- Activar `kill-switch` manual para pausar enforcement automático si se detecta falso positivo masivo o abuso del pipeline.

## Escalamiento
- Seguridad: todos los SEV-0 y cualquier patrón de abuso coordinado.
- PM: conflictos de política o zonas grises repetidas.
- CEO: riesgo de churn de cuenta clave, impacto reputacional alto o conflicto legal.

## QA y Gobernanza
- Revisión semanal de consistencia entre operadores.
- Calibración quincenal de criterios con casos reales anonimizados.
- Registro de desvíos y actualización de plantillas.
- Postmortem obligatorio para todo `SEV-0` en <= 5 días hábiles.

## Métricas
- SLA cumplimiento por severidad.
- Tasa de apelaciones por tipo de decisión.
- Tasa de reversión post-apelación.
- Tiempo promedio a resolución.
- Incidentes escalados a CEO por semana.
- `% de decisiones alineadas con estado visible esperado` (QA de consistencia policy-playbook).
- `% de incidentes SEV-0 con owner+ETA definidos en <= 60 min`.
- `% de decisiones críticas con doble control aplicado`.
