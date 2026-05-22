import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Loads the public Shopify API key + current billing status for the
 * embedded admin app. The API key (OAuth client_id) is public; the access
 * token is NOT exposed.
 */
export const getAppConfig = createServerFn({ method: "GET" })
  .inputValidator((data: { shop?: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.SHOPIFY_API_KEY ?? "";
    let billingStatus: string | null = null;
    let planName: string | null = null;

    if (data.shop) {
      const { data: charge } = await supabaseAdmin
        .from("billing_charges")
        .select("status, plan_name")
        .eq("shop_domain", data.shop)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      billingStatus = charge?.status ?? null;
      planName = charge?.plan_name ?? null;
    }

    return { apiKey, billingStatus, planName };
  });
