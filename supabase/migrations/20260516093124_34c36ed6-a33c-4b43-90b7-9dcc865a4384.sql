
CREATE TABLE public.upsell_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  shop_domain text NOT NULL,
  recipient_email text,
  recommended_products jsonb,
  email_subject text,
  email_preheader text,
  email_body_html text,
  email_body_text text,
  reasoning text,
  model text,
  prompt_tokens int,
  completion_tokens int,
  delivery_status text NOT NULL DEFAULT 'pending',
  delivery_error text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);

CREATE INDEX idx_upsell_offers_shop ON public.upsell_offers(shop_id);
CREATE INDEX idx_upsell_offers_delivery ON public.upsell_offers(delivery_status);

ALTER TABLE public.upsell_offers ENABLE ROW LEVEL SECURITY;
-- No policies: service-role only.
