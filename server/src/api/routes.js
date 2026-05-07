const {
  validateCreateReviewPayload,
  validatePatchReviewPayload,
  businessError,
} = require("./reviewsContract");

const routes = [
  {
    method: "POST",
    path: "/api/v1/service-requests/:serviceRequestId/reviews",
    validateBody: validateCreateReviewPayload,
  },
  {
    method: "PATCH",
    path: "/api/v1/reviews/:reviewId",
    validateBody: validatePatchReviewPayload,
  },
  {
    method: "POST",
    path: "/api/v1/reviews/:reviewId/reports",
    validateBody: (body) => (!body?.reasonCode ? "reason_code_required" : null),
  },
  {
    method: "POST",
    path: "/api/v1/reviews/:reviewId/appeals",
    validateBody: (body) => (!body?.note ? "appeal_note_required" : null),
  },
];

function validateRouteRequest(route, body) {
  const code = route.validateBody(body);
  if (!code) return null;
  return businessError("VALIDATION_ERROR", "Request payload is invalid", { code });
}

module.exports = { routes, validateRouteRequest };
