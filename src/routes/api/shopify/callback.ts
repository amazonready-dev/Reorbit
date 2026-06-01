import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

function verifyShopifyHmac(url: URL, secret: string): boolean {
  const params = new URLSearchParams(url.searchParams);

  const hmac = params.get("hmac");
  if (!hmac) return false;

  params.delete("hmac");
  params.delete("signature");

  // Shopify requires exact alphabetical sorting
  const sorted = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const computed = createHmac("sha256", secret)
    .update(sorted)
    .digest("hex");

  const hmacBuffer = Buffer.from(hmac, "hex");
  const computedBuffer = Buffer.from(computed, "hex");

  if (hmacBuffer.length !== computedBuffer.length) return false;

  return timingSafeEqual(hmacBuffer, computedBuffer);
}

export const Route = createFileRoute("/api/shopify/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        // 🔥 DEBUG (SVARBIAUSIAS DALYKAS)
        console.log("🔵 CALLBACK URL:", request.url);
        console.log("🔵 SHOPIFY_APP_URL:", process.env.SHOPIFY_APP_URL);
        console.log("🔵 SEARCH PARAMS:", Object.fromEntries(url.searchParams));

        const shop = url.searchParams.get("shop");
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!shop || !code || !state || !isValidShopDomain(shop)) {
          console.error("❌ Invalid callback params");
          return new Response("Invalid callback parameters", { status: 400 });
        }

        const apiKey = process.env.SHOPIFY_API_KEY;
        const apiSecret = process.env.SHOPIFY_API_SECRET;

        if (!apiKey || !apiSecret) {
          console.error("❌ Missing env vars");
          return new Response("Missing Shopify env vars", { status: 500 });
        }

        // 1. HMAC CHECK
        const hmacValid = verifyShopifyHmac(url, apiSecret);

        if (!hmacValid) {
          console.error("❌ HMAC FAILED");
          return new Response("HMAC verification failed", { status: 401 });
        }

        // 2. CSRF state check
        const { data: stateRow, error: stateErr } = await supabaseAdmin
          .from("shopify_oauth_states")
          .select("state, shop_domain")
          .eq("state", state)
          .maybeSingle();

        if (stateErr || !stateRow || stateRow.shop_domain !== shop) {
          console.error("❌ Invalid state");
          return new Response("Invalid or expired state", { status: 401 });
        }

        await supabaseAdmin
          .from("shopify_oauth_states")
          .delete()
          .eq("state", state);

        // 3. Exchange code for token
        const tokenRes = await fetch(
          `https://${shop}/admin/oauth/access_token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: apiKey,
              client_secret: apiSecret,
              code,
            }),
          },
        );

        if (!tokenRes.ok) {
          const text = await tokenRes.text();
          console.error("❌ Token exchange failed:", text);
          return new Response("Token exchange failed", { status: 502 });
        }

        const tokenJson = (await tokenRes.json()) as {
          access_token: string;
          scope: string;
        };

        // 4. Get shop info
        let shopInfo: any = {};

        try {
          const shopRes = await fetch(
            `https://${shop}/admin/api/2024-10/shop.json`,
            {
              headers: {
                "X-Shopify-Access-Token": tokenJson.access_token,
              },
            },
          );

          if (shopRes.ok) {
            const json = await shopRes.json();
            shopInfo = json.shop ?? {};
          }
        } catch (e) {
          console.warn("⚠️ Shop fetch failed:", e);
        }

        // 5. Save to DB
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
          console.error("❌ DB error:", upsertErr);
          return new Response("DB error", { status: 500 });
        }

        // 6. Webhooks
        const webhooks = [
          { topic: "orders/create", path: "/api/public/webhooks/shopify/orders-create" },
          { topic: "app/uninstalled", path: "/api/public/webhooks/shopify/app-uninstalled" },
        ];

        for (const { topic, path } of webhooks) {
          try {
            await fetch(`https://${shop}/admin/api/2024-10/webhooks.json`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": tokenJson.access_token,
              },
              body: JSON.stringify({
                webhook: {
                  topic,
                  address: `${url.origin}${path}`,
                  format: "json",
                },
              }),
            });
          } catch (e) {
            console.warn("⚠️ Webhook error:", topic, e);
          }
        }

        // 7. Redirect
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/app?shop=${encodeURIComponent(shop)}`,
          },
        });
      },
    },
  },
});