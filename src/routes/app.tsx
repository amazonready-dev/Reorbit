import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { shopifyIdToken } from "@shopify/app-bridge/utilities";

import {
  AppProvider as PolarisProvider,
  Page,
  Card,
  Layout,
  Banner,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Badge,
} from "@shopify/polaris";

import enTranslations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

import { getAppConfig } from "@/lib/app-config.functions";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    shop: typeof search.shop === "string" ? search.shop : undefined,
    host: typeof search.host === "string" ? search.host : undefined,
    billing: typeof search.billing === "string" ? search.billing : undefined,
  }),

  loaderDeps: ({ search }) => ({
    shop: search.shop,
  }),

  loader: ({ deps }) =>
    getAppConfig({
      data: { shop: deps.shop },
    }),

  head: ({ loaderData }) => {
    const apiKey = loaderData?.apiKey ?? "";

    return {
      meta: apiKey
        ? [{ name: "shopify-api-key", content: apiKey }]
        : [],
      scripts: [
        {
          src: "https://cdn.shopify.com/shopifycloud/app-bridge.js",
        },
      ],
    };
  },

  component: EmbeddedApp,
});

function EmbeddedApp() {
  const { shop, host, billing } = Route.useSearch();
  const { apiKey, billingStatus, planName } = Route.useLoaderData();

  const [sessionTokenOk, setSessionTokenOk] = useState<boolean | null>(null);

  // safer embedded detection
  const isEmbedded = Boolean(shop || host || apiKey);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.background = "#f6f6f7";
    }

    if (!isEmbedded || typeof window === "undefined") return;

    let cancelled = false;
    const start = Date.now();

    const tick = async () => {
      if (cancelled) return;

      if (!window.shopify?.idToken) {
        if (Date.now() - start > 10_000) return;
        setTimeout(tick, 150);
        return;
      }

      try {
        const token = await shopifyIdToken();

        const res = await fetch("/api/shopify/session-ping", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!cancelled) setSessionTokenOk(res.ok);
      } catch {
        if (!cancelled) setSessionTokenOk(false);
      }
    };

    tick();

    return () => {
      cancelled = true;
    };
  }, [isEmbedded]);

  return (
    <PolarisProvider i18n={enTranslations}>
      <Page title="Reorbit">
        <Layout>
          {billing && (
            <Layout.Section>
              <Banner
                tone={
                  billing === "active"
                    ? "success"
                    : billing === "declined"
                    ? "warning"
                    : "info"
                }
                title={
                  billing === "active"
                    ? "Subscription active — you're all set."
                    : billing === "declined"
                    ? "Subscription was declined."
                    : `Subscription status: ${billing}`
                }
              />
            </Layout.Section>
          )}

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">
                    {shop ? `Welcome, ${shop}` : "Welcome to Reorbit"}
                  </Text>

                  {billingStatus === "active" ? (
                    <Badge tone="success">
                      {`${planName ?? "Plan"} · Active`}
                    </Badge>
                  ) : (
                    <Badge tone="attention">No active plan</Badge>
                  )}
                </InlineStack>

                <Text as="p" tone="subdued">
                  Reorbit is connected to your store. We generate AI-powered post-purchase upsells automatically.
                </Text>

                {isEmbedded && sessionTokenOk !== null && (
                  <Text
                    as="p"
                    tone={sessionTokenOk ? "success" : "critical"}
                  >
                    {sessionTokenOk
                      ? "Session token authentication: verified."
                      : "Session token authentication: failed."}
                  </Text>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Choose a plan
                </Text>

                <InlineStack gap="300" wrap>
                  <PlanButton shop={shop} plan="starter" label="Starter — $29/mo" />
                  <PlanButton shop={shop} plan="growth" label="Growth — $79/mo" variant="primary" />
                  <PlanButton shop={shop} plan="scale" label="Scale — $199/mo" />
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisProvider>
  );
}

function PlanButton({
  shop,
  plan,
  label,
  variant,
}: {
  shop: string | undefined;
  plan: "starter" | "growth" | "scale";
  label: string;
  variant?: "primary";
}) {
  const disabled = !shop;

  const href = shop
    ? `/billing/subscribe?shop=${encodeURIComponent(shop)}&plan=${plan}`
    : undefined;

  return (
    <Button variant={variant} disabled={disabled} url={href} external={false}>
      {label}
    </Button>
  );
}