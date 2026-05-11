import React, { useEffect, useMemo, useRef, useState } from "react";
import "./MobileReviewFlow.css";
import {
  normalizeModerationStatus,
  REVIEW_MODERATION_STATUS,
  deriveModerationStatus,
  isLowConfidenceReview,
  statusBadgeFromContract,
} from "../reviewModerationContract";
import {
  getOrCreateReviewExperimentAssignment,
  trackCommentStarted,
  trackReviewConversion,
  trackReportSubmitted,
  trackRespondSubmitted,
  trackStarSelected,
  trackTagToggled,
} from "../analytics/reviewExperimentTracking";
import {
  createReview,
  fetchReviews,
  reportReview,
  respondToReview,
} from "../api/reviewsApi";
import {
  createServiceRequest,
  discoverProviders,
} from "../api/discoveryBookingApi";

const TAGS_BY_RATING = {
  low: ["Servicio inseguro", "Impuntual", "Calidad baja", "Comunicación mala"],
  mid: ["Aceptable", "Llegó a tiempo", "Podría mejorar", "Trato correcto"],
  high: ["Excelente", "Muy profesional", "Rápido", "Recomendado"],
};

const MOCK_REVIEWS = [
  {
    id: "rev-1001",
    author: "Sofía M.",
    provider: "Plomería Norte",
    rating: 5,
    verified: true,
    service: "Reparación de cañería",
    createdAt: "Hace 2 días",
    riskScore: 21,
    status: REVIEW_MODERATION_STATUS.VERIFIED,
    tags: ["Excelente", "Muy profesional"],
    comment: "Llegaron en 20 minutos y dejaron todo limpio.",
    providerResponse: "Gracias Sofía, quedamos atentos para cualquier ajuste.",
  },
  {
    id: "rev-1002",
    author: "Tomás R.",
    provider: "Electricidad Sur",
    rating: 3,
    verified: true,
    service: "Cambio de tablero",
    createdAt: "Hace 1 semana",
    riskScore: 90,
    status: REVIEW_MODERATION_STATUS.UNDER_REVIEW,
    tags: ["Podría mejorar"],
    comment: "Resolvió el problema pero llegó tarde.",
    providerResponse: "Perdón por la demora. Mejoramos nuestra logística.",
  },
  {
    id: "rev-1003",
    author: "Carla P.",
    provider: "Limpieza Express",
    rating: 2,
    verified: false,
    service: "Limpieza profunda",
    createdAt: "Ayer",
    riskScore: 78,
    status: REVIEW_MODERATION_STATUS.NOT_RECOMMENDED,
    tags: ["Calidad baja"],
    comment: "No cumplió con lo acordado en la visita.",
    providerResponse: "Queremos revisar tu caso por privado y corregirlo.",
  },
];

const CATEGORY_OPTIONS = [
  { value: "cleaning", label: "Limpieza" },
  { value: "plumbing", label: "Plomeria" },
  { value: "electrician", label: "Electricidad" },
  { value: "moving", label: "Mudanza" },
  { value: "mechanic", label: "Mecanica" },
];

const FALLBACK_PROVIDERS = [
  {
    id: "fallback-prov-1",
    name: "Plomeria Norte",
    category: "Plomeria",
    zone: "Buenos Aires",
    eta: "A 1.5 km",
    rating: 4.7,
    jobs: 96,
    verified: true,
  },
  {
    id: "fallback-prov-2",
    name: "Limpieza Express",
    category: "Limpieza",
    zone: "Buenos Aires",
    eta: "A 2.1 km",
    rating: 4.6,
    jobs: 142,
    verified: true,
  },
];

function humanizeCategory(category) {
  const match = CATEGORY_OPTIONS.find((item) => item.value === category);
  return match?.label ?? category;
}

function formatDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;
  const isoCandidate = new Date(`${dateValue}T${timeValue}:00`);
  if (Number.isNaN(isoCandidate.getTime())) return null;
  return isoCandidate.toISOString();
}

function tagsForRating(rating) {
  if (rating <= 2) return TAGS_BY_RATING.low;
  if (rating === 3) return TAGS_BY_RATING.mid;
  return TAGS_BY_RATING.high;
}

function formatRelativeDate(value) {
  if (!value) return "Reciente";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 36e5) return "Hace menos de 1 hora";
  if (diffMs < 864e5) return `Hace ${Math.max(1, Math.floor(diffMs / 36e5))} horas`;
  return `Hace ${Math.max(1, Math.floor(diffMs / 864e5))} días`;
}

