
-- Append-only webhook event log
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain text NOT NULL,
  topic text NOT NULL,
  shopify_webhook_id text,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'received',
  error text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX idx_webhook_events_shop ON public.webhook_events(shop_domain);
CREATE INDEX idx_webhook_events_topic ON public.webhook_events(topic);
CREATE UNIQUE INDEX idx_webhook_events_dedupe
  ON public.webhook_events(shop_domain, topic, shopify_webhook_id)
  WHERE shopify_webhook_id IS NOT NULL;

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies: only service role can read/write.

-- Orders captured from orders/create
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  shop_domain text NOT NULL,
  shopify_order_id text NOT NULL,
  order_number text,
  email text,
  customer_id text,
  total_price numeric,
  currency text,
  financial_status text,
  fulfillment_status text,
  line_items jsonb,
  raw jsonb NOT NULL,
  processing_status text NOT NULL DEFAULT 'pending',
  processing_error text,
  shopify_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE (shop_domain, shopify_order_id)
);

CREATE INDEX idx_orders_shop ON public.orders(shop_id);
CREATE INDEX idx_orders_status ON public.orders(processing_status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- No policies: only service role.
