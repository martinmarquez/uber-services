import test from "node:test";
import assert from "node:assert/strict";
import { routes, validateRouteRequest } from "../src/api/routes.js";

function byPath(path) {
  return routes.find((route) => route.path === path);
}

test("validateRouteRequest rejects unauthorized actor for moderation route", () => {
  const route = byPath("/api/v1/reviews/:reviewId/moderation");
  const err = validateRouteRequest(
    route,
    { toStatus: "en_revision" },
    { params: { reviewId: "rev_123456" }, actor: { id: "usr_1", roles: ["rider"] } },
  );

  assert.equal(err.error.code, "AUTHORIZATION_ERROR");
  assert.equal(err.error.details.code, "forbidden_actor");
});

test("validateRouteRequest rejects malformed route params", () => {
  const route = byPath("/api/v1/reviews/:reviewId/reports");
  const err = validateRouteRequest(
    route,
    { reasonCode: "spam" },
    { params: { reviewId: "../etc/passwd" }, actor: { id: "usr_1", roles: ["rider"] } },
  );

  assert.equal(err.error.code, "VALIDATION_ERROR");
  assert.equal(err.error.details.code, "invalid_review_id");
});

test("validateRouteRequest accepts authorized moderation route", () => {
  const route = byPath("/api/v1/reviews/:reviewId/moderation");
  const err = validateRouteRequest(
    route,
    { toStatus: "en_revision" },
    { params: { reviewId: "rev_123456" }, actor: { id: "mod_1", roles: ["moderator"] } },
  );

  assert.equal(err, null);
});

test("validateRouteRequest accepts authenticated actor for appeals route", () => {
  const route = byPath("/api/v1/reviews/:reviewId/appeals");
  const err = validateRouteRequest(
    route,
    { note: "Solicito revision por contexto incompleto y evidencia adicional." },
    { params: { reviewId: "rev_123456" }, actor: { id: "usr_2", roles: ["customer"] } },
  );
  assert.equal(err, null);
});

test("validateRouteRequest rejects short appeal note payload", () => {
  const route = byPath("/api/v1/reviews/:reviewId/appeals");
  const err = validateRouteRequest(
    route,
    { note: "muy corto" },
    { params: { reviewId: "rev_123456" }, actor: { id: "usr_2", roles: ["customer"] } },
  );
  assert.equal(err.error.code, "VALIDATION_ERROR");
  assert.equal(err.error.details.code, "appeal_note_too_short");
});

test("validateRouteRequest rejects non-boolean resume flag for appeals route", () => {
  const route = byPath("/api/v1/reviews/:reviewId/appeals");
  const err = validateRouteRequest(
    route,
    { note: "Solicito revisión con contexto adicional suficiente.", resume: "yes" },
    { params: { reviewId: "rev_123456" }, actor: { id: "usr_2", roles: ["customer"] } },
  );
  assert.equal(err.error.code, "VALIDATION_ERROR");
  assert.equal(err.error.details.code, "invalid_resume_flag");
});

test("validateRouteRequest rejects unauthenticated actor for reports route", () => {
  const route = byPath("/api/v1/reviews/:reviewId/reports");
  const err = validateRouteRequest(
    route,
    { reasonCode: "spam" },
    { params: { reviewId: "rev_123456" }, actor: null },
  );
  assert.equal(err.error.code, "AUTHORIZATION_ERROR");
  assert.equal(err.error.details.code, "unauthenticated");
});

test("validateRouteRequest rejects non-customer actor for review creation", () => {
  const route = byPath("/api/v1/service-requests/:serviceRequestId/reviews");
  const err = validateRouteRequest(
    route,
    {
      idempotencyKey: "idem-rt-1",
      providerUserId: "prov-1",
      rating: 5,
      serviceCompletedAt: "2026-05-07T10:00:00.000Z",
    },
    { params: { serviceRequestId: "sr_123456" }, actor: { id: "prov_1", roles: ["provider"] } },
  );

  assert.equal(err.error.code, "AUTHORIZATION_ERROR");
  assert.equal(err.error.details.code, "forbidden_actor");
});
