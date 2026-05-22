// Server-side Shopify session token (JWT) verifier.
// Session tokens are signed by Shopify with HMAC-SHA256 using the app's
// client secret (SHOPIFY_API_SECRET). See:
// https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens

import { createHmac, timingSafeEqual } from "crypto";

export interface ShopifySessionTokenPayload {
  iss: string; // shop admin URL, e.g. https://shop.myshopify.com/admin
  dest: string; // shop URL,        e.g. https://shop.myshopify.com
  aud: string; // client_id
  sub: string; // user id
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
  sid: string;
}

function base64UrlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function verifyShopifySessionToken(token: string): ShopifySessionTokenPayload {
  const secret = process.env.SHOPIFY_API_SECRET;
  const apiKey = process.env.SHOPIFY_API_KEY;
  if (!secret || !apiKey) {
    throw new Error("Shopify API credentials not configured");
  }

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed session token");
  const [headerB64, payloadB64, sigB64] = parts;

  const expected = createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest();
  const provided = base64UrlDecode(sigB64);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new Error("Invalid session token signature");
  }

  const payload = JSON.parse(base64UrlDecode(payloadB64).toString("utf8")) as ShopifySessionTokenPayload;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) throw new Error("Session token expired");
  if (payload.nbf > now) throw new Error("Session token not yet valid");
  if (payload.aud !== apiKey) throw new Error("Session token audience mismatch");
  if (!payload.dest || !payload.dest.startsWith("https://")) {
    throw new Error("Session token dest invalid");
  }

  return payload;
}

export function extractBearer(request: Request): string | null {
  const h = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}
