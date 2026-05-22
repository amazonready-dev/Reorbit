CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.billing_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  shop_domain text NOT NULL,
  shopify_charge_id text NOT NULL,
  plan_name text NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  interval text NOT NULL DEFAULT 'EVERY_30_DAYS',
  trial_days integer NOT NULL DEFAULT 14,
  status text NOT NULL DEFAULT 'pending',
  test boolean NOT NULL DEFAULT false,
  confirmation_url text,
  activated_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shop_domain, shopify_charge_id)
);

CREATE INDEX idx_billing_charges_shop_domain ON public.billing_charges(shop_domain);
CREATE INDEX idx_billing_charges_status ON public.billing_charges(status);

ALTER TABLE public.billing_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages billing charges"
ON public.billing_charges FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_billing_charges_updated_at
BEFORE UPDATE ON public.billing_charges
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();