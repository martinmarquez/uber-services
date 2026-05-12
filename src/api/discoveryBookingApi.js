const DEFAULT_API_BASE = "/api";
const REQUEST_TIMEOUT_MS = 8000;

function resolveApiBaseUrl() {
  if (typeof window !== "undefined" && window.__RATINGS_API_BASE_URL__) {
    return window.__RATINGS_API_BASE_URL__;
  }

  const envBase = typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_RATINGS_API_BASE_URL ?? import.meta.env?.VITE_API_BASE_URL
    : undefined;
  return envBase || DEFAULT_API_BASE;
}

function resolveActorHeaders() {
  const actorId = typeof import.meta !== "undefined" ? import.meta.env?.VITE_RATINGS_ACTOR_ID : undefined;
  const actorRoles = typeof import.meta !== "undefined" ? import.meta.env?.VITE_RATINGS_ACTOR_ROLES : undefined;

  return {
    "X-Actor-Id": actorId || "cus-1",
    "X-Actor-Roles": actorRoles || "customer",
  };
}

function generateRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function requestJson(path, { method = "GET", body } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const baseUrl = resolveApiBaseUrl().replace(/\/$/, "");

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": generateRequestId(),
        ...resolveActorHeaders(),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`discovery_booking_api_error:${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function discoverProviders({ category, city, sort = "rating_desc", limit = 6 }) {
  const params = new URLSearchParams({
    category,
    city,
    sort,
    limit: String(limit),
  });
  return requestJson(`/v1/providers/discovery?${params.toString()}`);
}

export async function createServiceRequest(payload) {
  return requestJson("/v1/service-requests", { method: "POST", body: payload });
}
