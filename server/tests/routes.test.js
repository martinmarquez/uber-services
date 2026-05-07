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
