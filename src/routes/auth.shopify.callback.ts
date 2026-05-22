import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

/**
 * Verifies Shopify OAuth callback HMAC per:
 * https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/authorization-code-grant
 */
function verifyShopifyHmac(url: URL, secret: string): boolean {
  const params = new URLSearchParams(url.searchParams);
  const hmac = params.get("hmac");
  if (!hmac) return false;
  params.delete("hmac");
  params.delete("signature");

  // Sort + urlencode in Shopify's exact format (RFC 3986-ish, & joined)
  const sorted = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const computed = createHmac("sha256", secret).update(sorted).digest("hex");
  const a = Buffer.from(hmac, "utf8");
  const b = Buffer.from(computed, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const Route = createFileRoute("/auth/shopify/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const shop = url.searchParams.get("shop");
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!shop || !code || !state || !isValidShopDomain(shop)) {
          return new Response("Invalid callback parameters", { status: 400 });
        }

        const apiKey = process.env.SHOPIFY_API_KEY;
        const apiSecret = process.env.SHOPIFY_API_SECRET;
        if (!apiKey || !apiSecret) {
          return new Response("Shopify credentials not configured", { status: 500 });
        }

        // 1. Verify HMAC signature
        if (!verifyShopifyHmac(url, apiSecret)) {
          return new Response("HMAC verification failed", { status: 401 });
        }

        // 2. Verify + consume state (CSRF)
        const { data: stateRow, error: stateErr } = await supabaseAdmin
          .from("shopify_oauth_states")
          .select("state, shop_domain")
          .eq("state", state)
          .maybeSingle();

        if (stateErr || !stateRow || stateRow.shop_domain !== shop) {
          return new Response("Invalid or expired state", { status: 401 });
        }

        await supabaseAdmin.from("shopify_oauth_states").delete().eq("state", state);

        // 3. Exchange code for access_token
        const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: apiKey,
            client_secret: apiSecret,
            code,
          }),
        });

        if (!tokenRes.ok) {
          const text = await tokenRes.text();
          console.error("Token exchange failed:", tokenRes.status, text);
          return new Response("Token exchange failed", { status: 502 });
        }

        const tokenJson = (await tokenRes.json()) as {
          access_token: string;
          scope: string;
        };

        // 4. Fetch shop details (best-effort)
        let shopInfo: {
          name?: string;
          email?: string;
          plan_name?: string;
          currency?: string;
        } = {};
        try {
          const shopRes = await fetch(`https://${shop}/admin/api/2024-10/shop.json`, {
            headers: { "X-Shopify-Access-Token": tokenJson.access_token },
          });
          if (shopRes.ok) {
            const json = (await shopRes.json()) as { shop: typeof shopInfo };
            shopInfo = json.shop ?? {};
          }
        } catch (e) {
          console.warn("Could not fetch shop info:", e);
        }

        // 5. Upsert shop record
        const { error: upsertErr } = await supabaseAdmin.from("shops").upsert(
          {
            shop_domain: shop,
            access_token: tokenJson.access_token,
            scope: tokenJson.scope,
            shop_name: shopInfo.name ?? null,
            shop_email: shopInfo.email ?? null,
            plan_name: shopInfo.plan_name ?? null,
            currency: shopInfo.currency ?? null,
            installed_at: new Date().toISOString(),
            uninstalled_at: null,
          },
          { onConflict: "shop_domain" },
        );

        if (upsertErr) {
          console.error("Failed to save shop:", upsertErr);
          return new Response("Failed to save shop", { status: 500 });
        }

        // 5b. Register webhooks (idempotent — Shopify dedupes by address+topic)
        const webhookTopics: Array<{ topic: string; path: string }> = [
          { topic: "orders/create", path: "/api/public/webhooks/shopify/orders-create" },
          { topic: "app/uninstalled", path: "/api/public/webhooks/shopify/app-uninstalled" },
        ];
        for (const { topic, path } of webhookTopics) {
          try {
            const hookRes = await fetch(`https://${shop}/admin/api/2024-10/webhooks.json`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": tokenJson.access_token,
              },
              body: JSON.stringify({
                webhook: { topic, address: `${url.origin}${path}`, format: "json" },
              }),
            });
            // 422 = already exists, that's fine
            if (!hookRes.ok && hookRes.status !== 422) {
              console.warn(`Webhook ${topic} registration failed:`, hookRes.status, await hookRes.text());
            }
          } catch (e) {
            console.warn(`Webhook ${topic} registration error:`, e);
          }
        }

        // 6. Redirect to merchant app home (will become dashboard later)
        return new Response(null, {
          status: 302,
          headers: { Location: `/app?shop=${encodeURIComponent(shop)}` },
        });
      },
    },
  },
});
