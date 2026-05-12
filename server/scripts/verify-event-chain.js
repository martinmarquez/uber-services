#!/usr/bin/env node
import fs from "node:fs";
import { verifyEventChain } from "../src/security/eventIntegrity.js";

const eventsPath = process.argv[2];
if (!eventsPath) {
  console.error("Usage: node server/scripts/verify-event-chain.js <events.json>");
  process.exit(2);
}

const raw = fs.readFileSync(eventsPath, "utf8");
const events = JSON.parse(raw);

const publicKeyPem = loadOptional("EVENT_VERIFY_PUBLIC_KEY_PEM", "EVENT_VERIFY_PUBLIC_KEY_FILE");
const hmacSecret = process.env.EVENT_VERIFY_HMAC_SECRET ?? null;
const forcedKeyId = process.env.EVENT_VERIFY_KEY_ID ?? null;

const result = verifyEventChain(events, (keyId, algorithm) => {
  if (forcedKeyId && keyId !== forcedKeyId) return null;
  if (algorithm === "HMAC-SHA256") return hmacSecret;
  return publicKeyPem;
});

if (!result.ok) {
  console.error(JSON.stringify(result));
  process.exit(1);
}

console.log(JSON.stringify(result));

function loadOptional(valueEnv, fileEnv) {
  if (process.env[valueEnv]) return process.env[valueEnv];
  const filePath = process.env[fileEnv];
  if (!filePath) return null;
  return fs.readFileSync(filePath, "utf8");
}
