import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Shopify webhook: orders/create
 *
 * Verifies HMAC (raw body + SHOPIFY_API_SECRET), resolves the shop by
 * X-Shopify-Shop-Domain, dedupes by X-Shopify-Webhook-Id, and persists:
 *   - an append-only entry in `webhook_events`
 *   - an `orders` row marked `pending` for downstream AI processing
 *
 * Returns 200 ASAP per Shopify guidelines (they retry on non-2xx).
 */

function verifyShopifyWebhookHmac(
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

function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

export const Route = createFileRoute("/api/public/webhooks/shopify/orders-create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiSecret = process.env.SHOPIFY_API_SECRET;
        if (!apiSecret) {
          console.error("[orders/create] SHOPIFY_API_SECRET missing");
          return new Response("Server not configured", { status: 500 });
        }

        const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
        const shopDomain = request.headers.get("x-shopify-shop-domain");
        const topic = request.headers.get("x-shopify-topic") ?? "orders/create";
        const webhookId = request.headers.get("x-shopify-webhook-id");

        // Read raw body for HMAC verification (must be exact bytes Shopify sent)
        const rawBody = await request.text();

        // 1. Verify HMAC
        if (!verifyShopifyWebhookHmac(rawBody, hmacHeader, apiSecret)) {
          console.warn("[orders/create] HMAC verification failed", { shopDomain });
          return new Response("Unauthorized", { status: 401 });
        }

        // 2. Validate shop domain
        if (!shopDomain || !isValidShopDomain(shopDomain)) {
          return new Response("Invalid shop domain", { status: 400 });
        }

        // 3. Parse payload
        let payload: any;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // 4. Resolve shop row (must be installed)
        const { data: shop, error: shopErr } = await supabaseAdmin
          .from("shops")
          .select("id, shop_domain")
          .eq("shop_domain", shopDomain)
          .maybeSingle();

        if (shopErr) {
          console.error("[orders/create] shop lookup failed", shopErr);
          return new Response("Shop lookup failed", { status: 500 });
        }
        if (!shop) {
          // Unknown shop — ack 200 so Shopify doesn't retry forever
          console.warn("[orders/create] event for unknown shop", { shopDomain });
          return new Response("Unknown shop", { status: 200 });
        }

        // 5. Append-only event log (idempotent on webhook id)
        const { error: evtErr } = await supabaseAdmin.from("webhook_events").upsert(
          {
            shop_domain: shopDomain,
            topic,
            shopify_webhook_id: webhookId,
            payload: payload as any,
            status: "received",
            received_at: new Date().toISOString(),
          },
          { onConflict: "shop_domain,topic,shopify_webhook_id", ignoreDuplicates: true },
        );
        if (evtErr) {
          console.error("[orders/create] webhook_events insert failed", evtErr);
          // continue — we still want to register the order
        }

        // 6. Extract canonical order fields
        const order = payload as {
          id?: number | string;
          name?: string;
          email?: string;
          currency?: string;
          total_price?: string;
          financial_status?: string;
          fulfillment_status?: string | null;
          created_at?: string;
          customer?: { id?: number | string } | null;
          line_items?: unknown[];
        };

        if (order.id === undefined || order.id === null) {
          return new Response("Missing order id", { status: 400 });
        }

        // 7. Upsert order row — mark processing pipeline as 'pending'
        const { error: ordErr } = await supabaseAdmin.from("orders").upsert(
          {
            shop_id: shop.id,
            shop_domain: shopDomain,
            shopify_order_id: String(order.id),
            order_number: order.name ?? null,
            email: order.email ?? null,
            customer_id: order.customer?.id ? String(order.customer.id) : null,
            total_price: order.total_price ? Number(order.total_price) : null,
            currency: order.currency ?? null,
            financial_status: order.financial_status ?? null,
            fulfillment_status: order.fulfillment_status ?? null,
            line_items: (order.line_items ?? null) as any,
            raw: payload as any,
            processing_status: "pending",
            processing_error: null,
            shopify_created_at: order.created_at ?? null,
            received_at: new Date().toISOString(),
          },
          { onConflict: "shop_domain,shopify_order_id" },
        );

        if (ordErr) {
          console.error("[orders/create] order upsert failed", ordErr);
          // 500 → Shopify will retry, which is what we want for transient DB errors
          return new Response("Failed to record order", { status: 500 });
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
