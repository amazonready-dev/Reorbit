CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_domain TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  scope TEXT NOT NULL,
  shop_name TEXT,
  shop_email TEXT,
  plan_name TEXT,
  currency TEXT,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uninstalled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX shops_shop_domain_idx ON public.shops (shop_domain);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- No public policies — only service role (backend) can access this table.
-- Access tokens must never be exposed to the client.

-- OAuth state storage (CSRF protection, short-lived)
CREATE TABLE public.shopify_oauth_states (
  state TEXT NOT NULL PRIMARY KEY,
  shop_domain TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shopify_oauth_states ENABLE ROW LEVEL SECURITY;
-- No public policies — backend only.

CREATE OR REPLACE FUNCTION public.touch_shops_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER shops_touch_updated_at
BEFORE UPDATE ON public.shops
FOR EACH ROW EXECUTE FUNCTION public.touch_shops_updated_at();
