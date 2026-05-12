const EXPERIMENT_ID = "exp_rat18_review_request_v1";
const CONTROL_VARIANT = "control";
const TREATMENT_VARIANT = "treatment";
const ASSIGNMENT_STORAGE_KEY = "rat18_review_experiment_assignment_v1";

function hashString(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function nowIsoTimestamp() {
  return new Date().toISOString();
}

function randomToken(size = 10) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  }

  // Keep a deterministic fallback only for runtimes without Web Crypto.
  return `fallback_${Date.now().toString(36)}`;
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return "server-render";
  const existing = window.sessionStorage.getItem("rat_session_id");
  if (existing) return existing;
  const generated = `sess_${randomToken(10)}`;
  window.sessionStorage.setItem("rat_session_id", generated);
  return generated;
}

function buildBasePayload() {
  const sessionId = getOrCreateSessionId();
  return {
    experiment_id: EXPERIMENT_ID,
    subject_id: sessionId,
    session_id: sessionId,
    timestamp: nowIsoTimestamp(),
    channel: "mobile_web",
  };
}

function emitAnalytics(eventName, payload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });
}

export function getOrCreateReviewExperimentAssignment() {
  if (typeof window === "undefined") {
    return { variant: CONTROL_VARIANT, subjectId: "server-render", sessionId: "server-render" };
  }

  const stored = window.sessionStorage.getItem(ASSIGNMENT_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return { variant: parsed.variant, subjectId: parsed.subject_id, sessionId: parsed.session_id };
    } catch (_error) {
      window.sessionStorage.removeItem(ASSIGNMENT_STORAGE_KEY);
    }
  }

  const basePayload = buildBasePayload();
  const bucket = hashString(basePayload.subject_id) % 2;
  const variant = bucket === 0 ? CONTROL_VARIANT : TREATMENT_VARIANT;
  const assignment = { ...basePayload, variant };

  window.sessionStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignment));
  emitAnalytics("experiment_assigned", assignment);

  return { variant, subjectId: assignment.subject_id, sessionId: assignment.session_id };
}

export function trackReviewConversion({ variant, subjectId, sessionId }) {
  emitAnalytics("review_conversion", {
    experiment_id: EXPERIMENT_ID,
    variant,
    subject_id: subjectId,
    session_id: sessionId,
    timestamp: nowIsoTimestamp(),
    channel: "mobile_web",
  });
}

function buildInteractionPayload({ variant, subjectId, sessionId, metadata = {} }) {
  return {
    experiment_id: EXPERIMENT_ID,
    variant,
    subject_id: subjectId,
    session_id: sessionId,
    timestamp: nowIsoTimestamp(),
    channel: "mobile_web",
    ...metadata,
  };
}

export function trackStarSelected({ variant, subjectId, sessionId, stars }) {
  emitAnalytics(
    "review_star_selected",
    buildInteractionPayload({ variant, subjectId, sessionId, metadata: { stars } }),
  );
}

export function trackTagToggled({ variant, subjectId, sessionId, tag, selected }) {
  emitAnalytics(
    "review_tag_toggled",
    buildInteractionPayload({ variant, subjectId, sessionId, metadata: { tag, selected } }),
  );
}

export function trackCommentStarted({ variant, subjectId, sessionId }) {
  emitAnalytics("review_comment_started", buildInteractionPayload({ variant, subjectId, sessionId }));
}

export function trackReportSubmitted({ variant, subjectId, sessionId, reasonCode }) {
  emitAnalytics(
    "review_report_submitted",
    buildInteractionPayload({ variant, subjectId, sessionId, metadata: { reason_code: reasonCode } }),
  );
}

export function trackRespondSubmitted({ variant, subjectId, sessionId, length }) {
  emitAnalytics(
    "review_respond_submitted",
    buildInteractionPayload({ variant, subjectId, sessionId, metadata: { message_length: length } }),
  );
}
