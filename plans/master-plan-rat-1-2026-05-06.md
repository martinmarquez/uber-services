# RAT-1 Plan Maestro - Uber de Servicios Argentina

Fecha: 2026-05-06  
Owner: CEO (RAT-1)

## 1) North Star y tesis

North Star: lograr que contratar un servicio confiable en Argentina sea tan simple como pedir un viaje, maximizando confianza, velocidad y repeticion.

Metricas guia (12 meses):
- `successful_booking_rate`
- `time_to_first_booking`
- `% bookings con review verificada`
- `fraud_incidence_per_1k_reviews`
- `appeal_sla_met_rate`
- `customer_30d_retention` y `provider_30d_retention`

## 2) Estrategia por etapas

Etapa 0 - Fundaciones de confianza (actual)
- Product brief, policy baseline, arquitectura de rating/reviews, QA reproducible.
- Resultado esperado: sistema de reputacion auditable y operable.

Etapa 1 - Marketplace MVP transaccional
- Discovery + perfil de prestadores + contratacion simple + pago local baseline.
- Resultado esperado: ciclo completo buscar -> contratar -> pagar -> reseñar.

Etapa 2 - Escala operativa y crecimiento
- Experimentacion de friccion/churn, observabilidad CS, runbooks diarios.
- Resultado esperado: crecimiento controlado sin degradar confianza.

Etapa 3 - Pagos flexibles + cripto/blockchain con valor real
- Solo despues de PMF parcial y controles antifraude maduros.
- Resultado esperado: nuevos rails de pago y reputacion portable sin comprometer UX.

## 3) Roadmap 6 meses (macro)

Mes 1-2
- Cerrar linea Trust Core: RAT-9, RAT-10, RAT-13, RAT-19, RAT-20, RAT-22, RAT-23, RAT-24, RAT-25, RAT-26, RAT-28, RAT-29, RAT-32, RAT-34, RAT-35, RAT-37, RAT-39, RAT-42, RAT-44, RAT-45, RAT-46.
- Gate de salida: score estable, policy consistente, QA reproducible, monitoreo activo.

Mes 3-4
- Construir Marketplace Core:
- Catalogo y discovery por categoria/zona.
- Perfil de prestador con reputacion explicable.
- Flujo de contratacion end-to-end y tracking de estado de servicio.
- Pagos baseline AR (tarjetas/transferencias/efectivo digital), ledger y conciliacion.

Mes 5-6
- Escalar Growth + Ops:
- Referidos, CRM lifecycle, soporte y resolucion automatizada asistida por IA.
- Optimizar economics por ciudad/categoria.
- Preparar piloto de pagos flexibles (cuotas/escrow parcial) con limites de riesgo.

## 4) Workstreams y ownership

1. Trust & Safety
- Objetivo: reputacion confiable y antifraude antes de escalar demanda.
- Issues activos: RAT-9, RAT-10, RAT-19, RAT-32, RAT-42, RAT-44, RAT-45, RAT-46.

2. Reviews, Ranking & Experimentacion
- Objetivo: aumentar senal util minimizando manipulacion y friccion.
- Issues activos: RAT-13, RAT-17, RAT-20, RAT-21, RAT-22, RAT-23, RAT-24, RAT-25, RAT-26, RAT-28, RAT-29, RAT-34, RAT-35, RAT-37, RAT-38, RAT-39, RAT-40, RAT-41.

3. Marketplace Core (nuevo bloque a crear)
- Objetivo: habilitar flujo de negocio completo del servicio.
- Nuevos issues a crear:
- `MKT-01` Domain model de servicio, orden, estado y disputas.
- `MKT-02` Search y matching local (categoria, radio, disponibilidad).
- `MKT-03` Provider profile v1 + verificacion de identidad/comercio.
- `MKT-04` Booking flow v1 cliente/prestador.
- `MKT-05` Notificaciones transaccionales y timeline de orden.

4. Payments & Fintech (nuevo bloque a crear)
- Objetivo: cobrar/pagar sin friccion, con seguridad y compliance local.
- Nuevos issues a crear:
- `PAY-01` Decision ADR de stack de pagos Argentina y antifraude.
- `PAY-02` Checkout v1 + estado de pago + reintentos.
- `PAY-03` Ledger y conciliacion operativa.
- `PAY-04` Refunds/disputas + SLA de soporte.
- `PAY-05` Flex payments piloto (cuotas/adelantos) con risk guardrails.

5. AI, Data & Automation (nuevo bloque a crear)
- Objetivo: usar IA donde mejore conversion, calidad o costo operativo.
- Nuevos issues a crear:
- `AI-01` Copilot de descripcion de necesidad para cliente (intake guiado).
- `AI-02` Asistente de respuesta para prestadores (SLA-first).
- `AI-03` Moderation assist para colas de riesgo medio.
- `AI-04` Forecasting de demanda por zona/categoria.

6. Crypto/Blockchain (exploracion gated, no core hoy)
- Objetivo: evaluar valor real, no hype.
- Nuevos issues a crear:
- `CRY-01` Marco de decision (problema real, riesgo, compliance, UX).
- `CRY-02` Piloto reputacion portable verificable (off-chain first + hash anchoring).
- `CRY-03` Piloto settlement limitado en stablecoin para casos B2B seleccionados.

## 5) Dependencias y gates

Gates obligatorios antes de escalar:
- Gate A Trust: fraude bajo control + policy estable + apelaciones en SLA.
- Gate B Product: conversion de flujo de contratacion dentro de objetivo.
- Gate C Payments: conciliacion diaria y tasa de fallo de pago dentro de objetivo.
- Gate D Economics: unit economics por vertical no negativos en cohortes objetivo.

Regla: crypto/blockchain solo se habilita tras cumplir A+B+C en al menos 2 verticales.

## 6) Estructura de issues de ejecucion recomendada

- Epic A: Trust Platform
- Epic B: Marketplace Core
- Epic C: Payments Platform
- Epic D: AI & Automation
- Epic E: Growth & Operations
- Epic F: Crypto/Blockchain Exploration

Cada issue nuevo debe incluir:
- problema, alcance/no-alcance, dependencias, metricas de exito, riesgos, criterios de aceptacion y plan de rollout.

## 7) Siguiente accion CEO (siguiente heartbeat)

1. Crear en Paperclip los epics B/C/D/F y sus subtareas iniciales (`MKT-*`, `PAY-*`, `AI-*`, `CRY-*`).
2. Vincular dependencias con el bloque Trust ya activo para no romper gates.
3. Pedir confirmacion de board solo para decisiones irreversibles de stack de pagos/compliance.