function normalizeReviewForUi(review, selectedProvider) {
  const riskScore = Number(review?.riskScore);
  const safeRiskScore = Number.isFinite(riskScore) ? Math.max(0, Math.min(100, Math.round(riskScore))) : 0;
  const safeStatus = normalizeModerationStatus(review?.status) ?? deriveModerationStatus({ riskScore: safeRiskScore });
  return {
    id: review?.id ?? `rev-${Math.random().toString(36).slice(2, 10)}`,
    author: review?.author ?? "Cliente",
    provider: review?.provider ?? selectedProvider?.name ?? review?.providerUserId ?? "Prestador",
    rating: Number.isFinite(Number(review?.rating)) ? Math.max(1, Math.min(5, Math.round(Number(review.rating)))) : 5,
    verified: review?.verified !== false,
    service: review?.service ?? "Servicio contratado",
    createdAt: review?.createdAt && review.createdAt.includes("T") ? formatRelativeDate(review.createdAt) : (review?.createdAt ?? "Reciente"),
    riskScore: safeRiskScore,
    status: safeStatus,
    tags: Array.isArray(review?.tags) ? review.tags : [],
    comment: review?.comment ?? "",
    providerResponse: review?.providerResponse ?? "Sin respuesta aún.",
  };
}

function StarRow({ value, onToggle, onKeyDown }) {
  return (
    <div className="stars" role="radiogroup" aria-label="Calificación" aria-describedby="rating-instructions">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            className={`star-button ${active ? "active" : ""}`}
            onClick={() => onToggle(star)}
            onKeyDown={(event) => onKeyDown(event, star)}
            aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            role="radio"
            aria-checked={value === star}
            tabIndex={value === 0 ? (star === 1 ? 0 : -1) : value === star ? 0 : -1}
          >
            <span aria-hidden="true">★</span>
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ review, onReport, onRespond }) {
  const moderation = statusBadgeFromContract(review.status);
  const lowConfidence = isLowConfidenceReview(review);

  return (
    <article className="review-card" aria-labelledby={`review-${review.id}`}>
      <header className="review-card-head">
        <div>
          <h3 id={`review-${review.id}`}>{review.provider}</h3>
          <p className="meta-row">
            <span>{review.service}</span>
            <span aria-hidden="true">•</span>
            <span>{review.createdAt}</span>
          </p>
        </div>
        <div className="review-actions">
          <button
            type="button"
            className="action-link"
            onClick={(event) => onRespond(review, event.currentTarget)}
            aria-label={`Responder actualización de ${review.provider}`}
          >
            Responder
          </button>
          <button
            type="button"
            className="action-link"
            onClick={(event) => onReport(review, event.currentTarget)}
            aria-label={`Reportar reseña de ${review.provider}`}
          >
            Reportar
          </button>
        </div>
      </header>

      <div className="rating-row" aria-label={`Calificación ${review.rating} de 5`}>
        <span className="stars-inline" aria-hidden="true">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
        <span className={`status-pill ${moderation.tone}`}>{moderation.label}</span>
        {review.verified ? <span className="trust-pill">Compra verificada</span> : <span className="trust-pill soft">Sin verificación</span>}
        {lowConfidence ? <span className="trust-pill soft">Sin impacto en score público</span> : null}
      </div>

      <p className="review-comment">{review.comment}</p>

      <ul className="tag-list" aria-label="Etiquetas de reseña">
        {review.tags.map((tag) => (
          <li key={tag} className="tag-chip static">
            {tag}
          </li>
        ))}
      </ul>

      <section className="provider-response" aria-label="Respuesta del prestador">
        <p className="provider-response-title">Respuesta del prestador</p>
        <p>{review.providerResponse}</p>
      </section>
    </article>
  );
}

