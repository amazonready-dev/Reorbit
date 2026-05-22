import { createHmac, timingSafeEqual } from "crypto";

export function verifyShopifyWebhookHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret: string,
): boolean {
  if (!hmacHeader) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(hmacHeader, "utf8");
  const b = Buffer.from(digest, "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

export type ShopifyWebhookContext = {
  shopDomain: string;
  topic: string;
  webhookId: string | null;
  payload: unknown;
  rawBody: string;
};

/**
 * Reads raw body, verifies HMAC, validates shop domain, parses JSON.
 * Returns either a Response (to short-circuit) or the parsed context.
 */
export async function readVerifiedShopifyWebhook(
  request: Request,
): Promise<{ response: Response } | { ctx: ShopifyWebhookContext }> {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    console.error("[shopify-webhook] SHOPIFY_API_SECRET missing");
    return { response: new Response("Server not configured", { status: 500 }) };
  }

  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const shopDomain = request.headers.get("x-shopify-shop-domain");
  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  const webhookId = request.headers.get("x-shopify-webhook-id");
  const rawBody = await request.text();

  if (!verifyShopifyWebhookHmac(rawBody, hmacHeader, secret)) {
    return { response: new Response("Unauthorized", { status: 401 }) };
  }

  if (!shopDomain || !isValidShopDomain(shopDomain)) {
    return { response: new Response("Invalid shop domain", { status: 400 }) };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { response: new Response("Invalid JSON", { status: 400 }) };
  }

  return { ctx: { shopDomain, topic, webhookId, payload, rawBody } };
}

/**
 * Logs the webhook event (idempotent on webhook id).
 */
export async function logWebhookEvent(
  supabaseAdmin: any,
  ctx: ShopifyWebhookContext,
  status: "received" | "processed" | "failed" = "received",
  error?: string,
) {
  await supabaseAdmin.from("webhook_events").upsert(
    {
      shop_domain: ctx.shopDomain,
      topic: ctx.topic,
      shopify_webhook_id: ctx.webhookId,
      payload: ctx.payload as any,
      status,
      error: error ?? null,
      received_at: new Date().toISOString(),
      processed_at: status === "processed" ? new Date().toISOString() : null,
    },
    { onConflict: "shop_domain,topic,shopify_webhook_id", ignoreDuplicates: false },
  );
}
