import crypto from "node:crypto";

const DEFAULT_ALGORITHM = "RSA-SHA256";
const DEFAULT_KEY_ID = "local-dev-key";

export function defaultEventSigner(options = {}) {
  const privateKeyPem = options.privateKeyPem ?? process.env.EVENT_SIGNING_PRIVATE_KEY_PEM;
  const keyId = options.keyId ?? process.env.EVENT_SIGNING_KEY_ID ?? DEFAULT_KEY_ID;
  const algorithm = options.algorithm ?? DEFAULT_ALGORITHM;

  if (!privateKeyPem) return hmacFallbackSigner(options.hmacKey);

  return {
    signDigest(digestHex) {
      const signature = crypto.sign(algorithm, Buffer.from(digestHex, "hex"), privateKeyPem).toString("base64");
      return { signature, keyId, algorithm };
    },
  };
}

export function verifyEventChain(events, resolvePublicKeyById) {
  if (!Array.isArray(events)) return { ok: false, code: "invalid_events_payload", index: 0 };

  let expectedPreviousHash = null;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    const {
      integrityHash,
      signature,
      signatureAlgorithm,
      signatureKeyId,
      ...envelope
    } = event ?? {};
    const previousEventHash = envelope.previousEventHash ?? null;

    if (!integrityHash || !signature || !signatureAlgorithm || !signatureKeyId) {
      return { ok: false, code: "missing_integrity_fields", index };
    }
    if (previousEventHash !== expectedPreviousHash) {
      return { ok: false, code: "chain_link_mismatch", index };
    }

    const recomputedHash = crypto.createHash("sha256").update(JSON.stringify(envelope)).digest("hex");
    if (recomputedHash !== integrityHash) {
      return { ok: false, code: "event_payload_tampered", index };
    }

    const publicKeyPem = resolvePublicKeyById?.(signatureKeyId);
    if (!publicKeyPem) return { ok: false, code: "public_key_not_found", index };

    const validSignature = crypto.verify(
      signatureAlgorithm,
      Buffer.from(integrityHash, "hex"),
      publicKeyPem,
      Buffer.from(signature, "base64"),
    );
    if (!validSignature) return { ok: false, code: "invalid_signature", index };

    expectedPreviousHash = integrityHash;
  }

  return { ok: true, verifiedEvents: events.length };
}

function hmacFallbackSigner(secret = process.env.EVENT_SIGNING_FALLBACK_HMAC_KEY ?? "dev-only-insecure-key") {
  return {
    signDigest(digestHex) {
      const signature = crypto.createHmac("sha256", secret).update(digestHex).digest("hex");
      return {
        signature,
        keyId: "hmac-fallback",
        algorithm: "HMAC-SHA256",
      };
    },
  };
}
