import { createFileRoute } from "@tanstack/react-router";
import {
  fetchPendingOrders,
  getShop,
  fetchShopProducts,
  generateUpsell,
  saveUpsell,
  markOrderFailed,
} from "@/lib/upsell-ai.server";
import { enqueueUpsellEmail } from "@/lib/upsell-email.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Drains pending orders → AI upsell engine.
 * Called by pg_cron every 2 min, or manually via curl.
 * Public route — authenticated by Supabase anon key in `apikey` header
 * (enforced at the Lovable edge for /api/public/*).
 */
export const Route = createFileRoute("/api/public/process-pending-orders")({
  server: {
    handlers: {
      POST: async () => {
        const startedAt = Date.now();
        let processed = 0;
        let failed = 0;
        const errors: Array<{ orderId: string; error: string }> = [];

        try {
          const orders = await fetchPendingOrders(5);

          for (const order of orders) {
            try {
              if (!order.shop_id) throw new Error("Order has no shop_id");
              const shop = await getShop(order.shop_id);
              if (!shop) throw new Error("Shop not found / uninstalled");

              const products = await fetchShopProducts(shop, 30);
              if (products.length === 0) throw new Error("Empty product catalog");

              const ai = await generateUpsell(order, shop, products);
              await saveUpsell(order, ai);

              // Fetch the offer we just saved to get its id, then enqueue email.
              if (order.email) {
                const { data: offer } = await supabaseAdmin
                  .from("upsell_offers")
                  .select("id")
                  .eq("order_id", order.id)
                  .maybeSingle();

                if (offer) {
                  const result = await enqueueUpsellEmail({
                    offerId: offer.id,
                    recipientEmail: order.email,
                    shopDomain: shop.shop_domain,
                    currency: shop.currency ?? order.currency,
                    subject: ai.recommendation.email_subject,
                    preheader: ai.recommendation.email_preheader,
                    bodyText: ai.recommendation.email_body_text,
                    recommendedProducts: ai.recommendation.recommended_products,
                  });

                  await supabaseAdmin
                    .from("upsell_offers")
                    .update({
                      delivery_status:
                        result.status === "sent"
                          ? "queued"
                          : result.status === "suppressed"
                            ? "suppressed"
                            : result.status === "skipped"
                              ? "skipped"
                              : "failed",
                      delivery_error:
                        result.status === "failed"
                          ? result.error
                          : result.status === "skipped"
                            ? result.reason
                            : null,
                      sent_at: result.status === "sent" ? new Date().toISOString() : null,
                    })
                    .eq("id", offer.id);
                }
              }
              processed++;
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              console.error("[process-pending-orders] order failed", order.id, msg);
              await markOrderFailed(order.id, msg);
              errors.push({ orderId: order.id, error: msg });
              failed++;
            }
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[process-pending-orders] batch failed", msg);
          return new Response(
            JSON.stringify({ error: msg, processed, failed }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({
            ok: true,
            processed,
            failed,
            errors,
            duration_ms: Date.now() - startedAt,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
