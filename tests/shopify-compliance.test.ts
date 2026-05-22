/**
 * Unit tests for Shopify App Review compliance.
 *
 * Run with:  bun test
 *
 * These tests cover the pure pieces (HMAC verification, shop-domain regex)
 * directly and exercise the compliance route's HTTP contract by importing
 * the handlers from the route file.
 */
import { describe, expect, mock, test } from "bun:test";
import { createHmac } from "crypto";
import {
  verifyShopifyWebhookHmac,
  isValidShopDomain,
} from "../src/lib/shopify-webhook";
import { isPlanKey, BILLING_PLANS } from "../src/lib/shopify-billing.server";

const SECRET = "test-shopify-secret";

function signBody(body: string, secret = SECRET) {
  return createHmac("sha256", secret).update(body, "utf8").digest("base64");
}

describe("HMAC verification (SHA256 base64, timing-safe)", () => {
  test("accepts a valid Shopify-style signature", () => {
    const body = JSON.stringify({ shop_domain: "shop.myshopify.com" });
    const sig = signBody(body);
    expect(verifyShopifyWebhookHmac(body, sig, SECRET)).toBe(true);
  });

  test("rejects a tampered body", () => {
    const body = JSON.stringify({ shop_domain: "shop.myshopify.com" });
    const sig = signBody(body);
    expect(verifyShopifyWebhookHmac(body + "x", sig, SECRET)).toBe(false);
  });

  test("rejects when secret differs", () => {
    const body = "{}";
    const sig = signBody(body);
    expect(verifyShopifyWebhookHmac(body, sig, "wrong-secret")).toBe(false);
  });

  test("rejects missing header", () => {
    expect(verifyShopifyWebhookHmac("{}", null, SECRET)).toBe(false);
  });

  test("rejects mismatched-length signature without throwing", () => {
    expect(verifyShopifyWebhookHmac("{}", "shorty", SECRET)).toBe(false);
  });
});

describe("Shop domain validation", () => {
  test.each([
    ["valid", "my-store.myshopify.com", true],
    ["valid alnum", "abc123.myshopify.com", true],
    ["wrong tld", "my-store.shopify.com", false],
    ["leading dash", "-store.myshopify.com", false],
    ["xss", "store.myshopify.com<script>", false],
    ["empty", "", false],
  ])("%s → %s", (_label, input, expected) => {
    expect(isValidShopDomain(input)).toBe(expected);
  });
});

describe("Billing plan keys", () => {
  test("known plans are valid", () => {
    for (const key of Object.keys(BILLING_PLANS)) {
      expect(isPlanKey(key)).toBe(true);
    }
  });
  test("unknown plan rejected", () => {
    expect(isPlanKey("enterprise")).toBe(false);
    expect(isPlanKey("")).toBe(false);
  });
});

