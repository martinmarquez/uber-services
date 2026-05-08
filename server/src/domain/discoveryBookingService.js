import crypto from "node:crypto";

const MAX_REQUESTS_PER_MINUTE = 8;

export class DiscoveryBookingService {
  constructor(seedProviders = []) {
    this.providers = seedProviders.slice();
    this.serviceRequests = new Map();
    this.idempotencyIndex = new Map();
    this.velocityWindowByUser = new Map();
  }

  discoverProviders(input) {
    const filtered = this.providers
      .filter((provider) => provider.category === input.category)
      .filter((provider) => provider.city.toLowerCase() === input.city.toLowerCase())
      .filter((provider) => provider.isActive);

    const sort = input.sort ?? "rating_desc";
    if (sort === "price_asc") filtered.sort((a, b) => a.basePriceArs - b.basePriceArs);
    if (sort === "distance_asc") filtered.sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === "rating_desc") filtered.sort((a, b) => b.rating - a.rating);

    const limit = Number(input.limit ?? 20);
    return {
      ok: true,
      providers: filtered.slice(0, limit),
      version: "v1",
    };
  }

  createServiceRequest(input) {
    if (!isCustomer(input.actor)) return { ok: false, code: "forbidden_actor" };
    if (!isValidIdempotencyKey(input.idempotencyKey)) return { ok: false, code: "idempotency_key_required" };

    const replay = this.idempotencyIndex.get(input.idempotencyKey);
    if (replay) return { replay: true, ...replay };

    const rateLimited = this.hitVelocityWindow(input.actor.id, input.now);
    if (rateLimited) {
      return this.cacheIdempotent(input.idempotencyKey, {
        ok: false,
        code: "rate_limited",
      });
    }

    const provider = this.providers.find((p) => p.userId === input.providerUserId);
    if (!provider || !provider.isActive) {
      return this.cacheIdempotent(input.idempotencyKey, {
        ok: false,
        code: "provider_not_available",
      });
    }

    const request = {
      id: randomId("sr"),
      customerUserId: input.actor.id,
      providerUserId: input.providerUserId,
      category: input.category,
      city: input.city,
      notes: input.notes,
      scheduledAt: input.scheduledAt,
      status: "requested",
      createdAt: input.now ?? new Date().toISOString(),
      updatedAt: input.now ?? new Date().toISOString(),
    };

    this.serviceRequests.set(request.id, request);
    return this.cacheIdempotent(input.idempotencyKey, {
      ok: true,
      serviceRequest: request,
      version: "v1",
    });
  }

  getServiceRequestStatus(input) {
    const request = this.serviceRequests.get(input.serviceRequestId);
    if (!request) return { ok: false, code: "not_found" };
    if (!canAccessRequest(input.actor, request)) return { ok: false, code: "forbidden_actor" };

    return {
      ok: true,
      version: "v1",
      serviceRequest: {
        id: request.id,
        status: request.status,
        scheduledAt: request.scheduledAt,
        providerUserId: request.providerUserId,
        customerUserId: request.customerUserId,
        updatedAt: request.updatedAt,
      },
    };
  }

  hitVelocityWindow(userId, nowValue) {
    const now = new Date(nowValue ?? Date.now()).getTime();
    const windowMs = 60 * 1000;
    const list = this.velocityWindowByUser.get(userId) ?? [];
    const next = list.filter((ts) => now - ts <= windowMs);
    next.push(now);
    this.velocityWindowByUser.set(userId, next);
    return next.length > MAX_REQUESTS_PER_MINUTE;
  }

  cacheIdempotent(key, result) {
    this.idempotencyIndex.set(key, result);
    return result;
  }
}

function randomId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function isValidIdempotencyKey(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isCustomer(actor) {
  if (!actor || typeof actor !== "object") return false;
  if (!actor.id || !Array.isArray(actor.roles)) return false;
  return actor.roles.includes("customer");
}

function canAccessRequest(actor, request) {
  if (!actor || typeof actor !== "object") return false;
  if (!actor.id || !Array.isArray(actor.roles)) return false;
  if (actor.id === request.customerUserId || actor.id === request.providerUserId) return true;
  return actor.roles.includes("moderator");
}
