/**
 * Server-only helpers for the post-purchase AI upsell engine.
 * Imported ONLY from server routes / server functions.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

type ShopifyProduct = {
  id: number | string;
  title: string;
  handle: string;
  product_type?: string;
  vendor?: string;
  tags?: string;
  variants?: Array<{ id: number | string; price: string; title: string }>;
  image?: { src?: string } | null;
};

type OrderRow = {
  id: string;
  shop_id: string | null;
  shop_domain: string;
  shopify_order_id: string;
  email: string | null;
  currency: string | null;
  total_price: number | null;
  line_items: unknown;
  raw: unknown;
};

type ShopRow = {
  id: string;
  shop_domain: string;
  access_token: string;
  currency: string | null;
};

/** Fetch up to `limit` orders waiting to be processed. */
export async function fetchPendingOrders(limit = 5): Promise<OrderRow[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, shop_id, shop_domain, shopify_order_id, email, currency, total_price, line_items, raw")
    .eq("processing_status", "pending")
    .order("received_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as OrderRow[];
}

export async function getShop(shopId: string): Promise<ShopRow | null> {
  const { data, error } = await supabaseAdmin
    .from("shops")
    .select("id, shop_domain, access_token, currency")
    .eq("id", shopId)
    .maybeSingle();
  if (error) throw error;
  return (data as ShopRow | null) ?? null;
}

/** Fetch a small product catalog snapshot for AI context. */
export async function fetchShopProducts(shop: ShopRow, limit = 30): Promise<ShopifyProduct[]> {
  const res = await fetch(
    `https://${shop.shop_domain}/admin/api/2024-10/products.json?limit=${limit}&status=active`,
    { headers: { "X-Shopify-Access-Token": shop.access_token } },
  );
  if (!res.ok) {
    console.warn("[upsell-ai] product fetch failed", res.status, await res.text());
    return [];
  }
  const json = (await res.json()) as { products?: ShopifyProduct[] };
  return json.products ?? [];
}

const SYSTEM_PROMPT = `You are an expert e-commerce post-purchase upsell strategist for Shopify stores.
Given an order the customer just placed and the store's product catalog, recommend 2-3 complementary products
the customer is most likely to add, and write a short, warm follow-up email that feels personal — not pushy.

Rules:
- Recommend products from the provided catalog ONLY. Never invent products.
- Prefer complements / accessories / consumables / upgrades over the same item they already bought.
- Email subject < 55 chars, no spammy ALL CAPS, no excessive emojis (max 1).
- Body 90-160 words, plain conversational tone, includes a soft CTA.
- Output via the recommend_upsell function call. Do NOT reply in plain text.`;

const TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "recommend_upsell",
    description: "Return a post-purchase upsell recommendation.",
    parameters: {
      type: "object",
      properties: {
        reasoning: { type: "string", description: "1-2 sentences why these products fit." },
        recommended_products: {
          type: "array",
          minItems: 1,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              product_id: { type: "string" },
              title: { type: "string" },
              handle: { type: "string" },
              price: { type: "string" },
              why: { type: "string" },
            },
            required: ["product_id", "title", "handle", "why"],
            additionalProperties: false,
          },
        },
        email_subject: { type: "string" },
        email_preheader: { type: "string" },
        email_body_text: { type: "string", description: "Plain-text email body (90-160 words)." },
      },
      required: ["reasoning", "recommended_products", "email_subject", "email_preheader", "email_body_text"],
      additionalProperties: false,
    },
  },
};

export type UpsellRecommendation = {
  reasoning: string;
  recommended_products: Array<{
    product_id: string;
    title: string;
    handle: string;
    price?: string;
    why: string;
  }>;
  email_subject: string;
  email_preheader: string;
  email_body_text: string;
};

export type AIResult = {
  recommendation: UpsellRecommendation;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
};

export async function generateUpsell(
  order: OrderRow,
  shop: ShopRow,
  products: ShopifyProduct[],
): Promise<AIResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  // Trim catalog payload aggressively (token cost control)
  const catalog = products.slice(0, 30).map((p) => ({
    id: String(p.id),
    title: p.title,
    handle: p.handle,
    type: p.product_type,
    tags: p.tags,
    price: p.variants?.[0]?.price,
  }));

  const userPayload = {
    shop: { domain: shop.shop_domain, currency: shop.currency ?? order.currency ?? "USD" },
    order: {
      id: order.shopify_order_id,
      total: order.total_price,
      currency: order.currency,
      line_items: order.line_items,
    },
    catalog,
  };

  const body = {
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
    tools: [TOOL_SCHEMA],
    tool_choice: { type: "function", function: { name: "recommend_upsell" } },
  };

  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error(`AI rate limit (429): ${text}`);
    if (res.status === 402) throw new Error(`AI credits exhausted (402): ${text}`);
    throw new Error(`AI gateway error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    choices: Array<{
      message?: {
        tool_calls?: Array<{ function?: { name: string; arguments: string } }>;
      };
    }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    model?: string;
  };

  const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    throw new Error("AI returned no tool call");
  }

  let recommendation: UpsellRecommendation;
  try {
    recommendation = JSON.parse(toolCall.function.arguments) as UpsellRecommendation;
  } catch (e) {
    throw new Error(`AI returned invalid JSON: ${(e as Error).message}`);
  }

  return {
    recommendation,
    model: json.model ?? DEFAULT_MODEL,
    promptTokens: json.usage?.prompt_tokens,
    completionTokens: json.usage?.completion_tokens,
  };
}

export async function saveUpsell(order: OrderRow, ai: AIResult) {
  const { recommendation, model, promptTokens, completionTokens } = ai;

  const { error: offerErr } = await supabaseAdmin.from("upsell_offers").upsert(
    {
      order_id: order.id,
      shop_id: order.shop_id,
      shop_domain: order.shop_domain,
      recipient_email: order.email,
      recommended_products: recommendation.recommended_products as any,
      email_subject: recommendation.email_subject,
      email_preheader: recommendation.email_preheader,
      email_body_text: recommendation.email_body_text,
      reasoning: recommendation.reasoning,
      model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      delivery_status: order.email ? "pending" : "skipped",
      delivery_error: order.email ? null : "no_recipient_email",
    },
    { onConflict: "order_id" },
  );
  if (offerErr) throw offerErr;

  const { error: ordErr } = await supabaseAdmin
    .from("orders")
    .update({ processing_status: "processed", processed_at: new Date().toISOString() })
    .eq("id", order.id);
  if (ordErr) throw ordErr;
}

export async function markOrderFailed(orderId: string, errorMessage: string) {
  await supabaseAdmin
    .from("orders")
    .update({
      processing_status: "failed",
      processing_error: errorMessage.slice(0, 1000),
      processed_at: new Date().toISOString(),
    })
    .eq("id", orderId);
}
