import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    // Shopify embedded apps should always land inside main app route
    throw redirect({
      to: "/app",
    });
  },
});