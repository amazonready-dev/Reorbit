import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        shopify_store: z.string().max(255).optional().nullable(),
        monthly_orders: z.string().max(50).optional().nullable(),
        referrer: z.string().max(500).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("waitlist_signups").insert({
      email: data.email.toLowerCase().trim(),
      shopify_store: data.shopify_store?.trim() || null,
      monthly_orders: data.monthly_orders || null,
      referrer: data.referrer || null,
    });

    if (error) {
      // Unique violation = already on waitlist, treat as success
      if (error.code === "23505") return { ok: true, alreadyJoined: true };
      throw new Error(error.message);
    }

    // Position estimate
    const { count } = await supabaseAdmin
      .from("waitlist_signups")
      .select("*", { count: "exact", head: true });

    return { ok: true, alreadyJoined: false, position: count ?? null };
  });