function ReportModal({ review, onClose, onSubmit, returnFocusEl }) {
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const dialogRef = useRef(null);
  const reasonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!review) return undefined;
    previousFocusRef.current = returnFocusEl ?? document.activeElement;
    reasonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement;

        if (event.shiftKey && current === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [review, onClose, returnFocusEl]);

  if (!review) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="report-title">Reportar reseña</h2>
        <p className="helper-text">{review.provider} • {review.service}</p>

        <label htmlFor="report-reason">Motivo</label>
        <select id="report-reason" ref={reasonRef} value={reason} onChange={(event) => setReason(event.target.value)}>
          <option value="spam">Spam o fraude</option>
          <option value="abuse">Contenido ofensivo</option>
          <option value="personal">Datos personales</option>
          <option value="other">Otro</option>
        </select>

        <label htmlFor="report-details">Detalle (opcional)</label>
        <textarea
          id="report-details"
          value={details}
          maxLength={200}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Contanos brevemente qué detectaste"
        />

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="submit-button" onClick={() => onSubmit({ reviewId: review.id, reason, details })}>
            Enviar reporte
          </button>
        </div>
      </div>
    </div>
  );
}

function RespondModal({ review, onClose, onSubmit, returnFocusEl }) {
  const [message, setMessage] = useState("");
  const dialogRef = useRef(null);
  const messageRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!review) return undefined;
    previousFocusRef.current = returnFocusEl ?? document.activeElement;
    messageRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement;

        if (event.shiftKey && current === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [review, onClose, returnFocusEl]);

  if (!review) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="respond-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="respond-title">Responder al prestador</h2>
        <p className="helper-text">{review.provider} • {review.service}</p>

        <label htmlFor="respond-message">Tu respuesta (visible en la reseña)</label>
        <textarea
          id="respond-message"
          ref={messageRef}
          value={message}
          maxLength={180}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ejemplo: Gracias por la respuesta, ¿podemos coordinar un ajuste?"
        />

        <span className="char-count" aria-live="polite">
          {message.length}/180
        </span>

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="submit-button" onClick={() => onSubmit({ reviewId: review.id, message })} disabled={!message.trim()}>
            Enviar respuesta
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MobileReviewFlow() {
  const [selectedCategory, setSelectedCategory] = useState("cleaning");
  const [selectedCity, setSelectedCity] = useState("Buenos Aires");
  const [providers, setProviders] = useState([]);
  const [providerState, setProviderState] = useState("loading");
  const [providerError, setProviderError] = useState("");

  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [serviceNeed, setServiceNeed] = useState("");
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingState, setBookingState] = useState("idle");
  const [bookingError, setBookingError] = useState("");
  const [activeServiceRequestId, setActiveServiceRequestId] = useState("srv-8241");

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [listState, setListState] = useState("loading");
  const [listWarning, setListWarning] = useState("");
  const [filter, setFilter] = useState("all");
  const [reloadNonce, setReloadNonce] = useState(0);
  const [activeReport, setActiveReport] = useState(null);
  const [activeRespond, setActiveRespond] = useState(null);
  const [modalInvoker, setModalInvoker] = useState(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [experimentAssignment, setExperimentAssignment] = useState(null);
  const [didTrackCommentStart, setDidTrackCommentStart] = useState(false);

  const currentTags = useMemo(() => tagsForRating(rating), [rating]);
  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === selectedProviderId) ?? providers[0] ?? null,
    [providers, selectedProviderId],
  );
  const canBook = providerState === "ready" && Boolean(selectedProvider?.id);
  const canReview = Boolean(activeServiceRequestId && selectedProvider?.id);

  const filteredReviews = useMemo(() => {
    if (filter === "all") return reviews;
    if (filter === "positive") return reviews.filter((item) => item.rating >= 4);
    if (filter === "critical") return reviews.filter((item) => item.rating <= 2);
    return reviews.filter((item) => item.status !== REVIEW_MODERATION_STATUS.VERIFIED);
  }, [filter, reviews]);

  useEffect(() => {
    let isMounted = true;
    async function loadProviders() {
      setProviderState("loading");
      setProviderError("");
      try {
      const response = await discoverProviders({
          category: selectedCategory,
          city: selectedCity,
          sort: "rating_desc",
          limit: 6,
        });
        if (!isMounted) return;
        const discovered = Array.isArray(response?.providers) ? response.providers : [];
        const normalized = discovered.map((provider) => ({
          id: provider.userId,
          name: provider.displayName || provider.userId,
          category: humanizeCategory(provider.category),
          zone: provider.city,
          eta: `A ${provider.distanceKm ?? "?"} km`,
          rating: provider.rating ?? 0,
          jobs: provider.completedJobs ?? 0,
          verified: Boolean(provider.isActive),
        }));
        setProviders(normalized);
        if (normalized.length && !normalized.some((item) => item.id === selectedProviderId)) {
          setSelectedProviderId(normalized[0].id);
        }
        setProviderState("ready");
      } catch (_error) {
        if (!isMounted) return;
        setProviders(FALLBACK_PROVIDERS);
        setSelectedProviderId((currentId) =>
          FALLBACK_PROVIDERS.some((provider) => provider.id === currentId) ? currentId : FALLBACK_PROVIDERS[0]?.id ?? "",
        );
        setProviderState("ready");
        setProviderError("No pudimos cargar descubrimiento en vivo. Reintentá en unos segundos.");
      }
    }

    loadProviders();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedCity]);

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      setListState("loading");
      setListWarning("");
      if (!selectedProvider?.id) {
        setReviews([]);
        setListState("ready");
        return;
      }
      if (!isMounted) return;
      try {
        const response = await fetchReviews({ providerId: selectedProvider?.id });
        if (!isMounted) return;
        const items = Array.isArray(response?.items) ? response.items : [];
        setReviews(items.map((item) => normalizeReviewForUi(item, selectedProvider)));
        setListState("ready");
      } catch (_error) {
        if (!isMounted) return;
        setReviews(MOCK_REVIEWS);
        setListWarning("Mostramos reseñas recientes en modo respaldo. Reintentar carga en vivo.");
        setListState("ready");
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [filter, reloadNonce, selectedProvider?.id]);

  useEffect(() => {
    const assignment = getOrCreateReviewExperimentAssignment();
    setExperimentAssignment(assignment);
  }, []);

  const helperText =
    rating === 0
      ? "Elegí de 1 a 5 estrellas para continuar."
      : rating <= 2
        ? "Si querés, contanos qué pasó. Tu comentario nos ayuda a mejorar."
        : rating === 3
          ? "¿Qué se podría mejorar?"
          : "¿Qué te gustó más?";

  const trustState = useMemo(() => {
    if (rating === 0) {
      return {
        tone: "neutral",
        title: "Tu reseña fortalece la confianza del marketplace",
        message: "Cuando califiques, te mostramos si se publica de inmediato o si requiere revisión.",
      };
    }

    if (rating <= 2) {
      return {
        tone: "caution",
        title: "Se prioriza seguridad y contexto",
        message: "Tu reseña se publica con señal de verificación y puede pasar por moderación para prevenir fraude.",
      };
    }

    if (selectedProvider?.verified) {
      return {
        tone: "verified",
        title: "Compra verificada con impacto completo",
        message: "Esta reseña se vincula al servicio contratado y aporta al perfil público del prestador.",
      };
    }

    return {
        tone: "neutral",
        title: "Impacto parcial hasta verificar servicio",
        message: "La reseña queda visible, pero cuenta menos hasta que se verifique el servicio.",
    };
  }, [rating, selectedProvider?.verified]);

  const handleStarToggle = (value) => {
    const next = rating === value ? 0 : value;
    setRating(next);
    setSelectedTags([]);
    setSubmitted(false);
    setDidTrackCommentStart(false);

    if (experimentAssignment && next > 0) {
      trackStarSelected({
        variant: experimentAssignment.variant,
        subjectId: experimentAssignment.subjectId,
        sessionId: experimentAssignment.sessionId,
        stars: next,
      });
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) => {
      const selected = !prev.includes(tag);
      if (experimentAssignment) {
        trackTagToggled({
          variant: experimentAssignment.variant,
          subjectId: experimentAssignment.subjectId,
          sessionId: experimentAssignment.sessionId,
          tag,
          selected,
        });
      }
      return selected ? [...prev, tag] : prev.filter((item) => item !== tag);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating || !canReview) return;

    setIsSubmitting(true);
    try {
      const payload = {
        serviceRequestId: activeServiceRequestId,
        providerUserId: selectedProvider?.id,
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        idempotencyKey: `review-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      };

      const response = await createReview(payload);
      setSubmitted(true);
      const moderationLabel = statusBadgeFromContract(response?.review?.status ?? REVIEW_MODERATION_STATUS.VERIFIED).label;
      setLiveMessage(`Reseña enviada. Estado actual: ${moderationLabel}.`);
    } catch (_error) {
      setLiveMessage("No pudimos enviar la reseña. Reintentá en unos segundos.");
    } finally {
      setIsSubmitting(false);
    }

    if (experimentAssignment) {
      trackReviewConversion({
        variant: experimentAssignment.variant,
        subjectId: experimentAssignment.subjectId,
        sessionId: experimentAssignment.sessionId,
      });
    }
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    if (!requestedDate || !requestedTime || !canBook) return;

    setBookingState("submitting");
    setBookingError("");
    try {
      const scheduledAt = formatDateTime(requestedDate, requestedTime);
      if (!scheduledAt) {
        setBookingState("error");
        setBookingError("La fecha u hora no tienen formato valido.");
        return;
      }

      const response = await createServiceRequest({
        idempotencyKey: `book-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        providerUserId: selectedProvider?.id,
        category: selectedCategory,
        city: selectedCity,
        notes: serviceNeed.trim() || "Solicitud de servicio desde experiencia MVP.",
        scheduledAt,
      });

      const serviceRequestId = response?.serviceRequest?.id;
      setActiveServiceRequestId(serviceRequestId || "srv-8241");
      setBookingSubmitted(true);
      setBookingState("submitted");
      setLiveMessage("Solicitud de contratación enviada.");
    } catch (_error) {
      setBookingState("error");
      setBookingSubmitted(false);
      setBookingError("No pudimos enviar la solicitud. Reintentá en unos segundos.");
      setLiveMessage("No pudimos enviar la solicitud de contratación.");
    }
  };

  const handleStarKeyDown = (event, value) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setRating(Math.min(5, value + 1));
      setSubmitted(false);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setRating(Math.max(1, value - 1));
      setSubmitted(false);
    }
    if (event.key === "0") {
      event.preventDefault();
      setRating(0);
      setSelectedTags([]);
      setSubmitted(false);
    }
  };

  const handleReportSubmit = async ({ reviewId, reason }) => {
    setActiveReport(null);
    try {
      const reasonCode = reason === "abuse" ? "offensive_content" : reason === "personal" ? "privacy_exposure" : reason === "other" ? "other" : "fraud_signal";
      const response = await reportReview(reviewId, {
        reasonCode,
        description: "Reporte enviado desde experiencia mobile web",
        idempotencyKey: `report-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      });
      const nextRiskScore = response?.riskScore ?? (reason === "spam" ? 88 : 73);
      setReviews((prev) =>
        prev.map((item) =>
          item.id === reviewId
            ? {
                ...item,
                riskScore: nextRiskScore,
                status: response?.status ?? deriveModerationStatus({ riskScore: nextRiskScore }),
              }
            : item,
        ),
      );
      setLiveMessage("Reporte enviado. Lo revisamos y te avisamos por este canal.");
      if (experimentAssignment) {
        trackReportSubmitted({
          variant: experimentAssignment.variant,
          subjectId: experimentAssignment.subjectId,
          sessionId: experimentAssignment.sessionId,
          reasonCode,
        });
      }
    } catch (_error) {
      setLiveMessage("No pudimos enviar el reporte. Reintentá.");
    }
  };

  const handleRespondSubmit = async ({ reviewId, message }) => {
    setActiveRespond(null);
    try {
      const response = await respondToReview(reviewId, {
        message: message.trim(),
        idempotencyKey: `response-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      });
      const nextMessage = response?.providerResponse ?? `${message.trim()}`;
      setReviews((prev) =>
        prev.map((item) =>
          item.id === reviewId
            ? {
                ...item,
                providerResponse: nextMessage,
              }
            : item,
        ),
      );
      setLiveMessage("Respuesta enviada. Ya se ve en la reseña.");
      if (experimentAssignment) {
        trackRespondSubmitted({
          variant: experimentAssignment.variant,
          subjectId: experimentAssignment.subjectId,
          sessionId: experimentAssignment.sessionId,
          length: message.trim().length,
        });
      }
    } catch (_error) {
      setLiveMessage("No pudimos enviar la respuesta. Reintentá.");
    }
  };

  useEffect(() => {
    if (!submitted) return undefined;
    const timer = window.setTimeout(() => setSubmitted(false), 4500);
    return () => window.clearTimeout(timer);
  }, [submitted]);

  return (
    <main className="review-canvas">
      <section className="review-sheet" aria-labelledby="review-title">
        <header className="review-head">
          <p className="ride-id">Servicio #SRV-8241</p>
          <h1 id="review-title">¿Cómo fue tu experiencia?</h1>
          <p className="helper-text">{helperText}</p>
        </header>

        <section className="mvp-block" aria-labelledby="discover-title">
          <div className="section-head">
            <h2 id="discover-title">Descubrí prestadores</h2>
            <p className="helper-text">Elegí una opción con buena reputación y cerca de tu zona.</p>
          </div>
          <div className="booking-grid">
            <label htmlFor="discovery-category">
              Categoria
              <select
                id="discovery-category"
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setBookingSubmitted(false);
                }}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label htmlFor="discovery-city">
              Ciudad
              <input
                id="discovery-city"
                value={selectedCity}
                onChange={(event) => {
                  setSelectedCity(event.target.value);
                  setBookingSubmitted(false);
                }}
                minLength={2}
                required
              />
            </label>
          </div>
          {providerError ? <p className="error-box" role="alert">{providerError}</p> : null}
          {providerState === "loading" ? (
            <div className="skeleton-list" aria-label="Cargando prestadores">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : null}
          {providerState === "ready" && providers.length === 0 ? (
            <p className="helper-text" role="status">No encontramos prestadores para esta búsqueda. Ajustá categoría o ciudad.</p>
          ) : null}
          <div className="provider-grid">
            {providers.map((provider) => {
              const selected = provider.id === selectedProviderId;
              return (
                <button
                  key={provider.id}
                  type="button"
                  className={`provider-card ${selected ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedProviderId(provider.id);
                    setBookingSubmitted(false);
                  }}
                  aria-pressed={selected}
                >
                  <div className="provider-card-head">
                    <h3>{provider.name}</h3>
                    {provider.verified ? <span className="trust-pill">Verificado</span> : <span className="trust-pill soft">En revision</span>}
                  </div>
                  <p className="meta-row">
                    <span>{provider.category}</span>
                    <span aria-hidden="true">•</span>
                    <span>{provider.zone}</span>
                  </p>
                  <p className="meta-row">
                    <span>{provider.rating}★</span>
                    <span aria-hidden="true">•</span>
                    <span>{provider.jobs} trabajos</span>
                  </p>
                  <p className="helper-text">{provider.eta}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mvp-block" aria-labelledby="booking-title">
          <div className="section-head">
            <h2 id="booking-title">Contratación simple</h2>
            <p className="helper-text">Reservá en dos pasos. Si hay un problema, soporte puede ayudarte mejor.</p>
          </div>
          <form className="booking-form" onSubmit={handleBookingSubmit}>
            <p className="meta-row">
              <span>Prestador elegido</span>
              <span aria-hidden="true">•</span>
              <strong>{selectedProvider?.name || "Sin selección"}</strong>
            </p>
            <div className="booking-grid">
              <label htmlFor="booking-date">
                Fecha
                <input
                  id="booking-date"
                  type="date"
                  value={requestedDate}
                  onChange={(event) => {
                    setRequestedDate(event.target.value);
                    setBookingSubmitted(false);
                  }}
                  required
                />
              </label>
              <label htmlFor="booking-time">
                Hora
                <input
                  id="booking-time"
                  type="time"
                  value={requestedTime}
                  onChange={(event) => {
                    setRequestedTime(event.target.value);
                    setBookingSubmitted(false);
                  }}
                  required
                />
              </label>
            </div>
            <label htmlFor="booking-need">
              Necesidad puntual
              <textarea
                id="booking-need"
                value={serviceNeed}
                maxLength={180}
                onChange={(event) => {
                  setServiceNeed(event.target.value);
                  setBookingSubmitted(false);
                }}
                placeholder="Ejemplo: perdida en cocina, necesito visita y presupuesto hoy."
              />
            </label>
            <button className="submit-button" type="submit" disabled={!canBook || bookingState === "submitting"}>
              Solicitar contratación
            </button>
            {!canBook ? <p className="field-note">Seleccioná una opción disponible para poder contratar.</p> : null}
            {bookingSubmitted ? (
              <p className="confirm">
                Solicitud enviada. {selectedProvider?.name || "El prestador"} recibió tu pedido para {requestedDate} a las {requestedTime}.
              </p>
            ) : null}
            {bookingState === "error" ? <p className="error-box" role="alert">{bookingError}</p> : null}
            {activeServiceRequestId ? (
              <p className="field-note">
                ID de solicitud activa: <strong>{activeServiceRequestId}</strong>
              </p>
            ) : null}
          </form>
        </section>

        <form className="review-form" onSubmit={handleSubmit}>
          <fieldset className="stars-wrap">
            <legend className="sr-only">Calificación de 1 a 5 estrellas</legend>
            <StarRow value={rating} onToggle={handleStarToggle} onKeyDown={handleStarKeyDown} />
            <p className="field-note" aria-hidden="true">
              Tocá una estrella para calificar. Si querés cambiar, tocá otra.
            </p>
            <p id="rating-instructions" className="sr-only">
              Usá las flechas para ajustar la calificación y la tecla 0 para limpiar la selección.
            </p>
          </fieldset>

          {rating > 0 && (
            <>
              <section className="tags-block" aria-label="Etiquetas rápidas">
                {currentTags.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-chip ${selected ? "selected" : ""}`}
                      onClick={() => handleTagToggle(tag)}
                      aria-pressed={selected}
                    >
                      {tag}
                    </button>
                  );
                })}
              </section>

              <label className="comment-block" htmlFor="review-comment">
                Comentario (opcional)
                <textarea
                  id="review-comment"
                  name="review-comment"
                  value={comment}
                  maxLength={240}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setComment(nextValue);
                    if (!didTrackCommentStart && nextValue.trim().length > 0 && experimentAssignment) {
                      trackCommentStarted({
                        variant: experimentAssignment.variant,
                        subjectId: experimentAssignment.subjectId,
                        sessionId: experimentAssignment.sessionId,
                      });
                      setDidTrackCommentStart(true);
                    }
                    if (!nextValue.trim().length) {
                      setDidTrackCommentStart(false);
                    }
                  }}
                  placeholder="Agregá un detalle para ayudar a otros clientes (opcional)."
                />
                <span className="char-count" aria-live="polite">
                  {comment.length}/240
                </span>
              </label>
            </>
          )}

          <aside className={`trust-state ${trustState.tone}`} role="status" aria-live="polite">
            <p className="trust-state-title">{trustState.title}</p>
            <p>{trustState.message}</p>
          </aside>

          <button className="submit-button" type="submit" disabled={!rating || isSubmitting || !canReview}>
            {isSubmitting ? "Enviando..." : "Enviar reseña"}
          </button>
          {!canReview ? <p className="field-note">Primero completá una contratación para habilitar la reseña verificada.</p> : null}

          {submitted && <p className="confirm">Gracias. Tu reseña fue enviada. Puede pasar por validación antes de publicarse.</p>}
        </form>

        <section className="reviews-feed" aria-labelledby="reviews-feed-title">
          <div className="section-head">
            <h2 id="reviews-feed-title">Reseñas recientes</h2>
            <div className="filter-row" role="group" aria-label="Filtros de reseñas">
              {[
                ["all", "Todas"],
                ["positive", "4-5★"],
                ["critical", "1-2★"],
                ["moderation", "Moderación"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`filter-chip ${filter === value ? "selected" : ""}`}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {listState === "loading" && (
            <div className="skeleton-list" aria-label="Cargando reseñas">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          )}

          {listState === "error" && (
            <div className="error-box" role="alert">
              No pudimos cargar reseñas. Reintentá en unos segundos.
              <button
                type="button"
                className="retry-button"
                onClick={() => {
                  setListState("loading");
                  setReloadNonce((prev) => prev + 1);
                }}
              >
                Reintentar
              </button>
            </div>
          )}
          {listWarning ? (
            <div className="warning-box" role="status">
              {listWarning}
              <button
                type="button"
                className="retry-button"
                onClick={() => {
                  setListState("loading");
                  setListWarning("");
                  setReloadNonce((prev) => prev + 1);
                }}
              >
                Reintentar
              </button>
            </div>
          ) : null}

          {listState === "ready" && filteredReviews.length === 0 && <p className="helper-text">Todavía no hay reseñas para este filtro.</p>}

          {listState === "ready" &&
            filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReport={(reviewItem, invokerEl) => {
                  setModalInvoker(invokerEl);
                  setActiveReport(reviewItem);
                }}
                onRespond={(reviewItem, invokerEl) => {
                  setModalInvoker(invokerEl);
                  setActiveRespond(reviewItem);
                }}
              />
            ))}
        </section>
      </section>

      <p className="sr-only" aria-live="polite">
        {liveMessage}
      </p>

      <ReportModal
        review={activeReport}
        returnFocusEl={modalInvoker}
        onClose={() => setActiveReport(null)}
        onSubmit={handleReportSubmit}
      />
      <RespondModal
        review={activeRespond}
        returnFocusEl={modalInvoker}
        onClose={() => setActiveRespond(null)}
        onSubmit={handleRespondSubmit}
      />
    </main>
  );
}
