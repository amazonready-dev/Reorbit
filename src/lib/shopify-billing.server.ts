import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const BILLING_PLANS = {
  starter: { name: "Starter", price: 29.0, trial_days: 14 },
  growth: { name: "Growth", price: 79.0, trial_days: 14 },
  scale: { name: "Scale", price: 199.0, trial_days: 14 },
} as const;

export type PlanKey = keyof typeof BILLING_PLANS;

export function isPlanKey(value: string): value is PlanKey {
  return value in BILLING_PLANS;
}

/**
 * Creates a Shopify RecurringApplicationCharge via the REST Admin API and
 * persists a pending row in `billing_charges`. Returns the confirmation URL
 * the merchant must be redirected to.
 *
 * Docs: https://shopify.dev/docs/api/admin-rest/2024-10/resources/recurringapplicationcharge
 */
export async function createRecurringCharge(opts: {
  shopDomain: string;
  accessToken: string;
  shopId: string | null;
  plan: PlanKey;
  returnUrl: string;
  test?: boolean;
}): Promise<{ confirmationUrl: string; chargeId: string }> {
  const plan = BILLING_PLANS[opts.plan];

  const res = await fetch(
    `https://${opts.shopDomain}/admin/api/2024-10/recurring_application_charges.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": opts.accessToken,
      },
      body: JSON.stringify({
        recurring_application_charge: {
          name: `Reorbit — ${plan.name}`,
          price: plan.price,
          return_url: opts.returnUrl,
          trial_days: plan.trial_days,
          test: opts.test ?? false,
        },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify billing API failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    recurring_application_charge: {
      id: number;
      confirmation_url: string;
      status: string;
    };
  };
  const charge = json.recurring_application_charge;

  await supabaseAdmin.from("billing_charges").upsert(
    {
      shop_id: opts.shopId,
      shop_domain: opts.shopDomain,
      shopify_charge_id: String(charge.id),
      plan_name: opts.plan,
      price: plan.price,
      trial_days: plan.trial_days,
      status: "pending",
      test: opts.test ?? false,
      confirmation_url: charge.confirmation_url,
    },
    { onConflict: "shop_domain,shopify_charge_id" },
  );

  return { confirmationUrl: charge.confirmation_url, chargeId: String(charge.id) };
}

/**
 * Confirms an in-flight charge by re-reading it from Shopify and updating
 * our billing_charges row accordingly.
 */
export async function activateChargeIfAccepted(opts: {
  shopDomain: string;
  accessToken: string;
  chargeId: string;
}): Promise<{ status: string }> {
  const res = await fetch(
    `https://${opts.shopDomain}/admin/api/2024-10/recurring_application_charges/${opts.chargeId}.json`,
    {
      headers: { "X-Shopify-Access-Token": opts.accessToken },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify charge lookup failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    recurring_application_charge: { id: number; status: string };
  };
  const status = json.recurring_application_charge.status;

  // If accepted but not yet active, activate it now.
  if (status === "accepted") {
    const actRes = await fetch(
      `https://${opts.shopDomain}/admin/api/2024-10/recurring_application_charges/${opts.chargeId}/activate.json`,
      {
        method: "POST",
        headers: { "X-Shopify-Access-Token": opts.accessToken },
      },
    );
    if (!actRes.ok) {
      const text = await actRes.text();
      throw new Error(`Shopify charge activation failed (${actRes.status}): ${text}`);
    }
  }

  const finalStatus =
    status === "accepted" ? "active" : status === "active" ? "active" : status;

  await supabaseAdmin
    .from("billing_charges")
    .update({
      status: finalStatus,
      activated_at: finalStatus === "active" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("shop_domain", opts.shopDomain)
    .eq("shopify_charge_id", String(opts.chargeId));

  return { status: finalStatus };
}
