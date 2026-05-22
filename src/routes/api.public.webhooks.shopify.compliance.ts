import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  readVerifiedShopifyWebhook,
  logWebhookEvent,
  type ShopifyWebhookContext,
} from "@/lib/shopify-webhook";

/**
 * Unified Shopify GDPR compliance webhook endpoint.
 *
 * Handles all three mandatory compliance topics on a single URL, as
 * configured in shopify.app.toml under
 *   [[webhooks.subscriptions]]
 *   compliance_topics = ["customers/data_request", "customers/redact", "shop/redact"]
 *
 * Contract enforced here:
 *   - POST + valid HMAC                → 200 (text/plain "ok")
 *   - POST + missing/invalid HMAC      → 401 (text/plain "Unauthorized")
 *   - any non-POST method              → 405 (text/plain "Method Not Allowed", Allow: POST)
 *   - all error responses are plain text — NO HTML fallback
 */

const PLAIN = { "Content-Type": "text/plain; charset=utf-8" } as const;
const PLAIN_ALLOW_POST = { ...PLAIN, Allow: "POST" } as const;

export function methodNotAllowed() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: PLAIN_ALLOW_POST,
  });
}

type ComplianceWebhookDependencies = {
  logWebhookEvent: typeof logWebhookEvent;
  readVerifiedShopifyWebhook: typeof readVerifiedShopifyWebhook;
  supabaseAdmin: typeof supabaseAdmin;
};

async function handleComplianceTopic(
  ctx: ShopifyWebhookContext,
  db: typeof supabaseAdmin,
  logEvent: typeof logWebhookEvent,
) {
  switch (ctx.topic) {
    case "customers/data_request":
      await handleCustomersDataRequest(ctx);
      return;
    case "customers/redact":
      await handleCustomersRedact(ctx);
      return;
    case "shop/redact":
      await handleShopRedact(ctx);
      return;
    default:
      console.warn("[compliance] unknown topic", ctx.topic);
      await logEvent(db, ctx, "failed", "unknown topic");
      throw new Response("Unsupported topic", {
        status: 400,
        headers: PLAIN,
      });
  }
}

export function createCompliancePostHandler(
  deps: ComplianceWebhookDependencies = {
    readVerifiedShopifyWebhook,
    logWebhookEvent,
    supabaseAdmin,
  },
) {
  return async ({ request }: { request: Request }) => {
    const result = await deps.readVerifiedShopifyWebhook(request);
    if ("response" in result) {
      const status = result.response.status;
      const msg =
        status === 401
          ? "Unauthorized"
          : status === 400
            ? "Bad Request"
            : status === 500
              ? "Server Misconfigured"
              : "Error";
      return new Response(msg, { status, headers: PLAIN });
    }

    const ctx = result.ctx;
    try {
      await handleComplianceTopic(ctx, deps.supabaseAdmin, deps.logWebhookEvent);
      await deps.logWebhookEvent(deps.supabaseAdmin, ctx, "processed");
      return new Response("ok", { status: 200, headers: PLAIN });
    } catch (err) {
      if (err instanceof Response) {
        return err;
      }

      console.error("[compliance] handler failed", err);
      await deps.logWebhookEvent(
        deps.supabaseAdmin,
        ctx,
        "failed",
        err instanceof Error ? err.message : String(err),
      );
      return new Response("Internal Error", { status: 500, headers: PLAIN });
    }
  };
}

async function handleCustomersDataRequest(ctx: {
  shopDomain: string;
  payload: unknown;
}) {
  // We do not currently persist customer PII beyond order payloads. We log
  // receipt; any actual export is handled out-of-band.
  console.log("[compliance/customers/data_request]", {
    shop: ctx.shopDomain,
    payload: ctx.payload,
  });
}

async function handleCustomersRedact(ctx: {
  shopDomain: string;
  payload: unknown;
}) {
  const payload = ctx.payload as {
    shop_domain?: string;
    customer?: { id?: number | string; email?: string };
    orders_to_redact?: Array<number | string>;
  };

  const shopDomain = payload.shop_domain ?? ctx.shopDomain;
  const customerId =
    payload.customer?.id != null ? String(payload.customer.id) : null;
  const email = payload.customer?.email ?? null;

  if (customerId) {
    await supabaseAdmin
      .from("orders")
      .delete()
      .eq("shop_domain", shopDomain)
      .eq("customer_id", customerId);
  }

  if (
    Array.isArray(payload.orders_to_redact) &&
    payload.orders_to_redact.length > 0
  ) {
    await supabaseAdmin
      .from("orders")
      .delete()
      .eq("shop_domain", shopDomain)
      .in(
        "shopify_order_id",
        payload.orders_to_redact.map((x) => String(x)),
      );
  }

  if (email) {
    await supabaseAdmin
      .from("upsell_offers")
      .delete()
      .eq("shop_domain", shopDomain)
      .eq("recipient_email", email);

    await supabaseAdmin.from("suppressed_emails").upsert(
      {
        email,
        reason: "gdpr_redact",
        metadata: { shop_domain: shopDomain, customer_id: customerId },
      },
      { onConflict: "email", ignoreDuplicates: true },
    );
  }
}

async function handleShopRedact(ctx: {
  shopDomain: string;
  payload: unknown;
}) {
  const shopDomain =
    (ctx.payload as { shop_domain?: string })?.shop_domain ?? ctx.shopDomain;

  await Promise.all([
    supabaseAdmin.from("orders").delete().eq("shop_domain", shopDomain),
    supabaseAdmin.from("upsell_offers").delete().eq("shop_domain", shopDomain),
    supabaseAdmin.from("webhook_events").delete().eq("shop_domain", shopDomain),
    supabaseAdmin
      .from("billing_charges")
      .delete()
      .eq("shop_domain", shopDomain),
    supabaseAdmin
      .from("shopify_oauth_states")
      .delete()
      .eq("shop_domain", shopDomain),
  ]);
  await supabaseAdmin.from("shops").delete().eq("shop_domain", shopDomain);
}

export const Route = createFileRoute(
  "/api/public/webhooks/shopify/compliance",
)({
  server: {
    handlers: {
      GET: methodNotAllowed,
      PUT: methodNotAllowed,
      PATCH: methodNotAllowed,
      DELETE: methodNotAllowed,
      OPTIONS: methodNotAllowed,
      HEAD: methodNotAllowed,
      POST: createCompliancePostHandler(),
    },
  },
});
