import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SCOPES = "read_orders,read_customers,read_products,read_script_tags,write_script_tags";

function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

export const Route = createFileRoute("/auth/shopify/install")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const shop = url.searchParams.get("shop");

        if (!shop || !isValidShopDomain(shop)) {
          return new Response(
            "Missing or invalid 'shop' parameter. Expected ?shop=yourstore.myshopify.com",
            { status: 400 },
          );
        }

        const apiKey = process.env.SHOPIFY_API_KEY;
        if (!apiKey) {
          return new Response("SHOPIFY_API_KEY is not configured", { status: 500 });
        }

        // CSRF state nonce
        const state = randomBytes(24).toString("hex");
        const { error } = await supabaseAdmin
          .from("shopify_oauth_states")
          .insert({ state, shop_domain: shop });

        if (error) {
          console.error("Failed to persist OAuth state:", error);
          return new Response("Failed to start install", { status: 500 });
        }

        const redirectUri = `${url.origin}/auth/shopify/callback`;
        const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
        authorizeUrl.searchParams.set("client_id", apiKey);
        authorizeUrl.searchParams.set("scope", SCOPES);
        authorizeUrl.searchParams.set("redirect_uri", redirectUri);
        authorizeUrl.searchParams.set("state", state);

        return new Response(null, {
          status: 302,
          headers: { Location: authorizeUrl.toString() },
        });
      },
    },
  },
});
