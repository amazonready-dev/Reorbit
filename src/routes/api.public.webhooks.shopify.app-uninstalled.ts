import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { readVerifiedShopifyWebhook, logWebhookEvent } from "@/lib/shopify-webhook";

/**
 * Shopify webhook: app/uninstalled
 *
 * Marks the shop as uninstalled and clears the access token so we stop
 * trying to call Shopify on its behalf. Full data deletion happens later
 * via the `shop/redact` GDPR webhook (48h after uninstall).
 */
export const Route = createFileRoute("/api/public/webhooks/shopify/app-uninstalled")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const result = await readVerifiedShopifyWebhook(request);
        if ("response" in result) return result.response;

        const { shopDomain } = result.ctx;

        try {
          await supabaseAdmin
            .from("shops")
            .update({
              access_token: "",
              uninstalled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("shop_domain", shopDomain);

          await supabaseAdmin
            .from("billing_charges")
            .update({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
            })
            .eq("shop_domain", shopDomain)
            .in("status", ["pending", "active"]);

          await logWebhookEvent(supabaseAdmin, result.ctx, "processed");
        } catch (err) {
          console.error("[app/uninstalled] failed", err);
          return new Response("Internal error", { status: 500 });
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
