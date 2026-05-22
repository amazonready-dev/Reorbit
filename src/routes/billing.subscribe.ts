import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isValidShopDomain } from "@/lib/shopify-webhook";
import {
  createRecurringCharge,
  isPlanKey,
} from "@/lib/shopify-billing.server";

/**
 * GET /billing/subscribe?shop=<domain>&plan=<starter|growth|scale>
 *
 * Initiates a Shopify RecurringApplicationCharge for the shop and redirects
 * the merchant to Shopify's confirmation page. After approve/decline,
 * Shopify redirects back to /billing/callback.
 */
export const Route = createFileRoute("/billing/subscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const shop = url.searchParams.get("shop");
        const plan = url.searchParams.get("plan") ?? "growth";

        if (!shop || !isValidShopDomain(shop)) {
          return new Response("Missing or invalid shop", { status: 400 });
        }
        if (!isPlanKey(plan)) {
          return new Response("Unknown plan", { status: 400 });
        }

        const { data: shopRow, error } = await supabaseAdmin
          .from("shops")
          .select("id, shop_domain, access_token, uninstalled_at")
          .eq("shop_domain", shop)
          .maybeSingle();

        if (error || !shopRow || !shopRow.access_token || shopRow.uninstalled_at) {
          return new Response(
            "Shop is not installed. Please install Reorbit first.",
            { status: 404 },
          );
        }

        try {
          const { confirmationUrl } = await createRecurringCharge({
            shopDomain: shop,
            accessToken: shopRow.access_token,
            shopId: shopRow.id,
            plan,
            returnUrl: `${url.origin}/billing/callback?shop=${encodeURIComponent(shop)}`,
            // Test charges on development stores so we don't bill ourselves
            test: shop.endsWith(".myshopify.com") && process.env.NODE_ENV !== "production",
          });
          return new Response(null, {
            status: 302,
            headers: { Location: confirmationUrl },
          });
        } catch (err) {
          console.error("[billing/subscribe] failed", err);
          return new Response("Failed to start billing flow", { status: 502 });
        }
      },
    },
  },
});