describe("Compliance webhook HTTP contract", () => {
  // We must point readVerifiedShopifyWebhook at the same secret these tests
  // use. The lib reads process.env at call time.
  process.env.SHOPIFY_API_SECRET = SECRET;

  // Import after env is set so any module-init side effects pick it up.
  // We dynamic-import the route module to avoid evaluating it before env set.
  test("non-POST returns 405 + Allow: POST + plain text", async () => {
    const { Route } = await import(
      "../src/routes/api.public.webhooks.shopify.compliance"
    );
    const handlers = (Route.options as any).server.handlers as Record<
      string,
      (args: { request: Request }) => Promise<Response> | Response
    >;
    for (const method of ["GET", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]) {
      const res = await handlers[method]({
        request: new Request("https://x.test/api/public/webhooks/shopify/compliance", {
          method,
        }),
      });
      expect(res.status).toBe(405);
      expect(res.headers.get("Allow")).toBe("POST");
      expect(res.headers.get("Content-Type") ?? "").toContain("text/plain");
      const body = await res.text();
      expect(body.toLowerCase()).not.toContain("<html");
    }
  });

  test("POST without HMAC returns 401 plain text", async () => {
    const { Route } = await import(
      "../src/routes/api.public.webhooks.shopify.compliance"
    );
    const handlers = (Route.options as any).server.handlers as any;
    const res = await handlers.POST({
      request: new Request("https://x.test/api/public/webhooks/shopify/compliance", {
        method: "POST",
        body: "{}",
        headers: { "x-shopify-shop-domain": "shop.myshopify.com" },
      }),
    });
    expect(res.status).toBe(401);
    expect(res.headers.get("Content-Type") ?? "").toContain("text/plain");
    const text = await res.text();
    expect(text.toLowerCase()).not.toContain("<html");
  });

  test("POST with invalid HMAC returns 401", async () => {
    const { Route } = await import(
      "../src/routes/api.public.webhooks.shopify.compliance"
    );
    const handlers = (Route.options as any).server.handlers as any;
    const body = JSON.stringify({ shop_domain: "shop.myshopify.com" });
    const res = await handlers.POST({
      request: new Request("https://x.test/api/public/webhooks/shopify/compliance", {
        method: "POST",
        body,
        headers: {
          "x-shopify-hmac-sha256": "not-a-real-signature",
          "x-shopify-shop-domain": "shop.myshopify.com",
          "x-shopify-topic": "customers/data_request",
        },
      }),
    });
    expect(res.status).toBe(401);
  });

  test("POST with valid HMAC on supported topic returns 200 plain text ok", async () => {
    const { createCompliancePostHandler } = await import(
      "../src/routes/api.public.webhooks.shopify.compliance"
    );

    const logWebhookEvent = mock(async () => undefined);
    const handler = createCompliancePostHandler({
      readVerifiedShopifyWebhook: async () => ({
        ctx: {
          shopDomain: "shop.myshopify.com",
          topic: "customers/data_request",
          webhookId: "wh_123",
          payload: { shop_domain: "shop.myshopify.com" },
          rawBody: "{}",
        },
      }),
      logWebhookEvent,
      supabaseAdmin: {} as any,
    });

    const res = await handler({
      request: new Request("https://x.test/api/public/webhooks/shopify/compliance", {
        method: "POST",
        body: "{}",
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type") ?? "").toContain("text/plain");
    expect(await res.text()).toBe("ok");
    expect(logWebhookEvent).toHaveBeenCalledTimes(1);
  });
});

describe("Billing routes — input validation", () => {
  test("subscribe rejects invalid shop", async () => {
    const { Route } = await import("../src/routes/billing.subscribe");
    const handlers = (Route.options as any).server.handlers as any;
    const res = await handlers.GET({
      request: new Request("https://x.test/billing/subscribe?shop=evil.com"),
    });
    expect(res.status).toBe(400);
  });

  test("subscribe rejects unknown plan", async () => {
    const { Route } = await import("../src/routes/billing.subscribe");
    const handlers = (Route.options as any).server.handlers as any;
    const res = await handlers.GET({
      request: new Request(
        "https://x.test/billing/subscribe?shop=test.myshopify.com&plan=enterprise",
      ),
    });
    expect(res.status).toBe(400);
  });

  test("callback rejects missing charge_id", async () => {
    const { Route } = await import("../src/routes/billing.callback");
    const handlers = (Route.options as any).server.handlers as any;
    const res = await handlers.GET({
      request: new Request("https://x.test/billing/callback?shop=test.myshopify.com"),
    });
    expect(res.status).toBe(400);
  });
});

describe("OAuth install — input safety", () => {
  test("install rejects missing shop", async () => {
    const { Route } = await import("../src/routes/auth.shopify.install");
    const handlers = (Route.options as any).server.handlers as any;
    const res = await handlers.GET({
      request: new Request("https://x.test/auth/shopify/install"),
    });
    expect(res.status).toBe(400);
  });

  test("install rejects shop-domain XSS attempt", async () => {
    const { Route } = await import("../src/routes/auth.shopify.install");
    const handlers = (Route.options as any).server.handlers as any;
    const res = await handlers.GET({
      request: new Request(
        "https://x.test/auth/shopify/install?shop=evil.com%3Cscript%3E",
      ),
    });
    expect(res.status).toBe(400);
  });
});
