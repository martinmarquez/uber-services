import crypto from "node:crypto";

export function createActorSignatureHeaders({ actorId, roles = [], ts = Math.floor(Date.now() / 1000), secret }) {
  if (!actorId) throw new Error("actorId is required");
  if (!secret) throw new Error("secret is required");

  const roleValue = Array.isArray(roles)
    ? roles.map((role) => String(role).trim()).filter(Boolean).join(",")
    : String(roles ?? "").trim();
  const tsValue = String(ts);
  const payload = `${actorId}|${roleValue}|${tsValue}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  return {
    "x-actor-id": String(actorId),
    "x-actor-roles": roleValue,
    "x-actor-ts": tsValue,
    "x-actor-sig": signature,
  };
}
