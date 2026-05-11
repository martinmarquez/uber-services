import test from "node:test";
import assert from "node:assert/strict";
import {
  validateCreateServiceRequestPayload,
  validateDiscoveryQuery,
} from "../src/api/discoveryBookingContract.js";
import { DiscoveryBookingService } from "../src/domain/discoveryBookingService.js";
import { routes, validateRouteRequest } from "../src/api/routes.js";

const seedProviders = [
  {
    userId: "prov-1",
    category: "cleaning",
    city: "Buenos Aires",
    rating: 4.8,
    basePriceArs: 20000,
    distanceKm: 3,
    isActive: true,
  },
  {
    userId: "prov-2",
    category: "cleaning",
    city: "Buenos Aires",
    rating: 4.1,
    basePriceArs: 15000,
    distanceKm: 9,
    isActive: true,
  },
  {
    userId: "prov-3",
    category: "plumbing",
    city: "Cordoba",
    rating: 4.9,
    basePriceArs: 25000,
    distanceKm: 2,
    isActive: true,
  },
];

test("discovery query validation enforces category + city + limit constraints", () => {
  assert.equal(validateDiscoveryQuery({ category: "cleaning", city: "Buenos Aires", limit: 20 }), null);
  assert.equal(validateDiscoveryQuery({ category: "unknown", city: "Buenos Aires" }), "invalid_category");
  assert.equal(validateDiscoveryQuery({ category: "cleaning", city: "B", limit: 100 }), "invalid_city");
});

test("discoverProviders returns filtered providers sorted by rating desc", () => {
  const svc = new DiscoveryBookingService(seedProviders);
  const res = svc.discoverProviders({
    category: "cleaning",
    city: "Buenos Aires",
    sort: "rating_desc",
    limit: 20,
  });

  assert.equal(res.ok, true);
  assert.equal(res.version, "v1");
  assert.equal(res.providers.length, 2);
  assert.equal(res.providers[0].userId, "prov-1");
  assert.equal(res.providers[1].userId, "prov-2");
});

test("createServiceRequest stores booking and supports idempotent replay", () => {
  const svc = new DiscoveryBookingService(seedProviders);
  const input = {
    idempotencyKey: "book-idem-1",
    providerUserId: "prov-1",
    category: "cleaning",
    city: "Buenos Aires",
    notes: "Need deep clean for 2-bedroom apartment",
    scheduledAt: "2026-05-10T15:00:00.000Z",
    now: "2026-05-07T12:00:00.000Z",
    actor: { id: "cus-1", roles: ["customer"] },
  };

  const first = svc.createServiceRequest(input);
  const second = svc.createServiceRequest(input);

  assert.equal(first.ok, true);
  assert.equal(first.serviceRequest.status, "completed");
  assert.equal(second.ok, true);
  assert.equal(second.replay, true);
  assert.equal(second.serviceRequest.id, first.serviceRequest.id);
});

test("createServiceRequest rejects non-customer actor and unavailable provider", () => {
  const svc = new DiscoveryBookingService(seedProviders);

  const forbidden = svc.createServiceRequest({
    idempotencyKey: "book-idem-2",
    providerUserId: "prov-1",
    category: "cleaning",
    city: "Buenos Aires",
    notes: "Need service soon",
    scheduledAt: "2026-05-10T15:00:00.000Z",
    now: "2026-05-07T12:00:00.000Z",
    actor: { id: "user-1", roles: ["provider"] },
  });

  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.code, "forbidden_actor");

  const unavailable = svc.createServiceRequest({
    idempotencyKey: "book-idem-3",
    providerUserId: "prov-x",
    category: "cleaning",
    city: "Buenos Aires",
    notes: "Need service soon",
    scheduledAt: "2026-05-10T15:00:00.000Z",
    now: "2026-05-07T12:00:00.000Z",
    actor: { id: "cus-1", roles: ["customer"] },
  });

  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.code, "provider_not_available");
});

test("getServiceRequestStatus only allows booking participants", () => {
  const svc = new DiscoveryBookingService(seedProviders);
  const created = svc.createServiceRequest({
    idempotencyKey: "book-idem-status-1",
    providerUserId: "prov-1",
    category: "cleaning",
    city: "Buenos Aires",
    notes: "Need deep clean for 2-bedroom apartment",
    scheduledAt: "2026-05-10T15:00:00.000Z",
    now: "2026-05-07T12:00:00.000Z",
    actor: { id: "cus-1", roles: ["customer"] },
  });

  const forbidden = svc.getServiceRequestStatus({
    serviceRequestId: created.serviceRequest.id,
    actor: { id: "cus-2", roles: ["customer"] },
  });
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.code, "forbidden_actor");

  const allowed = svc.getServiceRequestStatus({
    serviceRequestId: created.serviceRequest.id,
    actor: { id: "prov-1", roles: ["provider"] },
  });
  assert.equal(allowed.ok, true);
  assert.equal(allowed.serviceRequest.status, "completed");
});

test("create service request payload validates required fields", () => {
  assert.equal(
    validateCreateServiceRequestPayload({
      idempotencyKey: "book-idem-4",
      providerUserId: "prov-1",
      category: "cleaning",
      city: "Buenos Aires",
      notes: "Need a deep clean this weekend",
      scheduledAt: "2026-05-11T10:00:00.000Z",
    }),
    null
  );

  assert.equal(
    validateCreateServiceRequestPayload({
      idempotencyKey: "book-idem-5",
      providerUserId: "prov-1",
      category: "cleaning",
      city: "Buenos Aires",
      notes: "short",
      scheduledAt: "bad-date",
    }),
    "invalid_scheduled_at"
  );
});

test("route-level validation for discovery and booking returns deterministic error payload", () => {
  const discoveryRoute = routes.find((route) => route.path === "/api/v1/providers/discovery");
  const createServiceRequestRoute = routes.find((route) => route.path === "/api/v1/service-requests");

  const discoveryErr = validateRouteRequest(discoveryRoute, {
    query: { category: "unknown", city: "Buenos Aires" },
  });
  assert.equal(discoveryErr.error.code, "VALIDATION_ERROR");
  assert.equal(discoveryErr.error.details.code, "invalid_category");

  const bookingErr = validateRouteRequest(createServiceRequestRoute, {
    actor: { id: "cus-1", roles: ["customer"] },
    body: {
      idempotencyKey: "book-idem-6",
      providerUserId: "prov-1",
      category: "cleaning",
      city: "Buenos Aires",
      notes: "tiny",
      scheduledAt: "2026-05-11T10:00:00.000Z",
    },
    actor: { id: "cus-1", roles: ["customer"] },
  });
  assert.equal(bookingErr.error.code, "VALIDATION_ERROR");
  assert.equal(bookingErr.error.details.code, "invalid_notes");
});

test("route-level authz denies non-customer service-request creation with AUTHORIZATION_ERROR", () => {
  const createServiceRequestRoute = routes.find((route) => route.path === "/api/v1/service-requests");
  const err = validateRouteRequest(createServiceRequestRoute, {
    body: {
      idempotencyKey: "book-idem-7",
      providerUserId: "prov-1",
      category: "cleaning",
      city: "Buenos Aires",
      notes: "Need deep clean for apartment",
      scheduledAt: "2026-05-11T10:00:00.000Z",
    },
    actor: { id: "prov-9", roles: ["provider"] },
  });

  assert.equal(err.error.code, "AUTHORIZATION_ERROR");
  assert.equal(err.error.details.code, "forbidden_actor");
});
