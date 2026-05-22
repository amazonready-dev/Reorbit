import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isValidShopDomain } from "@/lib/shopify-webhook";
import { activateChargeIfAccepted } from "@/lib/shopify-billing.server";

/**
 * GET /billing/callback?shop=<domain>&charge_id=<id>
 *
 * Shopify redirects the merchant here after they accept or decline the
 * recurring charge. We re-read the charge, activate it if accepted, then
 * send the merchant back into the embedded app.
 */
export const Route = createFileRoute("/billing/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const shop = url.searchParams.get("shop");
        const chargeId = url.searchParams.get("charge_id");

        if (!shop || !isValidShopDomain(shop) || !chargeId) {
          return new Response("Invalid callback", { status: 400 });
        }

        const { data: shopRow } = await supabaseAdmin
          .from("shops")
          .select("access_token")
          .eq("shop_domain", shop)
          .maybeSingle();

        if (!shopRow?.access_token) {
          return new Response("Shop not installed", { status: 404 });
        }

        try {
          const { status } = await activateChargeIfAccepted({
            shopDomain: shop,
            accessToken: shopRow.access_token,
            chargeId,
          });

          const redirect = `/app?shop=${encodeURIComponent(shop)}&billing=${encodeURIComponent(status)}`;
          return new Response(null, {
            status: 302,
            headers: { Location: redirect },
          });
        } catch (err) {
          console.error("[billing/callback] failed", err);
          return new Response("Failed to finalise billing", { status: 502 });
        }
      },
    },
  },
});
