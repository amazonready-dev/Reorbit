import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/shopify/session-ping")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({ ok: true });
      },
    },
  },
});