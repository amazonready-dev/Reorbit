import { createFileRoute } from "@tanstack/react-router";
import { jwtVerify, createRemoteJWKSet } from "jose";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;

// Shopify session token verification (App Bridge)
const JWKS = createRemoteJWKSet(
  new URL("https://shopify.dev/api/auth/keys")
);

async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    audience: SHOPIFY_API_KEY,
  });

  return payload;
}

export const Route = createFileRoute("/api/shopify/session-ping")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = request.headers.get("Authorization");

        if (!auth || !auth.startsWith("Bearer ")) {
          return new Response("Missing session token", { status: 401 });
        }

        const token = auth.replace("Bearer ", "");

        try {
          await verifySessionToken(token);

          return Response.json({ ok: true });
        } catch (err) {
          console.error("❌ Session token invalid:", err);
          return new Response("Invalid session token", { status: 401 });
        }
      },
    },
  },
});