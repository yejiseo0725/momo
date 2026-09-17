import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_MS = 30_000;
const localDevelopmentSecret = "momo-local-development-secret-change-before-deploy";

function getSigningSecret() {
  return process.env.BETTER_AUTH_SECRET || localDevelopmentSecret;
}

function signPayload(encodedPayload) {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createChatSocketToken(gatheringId, message, now = Date.now()) {
  const payload = {
    gatheringId,
    message,
    expiresAt: now + TOKEN_LIFETIME_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyChatSocketToken(token, now = Date.now()) {
  if (typeof token !== "string" || token.length > 8_192) {
    return null;
  }

  const separatorIndex = token.indexOf(".");
  if (separatorIndex <= 0 || separatorIndex !== token.lastIndexOf(".")) {
    return null;
  }

  const encodedPayload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length
    || !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

    if (
      typeof payload?.gatheringId !== "string"
      || typeof payload?.message?.id !== "string"
      || typeof payload?.message?.userId !== "string"
      || typeof payload?.message?.content !== "string"
      || typeof payload?.message?.createdAt !== "string"
      || typeof payload?.message?.authorName !== "string"
      || typeof payload?.expiresAt !== "number"
      || payload.expiresAt < now
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
